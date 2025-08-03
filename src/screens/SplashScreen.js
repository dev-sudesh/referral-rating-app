import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import AppImage from '../components/common/AppImage';
import Images from '../locale/Images';
import LoadingIndicator from '../components/animated/LoadingIndicator';
import ScreenContainer from '../components/common/ScreenContainer';
import BuildVersion from '../components/ui/BuildVersion';
import NativeModuleUtils from '../utils/nativeModules/NativeModuleUtils';
import ImageAsset from '../assets/images/ImageAsset';
import Constants from '../constants/data';

const SplashScreen = ({ navigation }) => {
    React.useEffect(() => {
        setTimeout(() => {
            NativeModuleUtils.SplashScreen.hide();
        }, 500);
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace(Constants.Screen.Onboarding);
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <ScreenContainer {...ScreenContainer.presets.full}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingVertical: theme.spacing.xxxl,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 24,
        left: 0,
        right: 0,
        bottom: 0,
    },
    logoPlaceholder: {
        width: 250,
        height: 250,
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.ios.medium,
    },
    logoText: {
        ...theme.typography.h3,
        color: theme.colors.primary[500],
    },
    appName: {
        ...theme.typography.h1,
        color: theme.colors.background.primary,
        marginBottom: theme.spacing.sm,
    },
    tagline: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[100],
        textAlign: 'center',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    loadingDot: {
        width: 12,
        height: 12,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[500],
        marginHorizontal: theme.spacing.xs,
        opacity: 0.6,
    },
    loadingDotDelayed: {
        opacity: 0.8,
    },
    loadingDotMoreDelayed: {
        opacity: 1,
    },
    logoImage: {
        width: 250,
        height: 250,
        borderRadius: theme.borderRadius.lg,
    },
});

export default SplashScreen; 