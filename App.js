import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import SearchFilter from './src/components/ui/SearchFilter';

// Initialize Firebase
import '@react-native-firebase/app';

const App = () => {

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <SearchFilter />
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;