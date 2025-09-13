import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import MainTabs from './tabs/MainTabs';
import Constants from '../constants/data';
import SearchScreen from '../screens/main/search/SearchScreen';
import PersonalInfo from '../screens/main/personal-info/PersonalInfo';
import NotificationSettings from '../screens/main/notificaiton-settings/NotificationSettings';
import FavoriteFilters from '../screens/main/favorite-filters/FavoriteFilters';
import ListScreen from '../screens/main/map/ListScreen';
import WebViewScreen from '../screens/main/webview/WebViewScreen';
import RewardDetailScreen from '../screens/main/rewards/RewardDetailScreen';
import NetworkErrorScreen from '../screens/NetworkErrorScreen';
import useNetworkConnectivity from '../hooks/useNetworkConnectivity';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { hasValidConnection } = useNetworkConnectivity();

    // If no network connection, show network error screen
    if (!hasValidConnection) {
        return <NetworkErrorScreen onRetry={() => { }} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
                initialRouteName={Constants.Screen.Splash}
            >
                <Stack.Screen name={Constants.Screen.Splash} component={SplashScreen} />
                <Stack.Screen name={Constants.Screen.Onboarding} component={OnboardingScreen} />
                <Stack.Screen name={Constants.Screen.Stack.Main} component={MainTabs} />
                <Stack.Screen name={Constants.Screen.Search} component={SearchScreen} />
                <Stack.Screen name={Constants.Screen.PersonalInfo} component={PersonalInfo} />
                <Stack.Screen name={Constants.Screen.NotificationSettings} component={NotificationSettings} />
                <Stack.Screen name={Constants.Screen.FavoriteFilters} component={FavoriteFilters} />
                <Stack.Screen name={Constants.Screen.List} component={ListScreen} />
                <Stack.Screen name={Constants.Screen.WebView} component={WebViewScreen} />
                <Stack.Screen name={Constants.Screen.RewardDetail} component={RewardDetailScreen} />
                <Stack.Screen name={Constants.Screen.NetworkError} component={NetworkErrorScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator; 