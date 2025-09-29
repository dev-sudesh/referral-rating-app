import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import SearchFilter from './src/components/ui/SearchFilter';
import PlaceFullCard from './src/components/ui/PlaceFullCard';
import MapsController from './src/controllers/maps/MapsController';

// Initialize Firebase
import '@react-native-firebase/app';
import PermissionError from './src/components/ui/PermissionError';
import PermissionController from './src/controllers/permissions/PermissionController';
import LocationUtils from './src/utils/LocationUtils';

LocationUtils.init();
const App = () => {
  const { showPlaceFullCard } = MapsController();
  const { showPermissionError, } = PermissionController();
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <SearchFilter />
      {showPlaceFullCard && <PlaceFullCard />}
      <Toast />
      {showPermissionError && <PermissionError />}
    </SafeAreaProvider>
  );
};

export default App;