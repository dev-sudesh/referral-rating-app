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

            console.log('Firebase initialized successfully');
            console.log('Firebase apps:', apps.map(app => app.name));

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
            throw error;
        }
    }

    static async waitForFirebase(maxRetries = 10, retryDelay = 100) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.initialize();
                return true;
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return false;
    }
}

export default FirebaseInitializer;
