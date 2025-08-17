import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import DeviceInfo from './src/utils/deviceInfo/DeviceInfo';
import FirebaseInitializer from './src/utils/FirebaseInitializer';

// Initialize Firebase
import '@react-native-firebase/app';
import SearchFilter from './src/components/ui/SearchFilter';

const App = () => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        DeviceInfo.init();
        await FirebaseInitializer.initialize();
        setFirebaseReady(true);
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err.message);
        // Continue without Firebase for now
        setFirebaseReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!firebaseReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing...</Text>
          {error && <Text style={styles.errorText}>Warning: {error}</Text>}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <SearchFilter />
      <Toast />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#333333',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default App;