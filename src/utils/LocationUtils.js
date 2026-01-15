
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import PermissionController from '../controllers/permissions/PermissionController';
import { Platform, Linking, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapsController from '../controllers/maps/MapsController';
import ToastUtils from './ToastUtils';
import AsyncStoreUtils from './AsyncStoreUtils';
import DeviceInfo from 'react-native-device-info';
import UserApiController from '../services/api/controllers/UserApiController';
import {
    isLocationEnabled as checkLocationEnabledNative,
    promptForEnableLocationIfNeeded
} from 'react-native-android-location-enabler';

const locationPermission = Platform.OS === 'ios'
    ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

const grantedPermissions = [RESULTS.GRANTED, RESULTS.GRANTED_WHEN_IN_USE, RESULTS.GRANTED_FOREGROUND];
const isGrantedPermission = (permissionStatus) => {
    const isGranted = grantedPermissions.includes(permissionStatus);
    return isGranted;
}

const LocationUtils = {
    locationPermissionGranted: false,
    init: () => {
        LocationUtils.requestLocationPermission()
    },
    checkLocationServiceEnabled: async () => {
        try {
            if (Platform.OS === 'ios') {
                // For iOS, use DeviceInfo to check if location services are enabled
                return await DeviceInfo.isLocationEnabled();
            } else if (Platform.OS === 'android') {
                // For Android, use the native location enabler for more accurate results
                try {
                    const isEnabled = await checkLocationEnabledNative();
                    return isEnabled;
                } catch (nativeError) {
                    // Fallback to DeviceInfo if native check fails
                    return await DeviceInfo.isLocationEnabled();
                }
            }
            return false;
        } catch (error) {
            // Fallback method: try to get current position with a timeout
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    resolve(false);
                }, 3000);

                Geolocation.getCurrentPosition(
                    (position) => {
                        clearTimeout(timeout);
                        resolve(true);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        // Check specific error codes
                        if (error.code === 1) {
                            // PERMISSION_DENIED - location services might be disabled
                            resolve(false);
                        } else if (error.code === 2) {
                            // POSITION_UNAVAILABLE - location services are disabled
                            resolve(false);
                        } else {
                            // Other errors might indicate location services are disabled
                            resolve(false);
                        }
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 2000,
                        maximumAge: 0,
                    }
                );
            });
        }
    },
    locationServiceEnabler: async () => {
        const isLocationServiceEnabled = await LocationUtils.checkLocationServiceEnabled();

        if (!isLocationServiceEnabled) {
            return await LocationUtils.promptEnableLocationServices();
        }

        return true;
    },
    promptEnableLocationServices: async () => {
        if (Platform.OS === 'android') {
            // For Android, use the native location enabler directly
            try {
                const result = await promptForEnableLocationIfNeeded({
                    interval: 10000,
                    fastInterval: 5000,
                });


                if (result === 'enabled' || result === 'already-enabled') {
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                // Fallback to settings
                try {
                    await LocationUtils.openLocationSettings();
                    return true;
                } catch (settingsError) {
                    return false;
                }
            }
        } else {
            // For iOS, show alert and open settings
            return new Promise((resolve) => {
                const title = 'Location Services Disabled';
                const message = 'Location services are disabled. Please enable them in Settings > Privacy & Security > Location Services to use location-based features.';

                Alert.alert(
                    title,
                    message,
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => resolve(false),
                        },
                        {
                            text: 'Open Settings',
                            onPress: async () => {
                                try {
                                    await LocationUtils.openLocationSettings();
                                    resolve(true);
                                } catch (error) {
                                    resolve(false);
                                }
                            },
                        },
                    ],
                    { cancelable: false }
                );
            });
        }
    },
    openLocationSettings: async () => {
        try {
            if (Platform.OS === 'ios') {
                // For iOS, we need to open the app's location settings
                // iOS doesn't allow direct access to system location settings
                await Linking.openSettings();
            } else if (Platform.OS === 'android') {
                // For Android, try to open location settings directly
                try {
                    // Try the most direct approach first
                    await Linking.openURL('android.settings.LOCATION_SOURCE_SETTINGS');
                    return true;
                } catch (error) {

                    // Try alternative approaches
                    const alternativeUrls = [
                        'android.settings.LOCATION_SETTINGS',
                        'android.settings.PRIVACY_SETTINGS',
                        'android.settings.SECURITY_SETTINGS'
                    ];

                    for (const url of alternativeUrls) {
                        try {
                            await Linking.openURL(url);
                            return true;
                        } catch (altError) {
                            continue;
                        }
                    }

                    // Last resort: open general settings
                    await Linking.openSettings();
                }
            }
            return true;
        } catch (error) {
            ToastUtils.error('Failed to open settings');
            return false;
        }
    },
    enableLocationServicesAndroid: async () => {
        try {
            if (Platform.OS !== 'android') {
                throw new Error('This function is only for Android');
            }


            // Use the native Android location enabler
            // This will show the system dialog to enable location services
            const result = await promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000,
            });


            if (result === 'enabled' || result === 'already-enabled') {
                return true;
            } else {
                throw new Error('Location services not enabled by user');
            }
        } catch (error) {

            // Fallback to manual settings approach
            try {
                await LocationUtils.openLocationSettings();
                return true;
            } catch (settingsError) {
                throw error;
            }
        }
    },
    explainGPSLimitations: () => {
        const message = Platform.OS === 'ios'
            ? 'For security reasons, apps cannot enable GPS directly. Please go to Settings > Privacy & Security > Location Services and turn on location services, then return to this app.'
            : 'For security reasons, apps cannot enable GPS directly. Please go to Settings > Location and turn on location services, then return to this app.';

        return {
            title: 'GPS Cannot Be Enabled Automatically',
            message: message,
            action: 'Open Settings',
            limitation: 'This is a security restriction by the operating system to protect user privacy.'
        };
    },
    enableLocationServicesWithRetry: async (maxRetries = 3) => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Check if location services are enabled
                const isEnabled = await LocationUtils.checkLocationServiceEnabled();

                if (isEnabled) {
                    return true;
                }

                // If not enabled, prompt user to enable
                const userEnabled = await LocationUtils.promptEnableLocationServices();

                if (!userEnabled) {
                    return false;
                }

                // Wait a moment for user to enable services
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check again after user interaction
                const isNowEnabled = await LocationUtils.checkLocationServiceEnabled();

                if (isNowEnabled) {
                    return true;
                }

                if (attempt === maxRetries) {
                    return false;
                }


            } catch (error) {
                if (attempt === maxRetries) {
                    return false;
                }
            }
        }

        return false;
    },
    enableLocationAndPermission: async () => {
        try {
            // Step 1: Enable location services if disabled
            const locationServicesEnabled = await LocationUtils.enableLocationServicesWithRetry();

            if (!locationServicesEnabled) {
                ToastUtils.error('Location services are required but not enabled');
                return false;
            }

            // Step 2: Request location permission
            const permissionGranted = await LocationUtils.requestLocationPermission();

            if (!permissionGranted) {
                ToastUtils.error('Location permission is required but not granted');
                return false;
            }

            // Step 3: Verify everything is working
            const finalCheck = await LocationUtils.checkLocationServiceEnabled();
            const finalPermission = await LocationUtils.checkLocationPermission();

            if (finalCheck && finalPermission) {
                ToastUtils.success('Location services and permissions are ready');
                return true;
            } else {
                ToastUtils.error('Location setup incomplete');
                return false;
            }

        } catch (error) {
            ToastUtils.error('Failed to setup location services');
            return false;
        }
    },
    requestLocationPermission: async () => {
        let permissionStatus = false;
        try {
            permissionStatus = await LocationUtils.checkLocationPermission();
        } catch (error) {
            return false;
        }
        if (!permissionStatus) {
            const requestResult = await request(locationPermission);
            if (isGrantedPermission(requestResult)) {
                LocationUtils.locationPermissionGranted = true;
                PermissionController.getState().setLocationPermissionGranted(true);
                return true;
            }
            PermissionController.getState().setLocationPermissionGranted(false);
            return false;
        }
        return true;
    },
    checkLocationPermission: async () => {
        const permissionStatus = await check(locationPermission);
        if (isGrantedPermission(permissionStatus)) {
            LocationUtils.locationPermissionGranted = true;
            PermissionController.getState().setLocationPermissionGranted(true);
            return true;
        }
        return false;
    },
    getCurrentLocation: async () => {
        Geolocation.getCurrentPosition(
            async (position) => {

                try {
                    console.log("position", position)
                    const { latitude, longitude } = position.coords;
                    const newUserLocation = { latitude, longitude };

                    MapsController.getState().setUserLocation(newUserLocation);
                    AsyncStoreUtils.setItem(AsyncStoreUtils.Keys.USER_LAST_LOCATION, newUserLocation);

                    // Center map on user location
                    const newRegion = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.001,
                    };
                    console.log("newRegion", newRegion)
                    MapsController.getState().setCenterLocation(newRegion);

                    // Save user location to API
                    await UserApiController.saveLocationDirect({ latitude, longitude });
                    console.log("userLocation saved")
                } catch (error) {
                    // Silently fail - location saving to API is not critical
                    // The location is already saved to AsyncStorage
                    console.log("error", error)
                    throw error;
                }
            },
            (error) => {
                MapsController.getState().setUserLocation(null);

                switch (error.code) {
                    case 1:
                        ToastUtils.error('Location access denied');
                        break;
                    case 2:
                        ToastUtils.error('Location unavailable');
                        break;
                    case 3:
                        ToastUtils.error('Location request timeout');
                        break;
                    default:
                        ToastUtils.error('Failed to get location');
                        break;
                }

                // Fallback to default location
                MapsController.getState().setUserLocation({
                    latitude: 37.78825,
                    longitude: -122.4324,
                });
            },
            {
                enableHighAccuracy: true,
            }
        );
    }
}

export default LocationUtils;