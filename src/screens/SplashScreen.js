import React, { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
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
import NativeModuleUtils from '../utils/nativeModules/NativeModuleUtils';
import FirebaseStoreService from '../services/firebase/FirebaseStoreService';

const SplashScreen = () => {
    const navigation = useNavigation();
    const splashTimeout = useRef();

    // Initialize app services
    const { firebaseReady, error, isInitializing } = useAppInitialization();

    // Initialize data recovery
    const { wasRecovered } = useDataRecovery();

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

    useEffect(() => {
        // Hide splash screen after a minimum delay
        splashTimeout.current = setTimeout(() => {
            NativeModuleUtils.SplashScreen.hide();
        }, 1000); // Increased from 500ms to 1000ms for better UX

        return () => {
            if (splashTimeout.current) {
                clearTimeout(splashTimeout.current);
            }
        };
    }, []);

    // Navigate when initialization is complete
    useEffect(() => {
        if (!isInitializing && firebaseReady) {
            FirebaseStoreService.storeRandomRewards();
            // Add a small delay to ensure smooth transition
            const navigationTimeout = setTimeout(() => {
                checkLoginStatus();
            }, 500);

            return () => clearTimeout(navigationTimeout);
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