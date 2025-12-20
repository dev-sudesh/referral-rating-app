import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStoreUtils from '../utils/AsyncStoreUtils';
import Constants from '../constants/data';

export const useOnboarding = (navigation) => {
    const [isLoading, setIsLoading] = useState(false);

    const getStarted = useCallback(async () => {
        if (isLoading) return; // Prevent multiple calls

        setIsLoading(true);
        try {
            await Promise.all([
                AsyncStoreUtils.setItem(AsyncStoreUtils.Keys.IS_LOGIN, 'true'),
                AsyncStoreUtils.setItem(AsyncStoreUtils.Keys.IS_ONBOARDING_COMPLETED, 'true'),
            ]);
            navigation.replace(Constants.Screen.Stack.Main);
        } catch (error) {
            // Onboarding authentication error
            Alert.alert(
                'Connection Error',
                'Unable to connect to our services. Please check your internet connection and try again.',
                [
                    { text: 'Try Again', onPress: () => getStarted() },
                    { text: 'Skip for Now', onPress: () => navigation.replace(Constants.Screen.Stack.Auth) }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, navigation]);

    return {
        isLoading,
        getStarted,
    };
};
