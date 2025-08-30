import { Platform } from 'react-native';
import { getApps, getApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

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

            // Test Firestore connectivity
            try {
                const db = firestore();
                // Try a simple operation to test connectivity
                await db.collection('_test_connection').limit(1).get();
            } catch (firestoreError) {
                console.warn('Firestore connectivity test failed, but continuing:', firestoreError.message);
                // Don't throw error, just warn - Firestore might be temporarily unavailable
            }

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

                // Additional check for Firestore availability
                try {
                    const db = firestore();
                    await db.collection('_test_connection').limit(1).get();
                    return true;
                } catch (firestoreError) {
                    if (i === maxRetries - 1) {
                        console.warn('Firestore not available after retries, but continuing');
                        return true; // Continue anyway
                    }
                    // Wait and retry
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return false;
    }

    static async waitForFirestore(maxRetries = 15, retryDelay = 200) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const db = firestore();
                await db.collection('_test_connection').limit(1).get();
                return true;
            } catch (error) {
                if (i === maxRetries - 1) {
                    console.warn('Firestore not available after retries');
                    return false;
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        return false;
    }
}

export default FirebaseInitializer;
