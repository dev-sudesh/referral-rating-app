import { useState, useEffect, useCallback } from 'react';
import FirebaseStoreService from '../services/firebase/FirebaseStoreService';
import FirebaseInitializer from '../utils/FirebaseInitializer';

export const useDataRecovery = () => {
    const [isRecovering, setIsRecovering] = useState(false);
    const [wasRecovered, setWasRecovered] = useState(false);
    const [recoveryError, setRecoveryError] = useState(null);

    // Check if data was recovered on app start
    const checkRecovery = useCallback(async () => {
        setIsRecovering(true);
        setRecoveryError(null);

        try {
            // Wait for Firebase to be properly initialized
            await FirebaseInitializer.waitForFirebase(15, 200);

            const recovered = await FirebaseStoreService.checkDataRecovery();
            setWasRecovered(recovered);

            if (recovered) {
            } else {
            }

            return recovered;
        } catch (error) {
            console.warn('Error checking data recovery:', error.message || error);
            setRecoveryError(error.message || 'Unknown error occurred');
            // Don't fail the app if data recovery fails
            return false;
        } finally {
            setIsRecovering(false);
        }
    }, []);

    // Force data recovery
    const forceRecovery = useCallback(async () => {
        setIsRecovering(true);
        setRecoveryError(null);

        try {
            // Wait for Firebase to be properly initialized
            await FirebaseInitializer.waitForFirebase(15, 200);

            const recovered = await FirebaseStoreService.forceDataRecovery();
            setWasRecovered(recovered);

            if (recovered) {
            } else {
            }

            return recovered;
        } catch (error) {
            console.warn('Error forcing data recovery:', error.message || error);
            setRecoveryError(error.message || 'Unknown error occurred');
            return false;
        } finally {
            setIsRecovering(false);
        }
    }, []);

    // Initialize recovery check on mount, but with a delay to ensure Firebase is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            checkRecovery();
        }, 1000); // Wait 1 second for Firebase to initialize

        return () => clearTimeout(timer);
    }, [checkRecovery]);

    return {
        isRecovering,
        wasRecovered,
        recoveryError,
        checkRecovery,
        forceRecovery,
    };
};
