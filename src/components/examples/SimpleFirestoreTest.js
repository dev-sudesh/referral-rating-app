import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const SimpleFirestoreTest = () => {
    const [testResult, setTestResult] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    const testFirestoreConnection = async () => {
        setIsTesting(true);
        setTestResult('Testing...');

        try {
            console.log('Starting Firestore connection test...');

            // Test 1: Basic Firestore instance
            const db = firestore();
            console.log('Firestore instance created:', !!db);

            // Test 2: Try to access a collection
            const testCollection = db.collection('test_connection');
            console.log('Test collection reference created:', !!testCollection);

            // Test 3: Try to get a document (this should work even if empty)
            const testDoc = testCollection.doc('test_doc');
            console.log('Test document reference created:', !!testDoc);

            // Test 4: Try to get the document (this will fail if Firestore is not accessible)
            const docSnapshot = await testDoc.get();
            console.log('Document snapshot retrieved:', !!docSnapshot);
            console.log('Document exists:', docSnapshot.exists);

            // Test 5: Try to write a test document
            const testData = {
                test: true,
                timestamp: firestore.FieldValue.serverTimestamp(),
                message: 'Firestore connection test successful'
            };

            await testDoc.set(testData);
            console.log('Test document written successfully');

            // Test 6: Read it back
            const readSnapshot = await testDoc.get();
            const readData = readSnapshot.data();
            console.log('Test document read back:', readData);

            // Test 7: Clean up - delete the test document
            await testDoc.delete();
            console.log('Test document deleted');

            setTestResult('✅ Firestore connection successful!');
            Alert.alert('Success', 'Firestore is properly connected and working!');

        } catch (error) {
            console.error('Firestore connection test failed:', error);
            setTestResult(`❌ Firestore connection failed: ${error.message}`);
            Alert.alert('Error', `Firestore connection failed: ${error.message}`);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Simple Firestore Connection Test</Text>

            <TouchableOpacity
                style={[styles.button, isTesting && styles.buttonDisabled]}
                onPress={testFirestoreConnection}
                disabled={isTesting}
            >
                <Text style={styles.buttonText}>
                    {isTesting ? 'Testing...' : 'Test Firestore Connection'}
                </Text>
            </TouchableOpacity>

            {testResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{testResult}</Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Troubleshooting Tips:</Text>
                <Text style={styles.infoText}>• Make sure Firestore is enabled in your Firebase Console</Text>
                <Text style={styles.infoText}>• Check that your google-services.json is up to date</Text>
                <Text style={styles.infoText}>• Verify your Firebase project has Firestore database created</Text>
                <Text style={styles.infoText}>• Check the console for detailed error messages</Text>
            </View>
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
        marginBottom: 20,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    resultContainer: {
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 20,
    },
    resultText: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    infoContainer: {
        padding: 15,
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2196f3',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1976d2',
    },
    infoText: {
        fontSize: 14,
        marginBottom: 5,
        color: '#424242',
    },
});

export default SimpleFirestoreTest;
