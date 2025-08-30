import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { useFirebaseStore, useUserFilters, useSearchSuggestions, useReferredPlaces } from '../../hooks/useFirebaseStore';
import { useDataRecovery } from '../../hooks/useDataRecovery';

const TestFirebaseIntegration = () => {
    const [testResults, setTestResults] = useState({});

    // Firebase Store hooks
    const {
        initializeAnonymousUser,
        storeLastLocation,
        getUserStats,
        loading: mainLoading,
    } = useFirebaseStore();

    const {
        filters,
        saveFilters,
        loading: filtersLoading,
    } = useUserFilters();

    const {
        suggestions,
        loadSuggestions,
        addSearchKeyword,
        loading: searchLoading,
    } = useSearchSuggestions();

    const {
        places,
        addPlace,
        markVisited,
        deletePlace,
        loading: placesLoading,
    } = useReferredPlaces();

    // Data recovery hook
    const { wasRecovered, forceRecovery } = useDataRecovery();

    const runTest = async (testName, testFunction) => {
        try {
            setTestResults(prev => ({ ...prev, [testName]: 'running' }));
            const result = await testFunction();
            setTestResults(prev => ({ ...prev, [testName]: 'passed' }));
            return result;
        } catch (error) {
            console.error(`Test ${testName} failed:`, error);
            setTestResults(prev => ({ ...prev, [testName]: 'failed' }));
            return null;
        }
    };

    const testAnonymousUser = async () => {
        const userId = await initializeAnonymousUser({
            appVersion: '1.0.0',
            platform: 'react-native',
        });
        return userId;
    };

    const testStoreFilters = async () => {
        const testFilters = {
            category: ['restaurant', 'cafe'],
            rating: 4.0,
            distance: 5,
            priceRange: 'medium',
            openNow: true,
        };
        await saveFilters(testFilters);
        return testFilters;
    };

    const testStoreSearchKeyword = async () => {
        await addSearchKeyword('test search');
        return 'test search';
    };

    const testStoreLocation = async () => {
        const location = {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
            address: 'San Francisco, CA',
        };
        await storeLastLocation(location);
        return location;
    };

    const testStorePlace = async () => {
        const place = {
            placeId: 'test_place_123',
            name: 'Test Restaurant',
            address: '123 Test St',
            latitude: 37.7749,
            longitude: -122.4194,
            category: 'restaurant',
            rating: 4.5,
        };
        await addPlace(place);
        return place;
    };

    const runAllTests = async () => {
        Alert.alert(
            'Run All Tests',
            'This will test all Firebase Store functionality. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Run Tests',
                    onPress: async () => {
                        setTestResults({});

                        // Run tests in sequence
                        await runTest('Anonymous User', testAnonymousUser);
                        await runTest('Store Filters', testStoreFilters);
                        await runTest('Store Search', testStoreSearchKeyword);
                        await runTest('Store Location', testStoreLocation);
                        await runTest('Store Place', testStorePlace);

                        // Reload data
                        await loadSuggestions();

                        Alert.alert('Tests Complete', 'Check the results below.');
                    },
                },
            ]
        );
    };

    const getTestStatusColor = (status) => {
        switch (status) {
            case 'passed': return '#4CAF50';
            case 'failed': return '#F44336';
            case 'running': return '#FF9800';
            default: return '#9E9E9E';
        }
    };

    const getTestStatusText = (status) => {
        switch (status) {
            case 'passed': return '✓ Passed';
            case 'failed': return '✗ Failed';
            case 'running': return '⟳ Running';
            default: return '○ Not Run';
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Firebase Store Integration Test</Text>

            {/* Test Controls */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Test Controls</Text>
                <TouchableOpacity style={styles.button} onPress={runAllTests}>
                    <Text style={styles.buttonText}>Run All Tests</Text>
                </TouchableOpacity>
            </View>

            {/* Test Results */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Test Results</Text>
                {Object.entries(testResults).map(([testName, status]) => (
                    <View key={testName} style={styles.testResult}>
                        <Text style={styles.testName}>{testName}</Text>
                        <Text style={[styles.testStatus, { color: getTestStatusColor(status) }]}>
                            {getTestStatusText(status)}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Current Data */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Current Data</Text>

                <Text style={styles.dataLabel}>Filters:</Text>
                <Text style={styles.dataValue}>
                    {Object.keys(filters).length > 0 ? JSON.stringify(filters, null, 2) : 'No filters'}
                </Text>

                <Text style={styles.dataLabel}>Search Suggestions:</Text>
                <Text style={styles.dataValue}>
                    {suggestions.length} suggestions
                </Text>

                <Text style={styles.dataLabel}>Referred Places:</Text>
                <Text style={styles.dataValue}>
                    {places.length} places
                </Text>

                <Text style={styles.dataLabel}>Data Recovery:</Text>
                <Text style={styles.dataValue}>
                    {wasRecovered ? 'Data was recovered' : 'No recovery needed'}
                </Text>
            </View>

            {/* Loading States */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Loading States</Text>
                <Text style={styles.loadingText}>
                    Main: {mainLoading ? 'Loading' : 'Ready'}
                </Text>
                <Text style={styles.loadingText}>
                    Filters: {filtersLoading ? 'Loading' : 'Ready'}
                </Text>
                <Text style={styles.loadingText}>
                    Search: {searchLoading ? 'Loading' : 'Ready'}
                </Text>
                <Text style={styles.loadingText}>
                    Places: {placesLoading ? 'Loading' : 'Ready'}
                </Text>
            </View>

            {/* Manual Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manual Actions</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => loadSuggestions()}
                >
                    <Text style={styles.actionButtonText}>Reload Suggestions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => forceRecovery()}
                >
                    <Text style={styles.actionButtonText}>Force Data Recovery</Text>
                </TouchableOpacity>
            </View>
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
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    testResult: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    testName: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    testStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    dataLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
    },
    dataValue: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
        backgroundColor: '#f8f8f8',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    actionButton: {
        backgroundColor: '#34C759',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default TestFirebaseIntegration;
