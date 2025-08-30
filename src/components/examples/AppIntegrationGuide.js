import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const AppIntegrationGuide = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data Recovery Integration Guide</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. App.js Integration</Text>
        <Text style={styles.codeBlock}>
          {`import React from 'react';
import { useDataRecovery } from './src/hooks/useDataRecovery';
import { useFirebaseStore } from './src/hooks/useFirebaseStore';

const App = () => {
  // Initialize data recovery
  const { wasRecovered, isRecovering } = useDataRecovery();
  
  // Initialize Firebase store
  const { initializeAnonymousUser } = useFirebaseStore();

  React.useEffect(() => {
    // Initialize anonymous user on app start
    const initUser = async () => {
      try {
        await initializeAnonymousUser({
          appVersion: '1.0.0',
          platform: 'react-native',
        });
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };
    
    initUser();
  }, [initializeAnonymousUser]);

  // Show loading screen while recovering data
  if (isRecovering) {
    return <LoadingScreen message="Recovering your data..." />;
  }

  // Show welcome back message if data was recovered
  if (wasRecovered) {
    // You can show a toast or notification here 
  }

  return (
    <YourMainAppComponent />
  );
};`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Search Screen Integration</Text>
        <Text style={styles.codeBlock}>
          {`import React, { useState, useEffect } from 'react';
import { useSearchSuggestions, useUserFilters } from '../hooks/useFirebaseStore';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use the hooks - they automatically handle data recovery
  const {
    suggestions,
    loadSuggestions,
    addSearchKeyword,
  } = useSearchSuggestions();

  const {
    filters,
    saveFilters,
  } = useUserFilters();

  // Load suggestions on mount (will work with recovered data)
  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const handleSearch = async (query) => {
    if (query.trim()) {
      // Store search keyword (works with recovered user ID)
      await addSearchKeyword(query);
      
      // Perform search...
    }
  };

  return (
    <View>
      {/* Your search UI */}
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
      />
      
      {/* Show suggestions from recovered data */}
      {suggestions.map(suggestion => (
        <TouchableOpacity key={suggestion.keyword}>
          <Text>{suggestion.keyword}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Settings Screen Integration</Text>
        <Text style={styles.codeBlock}>
          {`import React from 'react';
import { useDataRecovery } from '../hooks/useDataRecovery';
import { useFirebaseStore } from '../hooks/useFirebaseStore';

const SettingsScreen = () => {
  const { wasRecovered, forceRecovery } = useDataRecovery();
  const { clearUserData, getUserStats } = useFirebaseStore();

  const handleClearData = async () => {
    try {
      await clearUserData();
      Alert.alert('Success', 'All data cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear data');
    }
  };

  const handleForceRecovery = async () => {
    const recovered = await forceRecovery();
    if (recovered) {
      Alert.alert('Success', 'Data recovered!');
    } else {
      Alert.alert('No Data', 'No data found to recover');
    }
  };

  return (
    <View>
      <Text>Settings</Text>
      
      {wasRecovered && (
        <View style={styles.recoveryNotice}>
          <Text>✓ Your data was recovered from previous session</Text>
        </View>
      )}
      
      <TouchableOpacity onPress={handleForceRecovery}>
        <Text>Recover Data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleClearData}>
        <Text>Clear All Data</Text>
      </TouchableOpacity>
    </View>
  );
};`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Firestore Security Rules</Text>
        <Text style={styles.codeBlock}>
          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anonymous access to device mappings
    match /device_mappings/{deviceFingerprint} {
      allow read, write: if request.auth == null;
    }
    
    // Allow users to access their own data
    match /users/{userId} {
      allow read, write: if request.auth == null && 
        resource.data.userId == userId;
    }
    
    match /user_filters/{userId} {
      allow read, write: if request.auth == null && 
        resource.data.userId == userId;
    }
    
    match /search_history/{docId} {
      allow read, write: if request.auth == null && 
        resource.data.userId == docId.split('_')[0];
    }
    
    match /user_locations/{userId} {
      allow read, write: if request.auth == null && 
        resource.data.userId == userId;
    }
    
    match /referred_places/{docId} {
      allow read, write: if request.auth == null && 
        resource.data.userId == docId.split('_')[0];
    }
  }
}`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Testing Data Recovery</Text>
        <Text style={styles.stepText}>
          1. <Text style={styles.bold}>Install and use the app</Text> - Create some data (filters, searches, places)
        </Text>
        <Text style={styles.stepText}>
          2. <Text style={styles.bold}>Clear app data</Text> - Go to device settings → Apps → Your App → Clear Data
        </Text>
        <Text style={styles.stepText}>
          3. <Text style={styles.bold}>Reopen the app</Text> - The app should automatically recover your data
        </Text>
        <Text style={styles.stepText}>
          4. <Text style={styles.bold}>Verify recovery</Text> - Check that your filters, search history, and places are restored
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Best Practices</Text>
        <Text style={styles.bestPracticeText}>
          • <Text style={styles.bold}>Always initialize user on app start</Text> - This ensures device mapping is created
        </Text>
        <Text style={styles.bestPracticeText}>
          • <Text style={styles.bold}>Handle loading states</Text> - Show loading indicators while recovering data
        </Text>
        <Text style={styles.bestPracticeText}>
          • <Text style={styles.bold}>Provide user feedback</Text> - Notify users when their data is recovered
        </Text>
        <Text style={styles.bestPracticeText}>
          • <Text style={styles.bold}>Offer manual recovery</Text> - Provide a "Recover Data" button in settings
        </Text>
        <Text style={styles.bestPracticeText}>
          • <Text style={styles.bold}>Respect privacy</Text> - Allow users to clear all data including device mappings
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Limitations & Considerations</Text>
        <Text style={styles.limitationText}>
          • <Text style={styles.bold}>Device-specific:</Text> Recovery only works on the same device
        </Text>
        <Text style={styles.limitationText}>
          • <Text style={styles.bold}>OS/App updates:</Text> Device fingerprint may change after updates
        </Text>
        <Text style={styles.limitationText}>
          • <Text style={styles.bold}>Factory reset:</Text> Will permanently delete all data
        </Text>
        <Text style={styles.limitationText}>
          • <Text style={styles.bold}>Multiple users:</Text> Users on same device will share data
        </Text>
        <Text style={styles.limitationText}>
          • <Text style={styles.bold}>Privacy:</Text> Device fingerprinting may be considered tracking
        </Text>
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
  codeBlock: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  bestPracticeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  limitationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default AppIntegrationGuide;
