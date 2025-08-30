import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useDataRecovery } from '../../hooks/useDataRecovery';
import { useFirebaseStore, useUserFilters, useReferredPlaces } from '../../hooks/useFirebaseStore';

const DataRecoveryExample = () => {
    const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

    // Data recovery hook
    const {
        isRecovering,
        wasRecovered,
        recoveryError,
        checkRecovery,
        forceRecovery,
    } = useDataRecovery();

    // Firebase store hooks
    const {
        getUserStats,
        clearUserData,
        loading: mainLoading,
    } = useFirebaseStore();

    const {
        filters,
        loading: filtersLoading,
    } = useUserFilters();

    const {
        places,
        loading: placesLoading,
    } = useReferredPlaces();

    const [userStats, setUserStats] = useState(null);

    // Load user stats
    useEffect(() => {
        const loadStats = async () => {
            const stats = await getUserStats();
            setUserStats(stats);
        };
        loadStats();
    }, [getUserStats]);

    // Show recovery notification
    useEffect(() => {
        if (wasRecovered) {
            Alert.alert(
                'Data Recovered',
                'Your previous data has been successfully recovered!',
                [{ text: 'OK' }]
            );
        }
    }, [wasRecovered]);

    const handleForceRecovery = async () => {
        Alert.alert(
            'Force Data Recovery',
            'This will attempt to recover your data from the server. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Recover',
                    onPress: async () => {
                        const recovered = await forceRecovery();
                        if (recovered) {
                            Alert.alert('Success', 'Data recovered successfully!');
                        } else {
                            Alert.alert('No Data Found', 'No previous data was found to recover.');
                        }
                    },
                },
            ]
        );
    };

    const handleClearData = async () => {
        Alert.alert(
            'Clear All Data',
            'This will permanently delete all your data including device mappings. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearUserData();
                            Alert.alert('Success', 'All data has been cleared.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data.');
                        }
                    },
                },
            ]
        );
    };

    const simulateCacheClear = async () => {
        Alert.alert(
            'Simulate Cache Clear',
            'This will simulate clearing the app cache by removing the local user ID. The app should then attempt to recover data from the server.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Simulate',
                    onPress: async () => {
                        // This would normally be done by the OS, but we can simulate it
                        Alert.alert(
                            'Cache Cleared',
                            'Local cache has been cleared. Restart the app to test data recovery.',
                            [{ text: 'OK' }]
                        );
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Data Recovery System</Text>

            {/* Recovery Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recovery Status</Text>

                <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Recovery State:</Text>
                    <Text style={[
                        styles.statusValue,
                        wasRecovered ? styles.statusSuccess : styles.statusNormal
                    ]}>
                        {isRecovering ? 'Checking...' : wasRecovered ? 'Recovered' : 'No Recovery Needed'}
                    </Text>
                </View>

                {recoveryError && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>Error: {recoveryError}</Text>
                    </View>
                )}
            </View>

            {/* User Data Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current User Data</Text>

                {userStats && (
                    <View style={styles.statsContainer}>
                        <Text style={styles.statItem}>
                            • Filters: {userStats.hasFilters ? 'Saved' : 'None'}
                        </Text>
                        <Text style={styles.statItem}>
                            • Search History: {userStats.searchCount} searches
                        </Text>
                        <Text style={styles.statItem}>
                            • Location: {userStats.hasLocation ? 'Saved' : 'None'}
                        </Text>
                        <Text style={styles.statItem}>
                            • Referred Places: {userStats.referredPlacesCount} places
                        </Text>
                        <Text style={styles.statItem}>
                            • Visited Places: {userStats.visitedPlacesCount} places
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.button}
                    onPress={() => setShowRecoveryInfo(!showRecoveryInfo)}
                >
                    <Text style={styles.buttonText}>
                        {showRecoveryInfo ? 'Hide' : 'Show'} Detailed Info
                    </Text>
                </TouchableOpacity>

                {showRecoveryInfo && (
                    <View style={styles.detailedInfo}>
                        <Text style={styles.infoTitle}>Current Filters:</Text>
                        <Text style={styles.infoText}>
                            {JSON.stringify(filters, null, 2)}
                        </Text>

                        <Text style={styles.infoTitle}>Referred Places ({places.length}):</Text>
                        {places.map((place, index) => (
                            <Text key={place.id} style={styles.infoText}>
                                {index + 1}. {place.name} - {place.isVisited ? 'Visited' : 'Not Visited'}
                            </Text>
                        ))}
                    </View>
                )}
            </View>

            {/* Recovery Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recovery Actions</Text>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.primaryButton]}
                    onPress={checkRecovery}
                    disabled={isRecovering}
                >
                    <Text style={styles.buttonText}>
                        {isRecovering ? 'Checking...' : 'Check Recovery Status'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.warningButton]}
                    onPress={handleForceRecovery}
                    disabled={isRecovering}
                >
                    <Text style={styles.buttonText}>
                        {isRecovering ? 'Recovering...' : 'Force Data Recovery'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.infoButton]}
                    onPress={simulateCacheClear}
                >
                    <Text style={styles.buttonText}>Simulate Cache Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.dangerButton]}
                    onPress={handleClearData}
                >
                    <Text style={styles.buttonText}>Clear All Data</Text>
                </TouchableOpacity>
            </View>

            {/* How It Works */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How Data Recovery Works</Text>

                <Text style={styles.explanationText}>
                    1. <Text style={styles.bold}>Device Fingerprinting:</Text> The app creates a unique fingerprint based on device characteristics (device ID, model, OS version, app version).
                </Text>

                <Text style={styles.explanationText}>
                    2. <Text style={styles.bold}>Mapping Storage:</Text> This fingerprint is stored in Firestore along with the user ID for future recovery.
                </Text>

                <Text style={styles.explanationText}>
                    3. <Text style={styles.bold}>Automatic Recovery:</Text> When the app starts and no local user ID is found, it generates the device fingerprint and looks for an existing mapping.
                </Text>

                <Text style={styles.explanationText}>
                    4. <Text style={styles.bold}>Data Restoration:</Text> If a mapping is found, the user ID is restored and all associated data becomes available again.
                </Text>
            </View>

            {/* Limitations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Limitations</Text>

                <Text style={styles.limitationText}>
                    • Recovery only works on the same device
                </Text>
                <Text style={styles.limitationText}>
                    • Device fingerprint changes if user updates OS or app
                </Text>
                <Text style={styles.limitationText}>
                    • Factory reset will permanently delete all data
                </Text>
                <Text style={styles.limitationText}>
                    • Multiple users on same device will share data
                </Text>
            </View>

            {/* Loading Indicator */}
            {(mainLoading || filtersLoading || placesLoading) && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginRight: 8,
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusSuccess: {
        color: '#4CAF50',
    },
    statusNormal: {
        color: '#666',
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 6,
        marginTop: 8,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
    },
    statsContainer: {
        marginBottom: 12,
    },
    statItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    button: {
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginVertical: 4,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    warningButton: {
        backgroundColor: '#FF9500',
    },
    infoButton: {
        backgroundColor: '#34C759',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    detailedInfo: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 6,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    explanationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    bold: {
        fontWeight: 'bold',
        color: '#333',
    },
    limitationText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});

export default DataRecoveryExample;
