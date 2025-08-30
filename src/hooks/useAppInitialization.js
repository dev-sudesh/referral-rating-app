import { useEffect, useState, useCallback, useMemo } from 'react';
import DeviceInfo from '../utils/deviceInfo/DeviceInfo';
import FirebaseInitializer from '../utils/FirebaseInitializer';
import MapUtils from '../utils/MapUtils';
import NativeModuleUtils from '../utils/nativeModules/NativeModuleUtils';
import { useFirebaseStore } from './useFirebaseStore';

/**
 * Custom hook for handling app initialization with optimized performance
 * Manages Firebase, DeviceInfo, MapUtils, and anonymous user setup in parallel
 */
export const useAppInitialization = () => {
    const [state, setState] = useState({
        firebaseReady: false,
        error: null,
        isInitializing: true,
        initializationStep: 'starting'
    });

    // Initialize Firebase store with memoization
    const { initializeAnonymousUser } = useFirebaseStore();

    // Memoize the user initialization function to prevent unnecessary re-renders
    const initializeUser = useCallback(async () => {
        try {
            await initializeAnonymousUser({
                appVersion: '1.0.0',
                platform: 'react-native',
            });
            return { success: true };
        } catch (error) {
            console.warn('Failed to initialize anonymous user:', error);
            return { success: false, error };
        }
    }, [initializeAnonymousUser]);

    // Optimized initialization function with parallel execution
    const initializeApp = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isInitializing: true, initializationStep: 'hiding_splash' }));

            setState(prev => ({ ...prev, initializationStep: 'initializing_services' }));

            // Initialize core services in parallel for better performance
            const [firebaseResult, userResult] = await Promise.allSettled([
                FirebaseInitializer.initialize(),
                initializeUser()
            ]);

            // Initialize synchronous services
            DeviceInfo.init();
            MapUtils.init();

            // Handle results
            const hasFirebaseError = firebaseResult.status === 'rejected';
            const hasUserError = userResult.status === 'rejected';

            if (hasFirebaseError) {
                console.error('Firebase initialization failed:', firebaseResult.reason);
            }

            if (hasUserError) {
                console.warn('User initialization failed:', userResult.reason);
            }

            // Update state once with all results
            setState({
                firebaseReady: !hasFirebaseError,
                error: hasFirebaseError ? firebaseResult.reason?.message : null,
                isInitializing: false,
                initializationStep: 'completed'
            });

        } catch (err) {
            console.error('App initialization error:', err);
            setState({
                firebaseReady: false,
                error: err.message,
                isInitializing: false,
                initializationStep: 'error'
            });
        }
    }, [initializeUser]);

    // Memoize the return object to prevent unnecessary re-renders
    const result = useMemo(() => ({
        firebaseReady: state.firebaseReady,
        error: state.error,
        isInitializing: state.isInitializing,
        initializationStep: state.initializationStep
    }), [state.firebaseReady, state.error, state.isInitializing, state.initializationStep]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    return result;
};
