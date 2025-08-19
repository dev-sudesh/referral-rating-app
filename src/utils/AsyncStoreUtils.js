import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

/**
 * AsyncStore Utility
 * Provides secure storage using React Native Keychain for sensitive data (keys, tokens, credentials)
 * and AsyncStorage for regular app data (preferences, settings, etc.)
 */
const AsyncStoreUtils = {
    // Predefined keys for common storage items
    Keys: {
        IS_LOGIN: 'is_login',
        IS_ONBOARDING_COMPLETED: 'is_onboarding_completed',
        USER_PREFERENCES: 'user_preferences',
        APP_SETTINGS: 'app_settings',
        LAST_LOGIN_DATE: 'last_login_date',
        USER_DETAILS: 'user_details',
    },

    // Secure Keys - stored in Keychain
    SecureKeys: {
        ACCESS_TOKEN: 'access_token',
        REFRESH_TOKEN: 'refresh_token',
        USER_CREDENTIALS: 'user_credentials',
        API_KEY: 'api_key',
        BIOMETRIC_DATA: 'biometric_data',
    },

    // ==========================================
    // REGULAR STORAGE METHODS (AsyncStorage)
    // ==========================================

    /**
     * Get an item from AsyncStorage
     * @param {string} key - The key to retrieve
     * @returns {Promise<string|null>} - The stored value or null
     */
    getItem: async (key) => {
        try {
            const value = await AsyncStorage.getItem(key);
            if (value) {
                if (value.startsWith('{') && value.endsWith('}')) {
                    return JSON.parse(value);
                }
                return value;
            }
            return null;
        } catch (error) {
            console.error(`AsyncStore: Error getting item with key "${key}":`, error);
            return null;
        }
    },

    /**
     * Set an item in AsyncStorage
     * @param {string} key - The key to store
     * @param {string} value - The value to store
     * @returns {Promise<boolean>} - Success status
     */
    setItem: async (key, value) => {
        try {
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            await AsyncStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error(`AsyncStore: Error setting item with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Remove an item from AsyncStorage
     * @param {string} key - The key to remove
     * @returns {Promise<boolean>} - Success status
     */
    removeItem: async (key) => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`AsyncStore: Error removing item with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Store an object as JSON in AsyncStorage
     * @param {string} key - The key to store
     * @param {Object} object - The object to store
     * @returns {Promise<boolean>} - Success status
     */
    setObject: async (key, object) => {
        try {
            const jsonString = JSON.stringify(object);
            await AsyncStorage.setItem(key, jsonString);
            return true;
        } catch (error) {
            console.error(`AsyncStore: Error setting object with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Get an object from AsyncStorage (parses JSON)
     * @param {string} key - The key to retrieve
     * @returns {Promise<Object|null>} - The parsed object or null
     */
    getObject: async (key) => {
        try {
            const jsonString = await AsyncStorage.getItem(key);
            if (jsonString) {
                return JSON.parse(jsonString);
            }
            return null;
        } catch (error) {
            console.error(`AsyncStore: Error getting object with key "${key}":`, error);
            return null;
        }
    },

    // ==========================================
    // SECURE STORAGE METHODS (Keychain)
    // ==========================================

    /**
     * Store sensitive data securely in Keychain
     * @param {string} key - The key to store
     * @param {string} value - The sensitive value to store
     * @param {Object} options - Additional keychain options
     * @returns {Promise<boolean>} - Success status
     */
    setSecureItem: async (key, value, options = {}) => {
        try {
            const keychainOptions = {
                service: 'ReferralRatingApp',
                accessGroup: undefined,
                ...options,
            };

            await Keychain.setInternetCredentials(key, key, value, keychainOptions);
            return true;
        } catch (error) {
            console.error(`AsyncStore: Error setting secure item with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Get sensitive data from Keychain
     * @param {string} key - The key to retrieve
     * @returns {Promise<string|null>} - The stored value or null
     */
    getSecureItem: async (key) => {
        try {
            const credentials = await Keychain.getInternetCredentials(key);
            if (credentials && credentials.password) {
                return credentials.password;
            }
            return null;
        } catch (error) {
            console.error(`AsyncStore: Error getting secure item with key "${key}":`, error);
            return null;
        }
    },

    /**
     * Remove sensitive data from Keychain
     * @param {string} key - The key to remove
     * @returns {Promise<boolean>} - Success status
     */
    removeSecureItem: async (key) => {
        try {
            await Keychain.resetInternetCredentials(key);
            return true;
        } catch (error) {
            console.error(`AsyncStore: Error removing secure item with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Store user credentials securely (username and password)
     * @param {string} username - The username
     * @param {string} password - The password
     * @param {Object} options - Additional keychain options
     * @returns {Promise<boolean>} - Success status
     */
    setCredentials: async (username, password, options = {}) => {
        try {
            const keychainOptions = {
                service: 'ReferralRatingApp',
                accessGroup: undefined,
                ...options,
            };

            await Keychain.setInternetCredentials(
                AsyncStoreUtils.SecureKeys.USER_CREDENTIALS,
                username,
                password,
                keychainOptions
            );
            return true;
        } catch (error) {
            console.error('AsyncStore: Error setting credentials:', error);
            return false;
        }
    },

    /**
     * Get user credentials from Keychain
     * @returns {Promise<Object|null>} - Object with username and password or null
     */
    getCredentials: async () => {
        try {
            const credentials = await Keychain.getInternetCredentials(
                AsyncStoreUtils.SecureKeys.USER_CREDENTIALS
            );
            if (credentials) {
                return {
                    username: credentials.username,
                    password: credentials.password,
                };
            }
            return null;
        } catch (error) {
            console.error('AsyncStore: Error getting credentials:', error);
            return null;
        }
    },

    /**
     * Store an object securely in Keychain (converts to JSON)
     * @param {string} key - The key to store
     * @param {Object} object - The object to store securely
     * @param {Object} options - Additional keychain options
     * @returns {Promise<boolean>} - Success status
     */
    setSecureObject: async (key, object, options = {}) => {
        try {
            const jsonString = JSON.stringify(object);
            return await AsyncStoreUtils.setSecureItem(key, jsonString, options);
        } catch (error) {
            console.error(`AsyncStore: Error setting secure object with key "${key}":`, error);
            return false;
        }
    },

    /**
     * Get an object from Keychain (parses JSON)
     * @param {string} key - The key to retrieve
     * @returns {Promise<Object|null>} - The parsed object or null
     */
    getSecureObject: async (key) => {
        try {
            const jsonString = await AsyncStoreUtils.getSecureItem(key);
            if (jsonString) {
                return JSON.parse(jsonString);
            }
            return null;
        } catch (error) {
            console.error(`AsyncStore: Error getting secure object with key "${key}":`, error);
            return null;
        }
    },

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Clear all AsyncStorage data
     * @returns {Promise<boolean>} - Success status
     */
    clearAsyncStorage: async () => {
        try {
            await AsyncStorage.clear();
            return true;
        } catch (error) {
            console.error('AsyncStore: Error clearing AsyncStorage:', error);
            return false;
        }
    },

    /**
     * Clear all Keychain data
     * @returns {Promise<boolean>} - Success status
     */
    clearKeychain: async () => {
        try {
            await Keychain.resetInternetCredentials();
            return true;
        } catch (error) {
            console.error('AsyncStore: Error clearing Keychain:', error);
            return false;
        }
    },

    /**
     * Clear all storage (both AsyncStorage and Keychain)
     * @returns {Promise<boolean>} - Success status
     */
    clearAll: async () => {
        try {
            const asyncStorageCleared = await AsyncStoreUtils.clearAsyncStorage();
            const keychainCleared = await AsyncStoreUtils.clearKeychain();
            return asyncStorageCleared && keychainCleared;
        } catch (error) {
            console.error('AsyncStore: Error clearing all storage:', error);
            return false;
        }
    },

    /**
     * Get all keys from AsyncStorage
     * @returns {Promise<string[]>} - Array of keys
     */
    getAllKeys: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys || [];
        } catch (error) {
            console.error('AsyncStore: Error getting all keys:', error);
            return [];
        }
    },

    /**
     * Check if Keychain/biometric authentication is available
     * @returns {Promise<boolean>} - Availability status
     */
    isBiometricAuthAvailable: async () => {
        try {
            const biometryType = await Keychain.getSupportedBiometryType();
            return biometryType !== null;
        } catch (error) {
            console.error('AsyncStore: Error checking biometric availability:', error);
            return false;
        }
    },

    /**
     * Get the type of biometric authentication available
     * @returns {Promise<string|null>} - Biometry type or null
     */
    getBiometryType: async () => {
        try {
            return await Keychain.getSupportedBiometryType();
        } catch (error) {
            console.error('AsyncStore: Error getting biometry type:', error);
            return null;
        }
    },

    // ==========================================
    // CONVENIENCE METHODS FOR COMMON OPERATIONS
    // ==========================================

    /**
     * Store authentication tokens securely
     * @param {string} accessToken - The access token
     * @param {string} refreshToken - The refresh token (optional)
     * @returns {Promise<boolean>} - Success status
     */
    setAuthTokens: async (accessToken, refreshToken = null) => {
        try {
            const accessTokenSet = await AsyncStoreUtils.setSecureItem(
                AsyncStoreUtils.SecureKeys.ACCESS_TOKEN,
                accessToken
            );

            let refreshTokenSet = true;
            if (refreshToken) {
                refreshTokenSet = await AsyncStoreUtils.setSecureItem(
                    AsyncStoreUtils.SecureKeys.REFRESH_TOKEN,
                    refreshToken
                );
            }

            return accessTokenSet && refreshTokenSet;
        } catch (error) {
            console.error('AsyncStore: Error setting auth tokens:', error);
            return false;
        }
    },

    /**
     * Get authentication tokens
     * @returns {Promise<Object|null>} - Object with access and refresh tokens or null
     */
    getAuthTokens: async () => {
        try {
            const accessToken = await AsyncStoreUtils.getSecureItem(
                AsyncStoreUtils.SecureKeys.ACCESS_TOKEN
            );
            const refreshToken = await AsyncStoreUtils.getSecureItem(
                AsyncStoreUtils.SecureKeys.REFRESH_TOKEN
            );

            if (accessToken) {
                return {
                    accessToken,
                    refreshToken,
                };
            }
            return null;
        } catch (error) {
            console.error('AsyncStore: Error getting auth tokens:', error);
            return null;
        }
    },

    /**
     * Clear authentication tokens
     * @returns {Promise<boolean>} - Success status
     */
    clearAuthTokens: async () => {
        try {
            const accessTokenRemoved = await AsyncStoreUtils.removeSecureItem(
                AsyncStoreUtils.SecureKeys.ACCESS_TOKEN
            );
            const refreshTokenRemoved = await AsyncStoreUtils.removeSecureItem(
                AsyncStoreUtils.SecureKeys.REFRESH_TOKEN
            );
            return accessTokenRemoved && refreshTokenRemoved;
        } catch (error) {
            console.error('AsyncStore: Error clearing auth tokens:', error);
            return false;
        }
    },
};

export default AsyncStoreUtils;