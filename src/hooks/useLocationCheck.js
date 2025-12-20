import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import LocationUtils from '../utils/LocationUtils';
import PermissionController from '../controllers/permissions/PermissionController';

/**
 * Hook to handle comprehensive location checking flow
 * Checks permissions first, then GPS status, and manages error states
 */
const useLocationCheck = () => {
    const [isChecking, setIsChecking] = useState(false);
    const [locationStatus, setLocationStatus] = useState({
        permissionGranted: false,
        gpsEnabled: false,
        canProceed: false,
        errorType: null, // 'permission' | 'gps' | null
    });

    const checkLocationStatus = async () => {
        setIsChecking(true);

        try {

            // Step 1: Check location permission
            const hasPermission = await LocationUtils.checkLocationPermission();

            if (!hasPermission) {
                setLocationStatus({
                    permissionGranted: false,
                    gpsEnabled: false,
                    canProceed: false,
                    errorType: 'permission',
                });
                PermissionController.getState().setLocationPermissionGranted(false);
                PermissionController.getState().setShowPermissionError(true);
                return;
            }

            PermissionController.getState().setLocationPermissionGranted(true);

            // Step 2: Check GPS/location services
            const isGpsEnabled = await LocationUtils.checkLocationServiceEnabled();

            if (!isGpsEnabled) {
                setLocationStatus({
                    permissionGranted: true,
                    gpsEnabled: false,
                    canProceed: false,
                    errorType: 'gps',
                });
                PermissionController.getState().setLocationServiceEnabled(false);
                PermissionController.getState().setShowPermissionError(true);
                return;
            }

            PermissionController.getState().setLocationServiceEnabled(true);

            // Step 3: All checks passed
            setLocationStatus({
                permissionGranted: true,
                gpsEnabled: true,
                canProceed: true,
                errorType: null,
            });
            PermissionController.getState().setShowPermissionError(false);

        } catch (error) {
            // Error during location check
            setLocationStatus({
                permissionGranted: false,
                gpsEnabled: false,
                canProceed: false,
                errorType: 'permission', // Default to permission error
            });
            PermissionController.getState().setShowPermissionError(true);
        } finally {
            setIsChecking(false);
        }
    };

    const retryLocationCheck = async () => {
        await checkLocationStatus();
    };

    const handlePermissionGranted = async () => {
        await checkLocationStatus();
    };

    const handleGpsEnabled = async () => {
        await checkLocationStatus();
    };

    // Listen to app state changes to recheck when app becomes active
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                checkLocationStatus();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    // Initial check on mount
    useEffect(() => {
        checkLocationStatus();
    }, []);

    return {
        isChecking,
        locationStatus,
        checkLocationStatus,
        retryLocationCheck,
        handlePermissionGranted,
        handleGpsEnabled,
    };
};

export default useLocationCheck;
