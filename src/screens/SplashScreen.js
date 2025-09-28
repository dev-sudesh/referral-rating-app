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
import { useDataRecovery } from '../hooks/useDataRecovery';
import useLocationCheck from '../hooks/useLocationCheck';
import NativeModuleUtils from '../utils/nativeModules/NativeModuleUtils';
import FirebaseStoreService from '../services/firebase/FirebaseStoreService';
import LocationUtils from '../utils/LocationUtils';
import PermissionController from '../controllers/permissions/PermissionController';
import MapsController from '../controllers/maps/MapsController';

const SplashScreen = () => {
    const navigation = useNavigation();
    const splashTimeout = useRef();
    const navigationTimeout = useRef();
    const { userLocation } = MapsController();

    // Initialize app services
    const { firebaseReady, error, isInitializing } = useAppInitialization();

    // Initialize data recovery
    const { wasRecovered } = useDataRecovery();

    // Initialize location checking
    const {
        isChecking,
        locationStatus,
        checkLocationStatus
    } = useLocationCheck();

    // Show recovery notification
    useEffect(() => {
        if (wasRecovered) {
            // Toast.show({
            //     type: 'success',
            //     text1: 'Welcome Back!',
            //     text2: 'Your previous data has been recovered.',
            //     position: 'top',
            //     visibilityTime: 4000,
            // });
        }
    }, [wasRecovered]);

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
            console.error('Error checking login status:', error);
            // Fallback to auth screen on error
            navigation.replace(Constants.Screen.Stack.Auth);
        }
    }

    const getLastLocation = async () => {
        LocationUtils.getCurrentLocation();
    }

    const getStarted = async () => {

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
                latitudeDelta: 0.032,
                longitudeDelta: 0.032,
            }
            getStarted();
        }
    }, [JSON.stringify(userLocation), locationStatus.canProceed]);


    useEffect(() => {
        StatusBar.setHidden(true);
        NativeModuleUtils.SplashScreen.hide();
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

    // Navigate when initialization is complete
    useEffect(() => {
        if (!isInitializing && firebaseReady) {
            FirebaseStoreService.storeRandomRewards();

        }
    }, [isInitializing, firebaseReady]);

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