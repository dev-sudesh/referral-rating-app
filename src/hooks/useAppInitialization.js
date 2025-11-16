import { useEffect, useState, useCallback, useMemo } from 'react';
import FirebaseInitializer from '../utils/FirebaseInitializer';
import MapUtils from '../utils/MapUtils';

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


    // Optimized initialization function with parallel execution
    const initializeApp = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isInitializing: true, initializationStep: 'hiding_splash' }));

            setState(prev => ({ ...prev, initializationStep: 'initializing_services' }));

            // Initialize core services in parallel for better performance
            const firebaseResult = await FirebaseInitializer.initialize();

            // Initialize synchronous services
            MapUtils.init();

            // Handle results
            const hasFirebaseError = firebaseResult.status === 'rejected';

            if (hasFirebaseError) {
                console.error('Firebase initialization failed:', firebaseResult.reason);
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
    }, []);

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
