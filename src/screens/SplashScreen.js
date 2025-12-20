import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, StatusBar } from 'react-native';
import { theme } from '../constants/theme';
import AppImage from '../components/common/AppImage';
import LoadingIndicator from '../components/animated/LoadingIndicator';
import ScreenContainer from '../components/common/ScreenContainer';
import BuildVersion from '../components/ui/BuildVersion';
import ImageAsset from '../assets/images/ImageAsset';
import Constants from '../constants/data';
import AsyncStoreUtils from '../utils/AsyncStoreUtils';

import { useAppInitialization } from '../hooks/useAppInitialization';
import useLocationCheck from '../hooks/useLocationCheck';
import NativeModuleUtils from '../utils/nativeModules/NativeModuleUtils';
import LocationUtils from '../utils/LocationUtils';
import PermissionController from '../controllers/permissions/PermissionController';
import MapsController from '../controllers/maps/MapsController';
import ApiController from '../services/api/ApiController';

const SplashScreen = () => {
    const navigation = useNavigation();
    const splashTimeout = useRef();
    const navigationTimeout = useRef();
    const userLocation = MapsController(state => state.userLocation);

    const anonymousTokenMutation = ApiController.anonymousToken();
    const profileMutation = ApiController.profile();
    const nearbyPlacesMutation = ApiController.nearbyPlaces();
    const getAnonymousToken = async () => {
        return await anonymousTokenMutation.mutateAsync();
    }

    // Initialize app services
    const { firebaseReady, error, isInitializing } = useAppInitialization();


    // Initialize location checking
    const {
        isChecking,
        locationStatus,
        checkLocationStatus
    } = useLocationCheck();


    const checkLoginStatus = async () => {
        try {
            const isOnboardingCompleted = await AsyncStoreUtils.getItem(AsyncStoreUtils.Keys.IS_ONBOARDING_COMPLETED);
            if (isOnboardingCompleted) {
                const isLogin = await AsyncStoreUtils.getItem(AsyncStoreUtils.Keys.IS_LOGIN);
                if (isLogin) {
                    navigation.replace(Constants.Screen.Stack.Main);
                } else {
                    navigation.replace(Constants.Screen.Stack.Auth);
                }
            } else {
                navigation.replace(Constants.Screen.Onboarding);
            }
        } catch (error) {
            // Error checking login status
            // Fallback to auth screen on error
            navigation.replace(Constants.Screen.Stack.Auth);
        }
    }

    const getLastSavedLocation = async () => {
        const profileData = await profileMutation.mutateAsync();
        if (profileData?.settings?.last_lat && profileData?.settings?.last_lng) {
            updateUserLocations({ lat: profileData.settings.last_lat, lng: profileData.settings.last_lng });
            return true;
        }
        return false;
    }

    const updateUserLocations = ({ lat, lng }) => {
        // Ensure coordinates are numbers
        const latitude = typeof lat === 'string' ? parseFloat(lat) : Number(lat);
        const longitude = typeof lng === 'string' ? parseFloat(lng) : Number(lng);

        const location = {
            latitude,
            longitude,
        };
        MapsController.getState().setUserLocation(location);

        // Set center location for map centering
        const centerRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        };
        MapsController.getState().setCenterLocation(centerRegion);

        global.userLastLocation = {
            latitude,
            longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        };
    }

    const getLastLocation = async () => {
        const anonymousToken = await getAnonymousToken();
        if (anonymousToken?.token) {
            const hasLastSavedLocation = await getLastSavedLocation();
            if (hasLastSavedLocation) {
                return;
            }
        }
        // Check if location exists in AsyncStorage first
        const storedLocation = await AsyncStoreUtils.getItem(AsyncStoreUtils.Keys.USER_LAST_LOCATION);

        if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
            // Use stored location - no need to fetch
            // Ensure coordinates are numbers (AsyncStorage may return strings)
            const lat = typeof storedLocation.latitude === 'string' ? parseFloat(storedLocation.latitude) : Number(storedLocation.latitude);
            const lng = typeof storedLocation.longitude === 'string' ? parseFloat(storedLocation.longitude) : Number(storedLocation.longitude);
            updateUserLocations({ lat, lng });
        } else {
            // Only fetch if not in storage
            LocationUtils.getCurrentLocation();
        }
    }

    const getStarted = async () => {
        await nearbyPlacesMutation.mutateAsync({ latitude: userLocation.latitude, longitude: userLocation.longitude });
        // Only proceed if location is ready
        if (locationStatus.canProceed) {
            // Add a small delay to ensure smooth transition
            navigationTimeout.current = setTimeout(() => {
                checkLoginStatus();
            }, 1000);
        } else {
        }
    }

    useEffect(() => {
        if (userLocation && locationStatus.canProceed) {
            global.userLastLocation = {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            }
            getStarted();
        }
    }, [JSON.stringify(userLocation), locationStatus.canProceed]);


    useEffect(() => {
        StatusBar.setHidden(true);
        setTimeout(() => {
            NativeModuleUtils.SplashScreen.hide();
        }, 500);
        const unsubscribePermission = PermissionController.subscribe((state) => {
            if (state.locationPermissionGranted) {
                getLastLocation();
            }
        });
        return () => {
            unsubscribePermission();
            if (splashTimeout && splashTimeout.current) {
                clearTimeout(splashTimeout.current);
            }
            if (navigationTimeout && navigationTimeout.current) {
                clearTimeout(navigationTimeout.current);
            }
        };
    }, []);



    return (
        <ScreenContainer {...ScreenContainer.presets.full} safeArea={false}>
            <View style={styles.container}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoPlaceholder}>
                        {/* logo image */}
                        <AppImage
                            localKey="logo-full"
                            source={ImageAsset.logos.logoFull}
                            style={styles.logoImage}
                            width={250}
                            height={250}
                            resizeMode="contain"
                            borderRadius={theme.borderRadius.lg}
                            showLoadingIndicator={false}
                            showErrorPlaceholder={false}
                        />
                    </View>
                </View>
                <LoadingIndicator type="dots" size="large" color={theme.colors.primary[500]} containerStyle={styles.loadingContainer} />
                <BuildVersion />
            </View>
        </ScreenContainer>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: theme.responsive.isSmall() ? theme.spacing.xxl : theme.spacing.xxxl,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: theme.responsive.height(24),
        left: 0,
        right: 0,
        bottom: 0,
    },
    logoPlaceholder: {
        width: theme.responsive.size(250),
        height: theme.responsive.size(250),
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logoImage: {
        width: 250,
        height: 250,
    },
});