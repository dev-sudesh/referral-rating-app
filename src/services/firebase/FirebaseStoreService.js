import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import FirebaseInitializer from '../../utils/FirebaseInitializer';
import { faker } from '@faker-js/faker';
import Constants from '../../constants/data';

// Get Firestore instance using new modular API
const db = firestore();

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    USER_FILTERS: 'user_filters',
    SEARCH_HISTORY: 'search_history',
    PLACES: 'places',
    USER_LOCATIONS: 'user_locations',
    REFERRED_PLACES: 'referred_places',
    DEVICE_MAPPINGS: 'device_mappings', // New collection for device-to-user mapping
};

// Helper function to handle Firestore errors gracefully
const handleFirestoreError = (error, operation) => {
    if (error.code === 'firestore/unavailable') {
        console.warn(`Firestore service unavailable for ${operation}, will retry later`);
        return null;
    }

    // Handle TypeError and other runtime errors
    if (error instanceof TypeError) {
        console.warn(`Type error in ${operation}:`, error.message);
        return null;
    }

    console.error(`Error in ${operation}:`, error);
    throw error;
};

// Helper function to ensure Firebase is ready before operations
const ensureFirebaseReady = async () => {
    try {
        await FirebaseInitializer.waitForFirebase(5, 100);
        return true;
    } catch (error) {
        console.warn('Firebase not ready, but continuing:', error.message);
        return false;
    }
};

// Generate device fingerprint for recovery
const generateDeviceFingerprint = async () => {
    try {
        const deviceId = await DeviceInfo.getUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const osVersion = DeviceInfo.getSystemVersion();
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();

        // Create a unique fingerprint based on device characteristics
        const fingerprint = deviceId;

        return {
            fingerprint,
            deviceInfo: {
                deviceId,
                deviceModel,
                osVersion,
                appVersion,
                buildNumber,
            },
        };
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        return null;
    }
};

// Store device mapping for recovery
const storeDeviceMapping = async (userId, deviceFingerprint) => {
    try {
        await ensureFirebaseReady();
        const docRef = db.collection(COLLECTIONS.DEVICE_MAPPINGS).doc(deviceFingerprint);
        await docRef.set({
            userId,
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
        handleFirestoreError(error, 'storeDeviceMapping');
    }
};

// Find existing user by device fingerprint
const findUserByDeviceFingerprint = async (deviceFingerprint) => {
    try {
        await ensureFirebaseReady();
        const docRef = db.collection(COLLECTIONS.DEVICE_MAPPINGS).doc(deviceFingerprint);
        const doc = await docRef.get();
        if (doc.exists) {
            return doc.data().userId;
        }
        return null;
    } catch (error) {
        handleFirestoreError(error, 'findUserByDeviceFingerprint');
        return null;
    }
};

// Generate anonymous user ID
const generateAnonymousUserId = () => {
    // const deviceId = await DeviceInfo.getUniqueId();
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create anonymous user ID with recovery
const getAnonymousUserId = async () => {
    try {
        let userId = await AsyncStorage.getItem('anonymous_user_id');

        if (!userId) {
            // Try to recover user ID from device fingerprint
            const deviceFingerprint = await generateDeviceFingerprint();
            if (deviceFingerprint) {
                const existingUserId = await findUserByDeviceFingerprint(deviceFingerprint.fingerprint);
                if (existingUserId) {
                    userId = existingUserId;
                } else {
                    userId = generateAnonymousUserId();
                    await storeDeviceMapping(userId, deviceFingerprint.fingerprint);
                }
            } else {
                userId = generateAnonymousUserId();
            }

            await AsyncStorage.setItem('anonymous_user_id', userId);
        }

        return userId;
    } catch (error) {
        console.error('Error getting anonymous user ID:', error);
        // Fallback to generating a new ID
        const fallbackId = generateAnonymousUserId();
        await AsyncStorage.setItem('anonymous_user_id', fallbackId);
        return fallbackId;
    }
};

// Store anonymous user information
const storeAnonymousUser = async (userInfo = {}) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const deviceInfo = await generateDeviceFingerprint();

        const userDoc = {
            userId,
            deviceInfo: deviceInfo?.deviceInfo || {},
            appVersion: userInfo.appVersion || '1.0.0',
            platform: userInfo.platform || 'react-native',
            createdAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firestore.FieldValue.serverTimestamp(),
        };

        const docRef = db.collection(COLLECTIONS.USERS).doc(userId);
        await docRef.set(userDoc, { merge: true });
        return userId;
    } catch (error) {
        handleFirestoreError(error, 'storeAnonymousUser');
        throw error;
    }
};

// Update last login timestamp
const updateLastLogin = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();

        const docRef = db.collection(COLLECTIONS.USERS).doc(userId);
        await docRef.update({
            lastLoginAt: firestore.FieldValue.serverTimestamp(),
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return true;
    } catch (error) {
        handleFirestoreError(error, 'updateLastLogin');
        throw error;
    }
};

// Store user filters
const storeUserFilters = async (filters) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const filterDoc = {
            userId,
            filters,
            updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        const docRef = db.collection(COLLECTIONS.USER_FILTERS).doc(userId);
        await docRef.set(filterDoc, { merge: true });
        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeUserFilters');
        throw error;
    }
};

// Get user filters
const getUserFilters = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = db.collection(COLLECTIONS.USER_FILTERS).doc(userId);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            return data && data.filters ? data.filters : [];
        }
        return [];
    } catch (error) {
        handleFirestoreError(error, 'getUserFilters');
        return [];
    }
};

// Store search keyword
const storeSearchKeyword = async (keyword) => {
    try {
        await ensureFirebaseReady();
        const searchDoc = {
            keyword: keyword.toLowerCase().trim(),
            searchCount: firestore.FieldValue.increment(1),
            lastSearched: firestore.FieldValue.serverTimestamp(),
            createdAt: firestore.FieldValue.serverTimestamp(),
        };

        // Use the keyword as document ID for easy updates
        const docRef = db.collection(COLLECTIONS.SEARCH_HISTORY);
        await docRef.set(searchDoc, { merge: true });

        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeSearchKeyword');
        throw error;
    }
};

// Get search suggestions
const getSearchSuggestions = async (limit = 10) => {
    try {
        await ensureFirebaseReady();
        const collectionRef = db.collection(COLLECTIONS.SEARCH_HISTORY);

        // Get all documents and filter client-side to avoid index requirements
        const snapshot = await collectionRef.get();

        const suggestions = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Only include documents that belong to this user (check document ID)
            if (data.keyword) {
                suggestions.push({
                    id: doc.id,
                    keyword: data.keyword,
                    searchCount: data.searchCount || 1,
                    lastSearched: data.lastSearched?.toDate(),
                });
            }
        });

        // Sort client-side by lastSearched (most recent first)
        suggestions.sort((a, b) => {
            if (!a.lastSearched && !b.lastSearched) return 0;
            if (!a.lastSearched) return 1;
            if (!b.lastSearched) return -1;
            return b.lastSearched.getTime() - a.lastSearched.getTime();
        });

        // Return only the requested limit
        return suggestions.slice(0, limit);
    } catch (error) {
        handleFirestoreError(error, 'getSearchSuggestions');
        return [];
    }
};

// Store last location
const storeLastLocation = async (location) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const locationDoc = {
            userId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || 0,
            address: location.address || '',
            updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        const docRef = db.collection(COLLECTIONS.USER_LOCATIONS).doc(userId);
        await docRef.set(locationDoc, { merge: true });
        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeLastLocation');
        throw error;
    }
};

// Get last location
const getLastLocation = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = db.collection(COLLECTIONS.USER_LOCATIONS).doc(userId);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            return {
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                address: data.address,
                updatedAt: data.updatedAt?.toDate(),
            };
        }
        return null;
    } catch (error) {
        handleFirestoreError(error, 'getLastLocation');
        return null;
    }
};

// Store referred place
const storeReferredPlace = async (place) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        // add place to user referred places
        if (!place.isReferred) {
            const referredPlacesDocRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(userId);
            await referredPlacesDocRef.set({
                [place.id]: place,
            }, { merge: true });
        } else {
            const referredPlacesDocRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(userId);
            await referredPlacesDocRef.delete({
                [place.id]: place,
            });
        }

        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeReferredPlace');
        return false;
    }
};

const isReferredPlace = async (placeId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const collectionRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(userId);
        const snapshot = await collectionRef.get();
        const referredPlaces = snapshot.data() || {};
        return referredPlaces[placeId] ? true : false;
    } catch (error) {
        handleFirestoreError(error, 'isReferredPlace');
        return false;
    }
};

// Get referred places
const getReferredPlaces = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const collectionRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(userId);

        // Get all documents and filter client-side to avoid index requirements
        const snapshot = await collectionRef.get();
        const referredPlaces = snapshot.data() || {};

        const places = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Only include documents that belong to this user (check document ID)
            if (referredPlaces[doc.id]) {
                places.push({
                    id: doc.id,
                    placeId: referredPlaces[doc.id].placeId,
                    name: referredPlaces[doc.id].name,
                    address: referredPlaces[doc.id].address,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    category: data.category,
                    rating: data.rating,
                    isVisited: data.isVisited,
                    referredAt: data.referredAt?.toDate(),
                });
            }
        });

        // Sort client-side by referredAt (most recent first)
        places.sort((a, b) => {
            if (!a.referredAt && !b.referredAt) return 0;
            if (!a.referredAt) return 1;
            if (!b.referredAt) return -1;
            return b.referredAt.getTime() - a.referredAt.getTime();
        });

        return places;
    } catch (error) {
        handleFirestoreError(error, 'getReferredPlaces');
        return [];
    }
};

// Mark place as visited
const markPlaceAsVisited = async (placeId, isVisited = true) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(`${userId}_${placeId}`);

        await docRef.update({
            isVisited,
            updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        return true;
    } catch (error) {
        handleFirestoreError(error, 'markPlaceAsVisited');
        throw error;
    }
};

// Delete referred place
const deleteReferredPlace = async (placeId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = db.collection(COLLECTIONS.REFERRED_PLACES).doc(`${userId}_${placeId}`);
        await docRef.delete();
        return true;
    } catch (error) {
        handleFirestoreError(error, 'deleteReferredPlace');
        throw error;
    }
};

// Get user statistics
const getUserStats = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();

        // Get filters
        const filtersDocRef = db.collection(COLLECTIONS.USER_FILTERS).doc(userId);
        const filtersDoc = await filtersDocRef.get();
        const hasFilters = filtersDoc.exists && Object.keys(filtersDoc.data()?.filters || {}).length > 0;

        // Get search count
        const searchCollectionRef = db.collection(COLLECTIONS.SEARCH_HISTORY);
        const searchSnapshot = await searchCollectionRef.get();
        const searchCount = Array.from(searchSnapshot.docs).filter(doc => doc.id.startsWith(`${userId}_`)).length;

        // Get location
        const locationDocRef = db.collection(COLLECTIONS.USER_LOCATIONS).doc(userId);
        const locationDoc = await locationDocRef.get();
        const hasLocation = locationDoc.exists;

        // Get referred places count
        const placesCollectionRef = db.collection(COLLECTIONS.REFERRED_PLACES);
        const placesSnapshot = await placesCollectionRef.get();
        const userPlaces = Array.from(placesSnapshot.docs).filter(doc => doc.id.startsWith(`${userId}_`));
        const referredPlacesCount = userPlaces.length;

        // Get visited places count
        const visitedPlacesCount = userPlaces.filter(doc => doc.data().isVisited === true).length;

        return {
            hasFilters,
            searchCount,
            hasLocation,
            referredPlacesCount,
            visitedPlacesCount,
        };
    } catch (error) {
        handleFirestoreError(error, 'getUserStats');
        return {
            hasFilters: false,
            searchCount: 0,
            hasLocation: false,
            referredPlacesCount: 0,
            visitedPlacesCount: 0,
        };
    }
};

// Clear all user data (for privacy/cleanup)
const clearUserData = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const batch = db.batch();

        // Delete user document
        const userDocRef = db.collection(COLLECTIONS.USERS).doc(userId);
        batch.delete(userDocRef);

        // Delete user filters
        const filtersDocRef = db.collection(COLLECTIONS.USER_FILTERS).doc(userId);
        batch.delete(filtersDocRef);

        // Delete search history
        const searchCollectionRef = db.collection(COLLECTIONS.SEARCH_HISTORY);
        const searchSnapshot = await searchCollectionRef.get();
        searchSnapshot.forEach((doc) => {
            if (doc.id.startsWith(`${userId}_`)) {
                batch.delete(doc.ref);
            }
        });

        // Delete user location
        const locationDocRef = db.collection(COLLECTIONS.USER_LOCATIONS).doc(userId);
        batch.delete(locationDocRef);

        // Delete referred places
        const placesCollectionRef = db.collection(COLLECTIONS.REFERRED_PLACES);
        const placesSnapshot = await placesCollectionRef.get();
        placesSnapshot.forEach((doc) => {
            if (doc.id.startsWith(`${userId}_`)) {
                batch.delete(doc.ref);
            }
        });

        // Delete device mappings
        const deviceFingerprint = await generateDeviceFingerprint();
        if (deviceFingerprint) {
            const mappingDocRef = db.collection(COLLECTIONS.DEVICE_MAPPINGS).doc(deviceFingerprint.fingerprint);
            batch.delete(mappingDocRef);
        }

        await batch.commit();
        await AsyncStorage.removeItem('anonymous_user_id');
        return true;
    } catch (error) {
        handleFirestoreError(error, 'clearUserData');
        throw error;
    }
};

// Check if user data was recovered
const checkDataRecovery = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const deviceFingerprint = await generateDeviceFingerprint();

        if (!deviceFingerprint) {
            return false;
        }

        // Check if this is a recovered user by looking for device mapping
        const mappingDocRef = db.collection(COLLECTIONS.DEVICE_MAPPINGS).doc(deviceFingerprint.fingerprint);
        const mappingDoc = await mappingDocRef.get();

        if (mappingDoc.exists) {
            const mappingData = mappingDoc.data();
            // Add null check to prevent TypeError
            if (mappingData && mappingData.userId) {
                // If the mapping exists and the user ID matches, this is a recovered user
                return mappingData.userId === userId;
            }
        }

        return false;
    } catch (error) {
        handleFirestoreError(error, 'checkDataRecovery');
        return false;
    }
};

// Force data recovery (useful for testing or manual recovery)
const forceDataRecovery = async () => {
    try {
        await ensureFirebaseReady();
        const deviceFingerprint = await generateDeviceFingerprint();
        if (!deviceFingerprint) {
            return false;
        }

        const existingUserId = await findUserByDeviceFingerprint(deviceFingerprint.fingerprint);
        if (existingUserId) {
            // Store the recovered user ID locally
            await AsyncStorage.setItem('anonymous_user_id', existingUserId);
            return true;
        }

        return false;
    } catch (error) {
        handleFirestoreError(error, 'forceDataRecovery');
        return false;
    }
};

const getPlacesOfCurrentLocation = async (location, limit = 10) => {
    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter longitude in memory
        // This approach reduces the need for complex composite indexes
        const docRef = db.collection(COLLECTIONS.PLACES)
            .where('latitude', '>=', latitude - latRange)
            .where('latitude', '<=', latitude + latRange);

        const snapshot = await docRef.get();

        if (!snapshot.empty) {
            // Filter longitude in memory to avoid composite index requirement
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange
                ).sort((a, b) => a.rank - b.rank)
                .slice(0, limit);
            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            const places = await storeRandomPlacesOfCurrentLocation(location);
            return places.sort((a, b) => a.rank - b.rank)
                .slice(0, 10);
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getPlacesOfCurrentLocation');
        throw error;
    }
};

const createRandomPlaces = async (location) => {
    const { latitude, longitude } = location;
    const randomPlaces = [];
    for (let i = 0; i < 50; i++) {
        let randomLatitude = latitude + (Math.random() * 0.03 - 0.015);
        let randomLongitude = longitude + (Math.random() * 0.03 - 0.015);
        const distance = Math.sqrt(Math.pow(latitude - (latitude + randomLatitude), 2) + Math.pow(longitude - (longitude + randomLongitude), 2));

        const image = faker.image.urlPicsumPhotos({ width: 500, height: 500, blur: 0 });
        const openTime = faker.helpers.arrayElement([
            "Mon - Sat: 08:00 - 23:00",
            "Mon - Fri: 08:00 - 23:00",
            "Sat - Sun: 12:00 - 23:00",
            "Mon - Sun: 08:00 - 23:00",
            "Mon - Thu: 08:00 - 23:00",
            "Fri - Sun: 12:00 - 23:00",
            "Mon - Sun: 12:00 - 23:00",
        ]);

        // get random category from Constants.filters
        const category = faker.helpers.arrayElement(Constants.filters.map(filter => filter.options.map(option => option.id)).flat());


        randomPlaces.push({
            id: faker.string.uuid(),
            name: faker.company.name(),
            address: faker.location.streetAddress(),
            description: faker.lorem.sentence(),
            category: category,
            website: faker.internet.url(),
            openTime: openTime,
            distance: distance, // Distance in meters
            rating: faker.number.int({ min: 1, max: 5 }),
            latitude: randomLatitude,
            longitude: randomLongitude,
            rank: i + 1,
            image: image,
            imageFull: image,
            isReferred: false,
        });
    }
    return randomPlaces;
};
const storeRandomPlacesOfCurrentLocation = async (location) => {
    try {
        const randomPlaces = await createRandomPlaces(location);
        const batch = db.batch();
        randomPlaces.forEach(place => {
            const placeDocRef = db.collection(COLLECTIONS.PLACES).doc();
            batch.set(placeDocRef, place);
        });
        await batch.commit();
        return randomPlaces;
    }
    catch (error) {
        handleFirestoreError(error, 'storeRandomPlacesOfCurrentLocation');
        return [];
    }
};

const getFilteredPlaces = async (location, filters) => {

    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter longitude in memory
        // This approach reduces the need for complex composite indexes
        const docRef = db.collection(COLLECTIONS.PLACES)
            .where('latitude', '>=', latitude - latRange)
            .where('latitude', '<=', latitude + latRange);

        const snapshot = await docRef.get();

        if (!snapshot.empty) {
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange &&
                    filters.includes(place.category)
                ).sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            const places = await storeRandomPlacesOfCurrentLocation(location);
            return places.sort((a, b) => a.rank - b.rank)
                .slice(0, 10);
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getFilteredPlaces');
        return [];
    }
};

const getSearchPlaces = async (location, searchText) => {
    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter in memory
        // This approach avoids the need for complex composite indexes
        const docRef = db.collection(COLLECTIONS.PLACES)
            .where('latitude', '>=', latitude - latRange)
            .where('latitude', '<=', latitude + latRange);

        const snapshot = await docRef.get();

        if (!snapshot.empty) {
            // Filter longitude and search text in memory to avoid composite index requirement
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange &&
                    (place.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        place.address.toLowerCase().includes(searchText.toLowerCase()) ||
                        place.category.toLowerCase().includes(searchText.toLowerCase()))
                )
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            // If no places found, create some random places and search in them
            const places = await storeRandomPlacesOfCurrentLocation(location);
            const filteredPlaces = places
                .filter(place =>
                    place.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    place.address.toLowerCase().includes(searchText.toLowerCase()) ||
                    place.category.toLowerCase().includes(searchText.toLowerCase())
                )
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            for (const place of filteredPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return filteredPlaces;
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getSearchPlaces');
        return [];
    }
};

const FirebaseStoreService = {
    // User management
    getAnonymousUserId,
    storeAnonymousUser,
    initializeAnonymousUser: storeAnonymousUser,
    updateLastLogin,

    // Filters
    storeUserFilters,
    getUserFilters,

    // Search
    storeSearchKeyword,
    getSearchSuggestions,

    // Location
    storeLastLocation,
    getLastLocation,

    // Places
    storeReferredPlace,
    getReferredPlaces,
    markPlaceAsVisited,
    deleteReferredPlace,

    // Statistics
    getUserStats,

    // Data management
    clearUserData,
    checkDataRecovery,
    forceDataRecovery,

    // Device fingerprinting
    generateDeviceFingerprint,
    storeDeviceMapping,
    findUserByDeviceFingerprint,

    // Places
    getPlacesOfCurrentLocation,
    createRandomPlaces,
    storeRandomPlacesOfCurrentLocation,
    isReferredPlace,
    getFilteredPlaces,
    getSearchPlaces,

    // Collections
    COLLECTIONS,
};

export default FirebaseStoreService;
