import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Linking,
    Platform,
    AppState,
} from 'react-native';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';
import LocationUtils from '../../utils/LocationUtils';
import PermissionController from '../../controllers/permissions/PermissionController';
import { useFocusEffect } from '@react-navigation/native';

const PermissionError = ({
    type = 'location',
    onRetry,
    showRetryButton = true,
    customMessage,
    style,
    iconSize = 80,
}) => {
    const [showPermissionError, setShowPermissionError] = useState(false);
    const [errorType, setErrorType] = useState(null);
    const getPermissionConfig = () => {
        // Use errorType from PermissionController if available, otherwise fall back to type prop
        const currentErrorType = errorType || type;

        switch (currentErrorType) {
            case 'permission':
            case 'location':
                return {
                    icon: IconAsset.markerIconSvg,
                    title: 'Location Permission Required',
                    message: customMessage || 'This app needs location permission to show nearby places and provide location-based services. Please enable location access in your device settings.',
                    settingsMessage: 'To enable location permission, go to Settings > Privacy & Security > Location Services and turn on location access for this app.',
                };
            case 'gps':
                return {
                    icon: IconAsset.markerIconSvg,
                    title: 'Location Services Disabled',
                    message: customMessage || 'Location services are disabled on your device. Please enable them in Settings > Privacy & Security > Location Services to use location-based features.',
                    settingsMessage: 'To enable location services, go to Settings > Privacy & Security > Location Services and turn on location services.',
                };
            case 'camera':
                return {
                    icon: IconAsset.plusIcon,
                    title: 'Camera Permission Required',
                    message: customMessage || 'This app needs camera permission to take photos. Please enable camera access in your device settings.',
                    settingsMessage: 'To enable camera permission, go to Settings > Privacy & Security > Camera and turn on camera access for this app.',
                };
            case 'notification':
                return {
                    icon: IconAsset.checkIcon,
                    title: 'Notification Permission Required',
                    message: customMessage || 'This app needs notification permission to send you updates. Please enable notification access in your device settings.',
                    settingsMessage: 'To enable notification permission, go to Settings > Notifications and turn on notifications for this app.',
                };
            default:
                return {
                    icon: IconAsset.emptyStateIcon,
                    title: 'Permission Required',
                    message: customMessage || `${currentErrorType} permission is required to use this app. Please enable it in your device settings.`,
                    settingsMessage: `To enable ${currentErrorType} permission, go to Settings and turn on access for this app.`,
                };
        }
    };

    const config = getPermissionConfig();
    const IconComponent = config.icon;

    const handleRetry = async () => {
        if (onRetry) {
            onRetry();
            return;
        }

        const currentErrorType = errorType || type;

        try {
            if (currentErrorType === 'permission' || currentErrorType === 'location') {
                // Handle permission request
                const hasPermission = await LocationUtils.requestLocationPermission();
                if (!hasPermission) {
                    showSettingsAlert();
                }
            } else if (currentErrorType === 'gps') {
                // Handle GPS enabling
                const gpsEnabled = await LocationUtils.enableLocationServicesWithRetry();
                if (!gpsEnabled) {
                    showSettingsAlert();
                }
            } else {
                // Fallback to settings
                showSettingsAlert();
            }
        } catch (error) {
            console.error('Error during retry:', error);
            showSettingsAlert();
        }
    };

    const showSettingsAlert = () => {
        Alert.alert(
            config.title,
            config.settingsMessage,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    React.useEffect(() => {
        const unsubscribe = PermissionController.subscribe((state) => {
            setShowPermissionError(state.showPermissionError);
            setErrorType(state.errorType);
        });

        // AppState listener for when app becomes active
        const appStateListener = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                // Trigger location check when app becomes active
                LocationUtils.checkLocationPermission();
            }
        });

        return () => {
            unsubscribe();
            appStateListener.remove();
        };
    }, []);

    if (!showPermissionError) {
        return null;
    }


    return (
        <View style={[styles.container, style]}>
            <View style={styles.content}>
                {/* Error Icon */}
                <View style={styles.iconContainer}>
                    <IconComponent
                        width={iconSize}
                        height={iconSize}
                        color={theme.colors.error[500]}
                    />
                </View>

                {/* Title */}
                <Text style={styles.title}>{config.title}</Text>

                {/* Message */}
                <Text style={styles.message}>{config.message}</Text>

                {/* Retry Button */}
                {showRetryButton && (
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={handleRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.retryButtonText}>Allow Permission</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 320,
        width: '100%',
    },
    iconContainer: {
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.error[50],
        borderRadius: theme.borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    message: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: theme.lineHeight.body.medium + 4,
        marginBottom: theme.spacing.xl,
    },
    retryButton: {
        backgroundColor: theme.colors.primary[500],
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        minWidth: 140,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.medium,
    },
    retryButtonText: {
        ...theme.typography.buttonMedium,
        color: theme.colors.background.white,
        fontWeight: theme.fontWeight.semiBold,
    },
});

export default PermissionError;