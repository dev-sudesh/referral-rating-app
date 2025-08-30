import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFirebaseStore } from '../../hooks/useFirebaseStore';
import FirebaseStoreService from '../../services/firebase/FirebaseStoreService';

const DatabaseConnectionTest = () => {
    const [testResults, setTestResults] = useState({});
    const [isTesting, setIsTesting] = useState(false);
    const { initializeAnonymousUser } = useFirebaseStore();

    const runConnectionTest = async () => {
        setIsTesting(true);
        const results = {};

        try {
            // Test 1: Initialize anonymous user 
            const userId = await initializeAnonymousUser({
                appVersion: '1.0.0',
                platform: 'react-native',
            });
            results.anonymousUser = userId ? '✅ Success' : '❌ Failed';

            // Test 2: Store and retrieve filters 
            const testFilters = { category: 'restaurant', rating: 4 };
            await FirebaseStoreService.storeUserFilters(testFilters);
            const retrievedFilters = await FirebaseStoreService.getUserFilters();
            results.filters = Object.keys(retrievedFilters).length > 0 ? '✅ Success' : '❌ Failed';
            console.log('Filters test result:', results.filters);

            // Test 3: Store and retrieve search keyword
            console.log('Testing search keywords...');
            await FirebaseStoreService.storeSearchKeyword('test restaurant');
            const suggestions = await FirebaseStoreService.getSearchSuggestions();
            results.search = suggestions.length > 0 ? '✅ Success' : '❌ Failed';
            console.log('Search test result:', results.search);

            // Test 4: Store and retrieve location
            console.log('Testing location storage...');
            const testLocation = {
                latitude: 37.7749,
                longitude: -122.4194,
                accuracy: 10,
                address: 'San Francisco, CA'
            };
            await FirebaseStoreService.storeLastLocation(testLocation);
            const retrievedLocation = await FirebaseStoreService.getLastLocation();
            results.location = retrievedLocation ? '✅ Success' : '❌ Failed';
            console.log('Location test result:', results.location);

            // Test 5: Store and retrieve referred place
            console.log('Testing referred places...');
            const testPlace = {
                placeId: 'test_place_123',
                name: 'Test Restaurant',
                address: '123 Test St',
                latitude: 37.7749,
                longitude: -122.4194,
                category: 'restaurant',
                rating: 4.5
            };
            await FirebaseStoreService.storeReferredPlace(testPlace);
            const places = await FirebaseStoreService.getReferredPlaces();
            results.places = places.length > 0 ? '✅ Success' : '❌ Failed';
            console.log('Places test result:', results.places);

            // Test 6: Get user stats
            console.log('Testing user statistics...');
            const stats = await FirebaseStoreService.getUserStats();
            results.stats = stats ? '✅ Success' : '❌ Failed';
            console.log('Stats test result:', results.stats);

        } catch (error) {
            console.error('Database connection test failed:', error);
            results.error = error.message;
        }

        setTestResults(results);
        setIsTesting(false);
    };

    const clearTestData = async () => {
        try {
            await FirebaseStoreService.clearUserData();
            Alert.alert('Success', 'Test data cleared successfully');
            setTestResults({});
        } catch (error) {
            Alert.alert('Error', 'Failed to clear test data: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Database Connection Test</Text>

            <TouchableOpacity
                activeOpacity={1}
                style={[styles.button, isTesting && styles.buttonDisabled]}
                onPress={runConnectionTest}
                disabled={isTesting}
            >
                <Text style={styles.buttonText}>
                    {isTesting ? 'Testing...' : 'Run Connection Test'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={1}
                style={[styles.button, styles.clearButton]}
                onPress={clearTestData}
            >
                <Text style={styles.buttonText}>Clear Test Data</Text>
            </TouchableOpacity>

            {Object.keys(testResults).length > 0 && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Test Results:</Text>
                    {Object.entries(testResults).map(([test, result]) => (
                        <Text key={test} style={styles.resultText}>
                            {test}: {result}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultText: {
        fontSize: 14,
        marginBottom: 5,
        fontFamily: 'monospace',
    },
});

export default DatabaseConnectionTest;
