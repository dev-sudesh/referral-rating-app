import { Platform } from 'react-native';
import { getApps, getApp } from '@react-native-firebase/app';

/**
 * Firebase Initializer - Ensures Firebase is properly set up before use
 */
class FirebaseInitializer {
    static isInitialized = false;
    static initPromise = null;

    static async initialize() {
        if (this.isInitialized) {
            return Promise.resolve();
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    static async _doInitialize() {
        try {
            // Use modular SDK API instead of deprecated namespaced API
            const apps = getApps();

            // Wait for Firebase to be ready
            if (!apps.length) {
                throw new Error('Firebase not initialized. Check your config files.');
            }

            this.isInitialized = true;
            return true;
        } catch (error) {
            // Firebase initialization error
            throw error;
        }
    }
}

export default FirebaseInitializer;
