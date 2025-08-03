import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/auth/LoginScreen';
import RegisterScreen from '../../screens/auth/RegisterScreen';
import ResetPasswordScreen from '../../screens/auth/ResetPasswordScreen';
import SocialLogicScreen from '../../screens/auth/SocialLogicScreen';
import Constants from '../../constants/data';

const Stack = createStackNavigator();

const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName={Constants.Screen.AuthStack.SocialLogic}
        >
            <Stack.Screen name={Constants.Screen.AuthStack.SocialLogic} component={SocialLogicScreen} />
            <Stack.Screen name={Constants.Screen.AuthStack.Login} component={LoginScreen} />
            <Stack.Screen name={Constants.Screen.AuthStack.Register} component={RegisterScreen} />
            <Stack.Screen name={Constants.Screen.AuthStack.ResetPassword} component={ResetPasswordScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack; 