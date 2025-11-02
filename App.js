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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DeviceInfo from './src/utils/deviceInfo/DeviceInfo';
LocationUtils.init();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 1000 * 5,
      cacheTime: 1000 * 5,
      retry: 3,
    },
  },
})
const App = () => {
  const { showPlaceFullCard } = MapsController();
  const { showPermissionError, } = PermissionController();
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppNavigator />
        <SearchFilter />
        {showPlaceFullCard && <PlaceFullCard />}
        <Toast />
        {showPermissionError && <PermissionError />}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

export default App;