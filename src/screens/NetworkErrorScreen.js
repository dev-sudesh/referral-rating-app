import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale } from 'react-native-size-matters';
import useNetworkConnectivity from '../hooks/useNetworkConnectivity';

const { width, height } = Dimensions.get('window');

const NetworkErrorScreen = ({ onRetry }) => {
    const { hasValidConnection, getConnectionStatus, connectionState } = useNetworkConnectivity();
    const connectionStatus = getConnectionStatus();

    const handleRetry = () => {
        if (hasValidConnection) {
            // If connection is restored, the AppNavigator will automatically show the main app
            return;
        }
        // If still no connection, you could show a toast or do nothing
        // The screen will remain visible until connection is restored
    };

    const getIconForState = () => {
        switch (connectionState) {
            case 'no-internet':
                return '📶'; // Signal bars but crossed out
            case 'no-network':
            default:
                return '📡'; // No signal
        }
    };

    const getAdditionalInfo = () => {
        switch (connectionState) {
            case 'no-internet':
                return 'Try switching to a different Wi-Fi network or mobile data. Some networks may have restricted internet access.';
            case 'no-network':
            default:
                return 'If the problem persists, please check your network settings or contact your service provider.';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <Text style={styles.iconText}>{getIconForState()}</Text>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>{connectionStatus.title}</Text>

                {/* Description */}
                <Text style={styles.description}>
                    {connectionStatus.message}
                </Text>

                {/* Retry Button */}
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>

                {/* Additional Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoText}>
                        {getAdditionalInfo()}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: scale(24),
    },
    iconContainer: {
        marginBottom: verticalScale(32),
    },
    iconBackground: {
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#bbdefb',
    },
    iconText: {
        fontSize: scale(48),
    },
    title: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: verticalScale(16),
    },
    description: {
        fontSize: scale(16),
        color: '#666',
        textAlign: 'center',
        lineHeight: scale(24),
        marginBottom: verticalScale(32),
        paddingHorizontal: scale(16),
    },
    retryButton: {
        backgroundColor: '#2196f3',
        paddingHorizontal: scale(32),
        paddingVertical: verticalScale(16),
        borderRadius: scale(8),
        marginBottom: verticalScale(24),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: scale(16),
        fontWeight: '600',
    },
    infoContainer: {
        paddingHorizontal: scale(16),
    },
    infoText: {
        fontSize: scale(14),
        color: '#999',
        textAlign: 'center',
        lineHeight: scale(20),
    },
});

export default NetworkErrorScreen;
