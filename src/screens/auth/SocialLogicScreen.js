import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    Platform,
} from 'react-native';
import { theme } from '../../constants/theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppImage from '../../components/common/AppImage';
import ImageAsset from '../../assets/images/ImageAsset';
import Constants from '../../constants/data';
import FirebaseAuthService from '../../services/firebase/FirebaseAuthService';
import FirebaseInitializer from '../../utils/FirebaseInitializer';

const SocialLogicScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
            if (user) {
                console.log('User signed in:', user.uid);
                // Navigate to main screen when user is authenticated
                navigation.replace(Constants.Screen.Stack.Main);
            }
        });

        return unsubscribe; // Clean up the listener when component unmounts
    }, [navigation]);

    const handleSocialLogin = async (provider) => {
        setIsLoading(true);

        try {
            // Ensure Firebase is ready before attempting authentication
            await FirebaseInitializer.waitForFirebase();

            let result;

            switch (provider) {
                case 'google':
                    result = await FirebaseAuthService.signInWithGoogle();
                    break;
                case 'facebook':
                    if (__DEV__) {
                        result = {
                            success: true,
                            user: { uid: 'test-user-id' },
                            provider: 'facebook'
                        };
                    } else {
                        result = await FirebaseAuthService.signInWithFacebook();
                    }
                    break;
                case 'apple':
                    result = await FirebaseAuthService.signInWithApple();
                    break;
                case 'twitter':
                    result = await FirebaseAuthService.signInWithTwitter();
                    break;
                default:
                    throw new Error('Unsupported provider');
            }

            if (result.success) {
                // Success will be handled by the auth state listener
                console.log(`Successfully signed in with ${provider}:`, result.user.uid);
                navigation.replace(Constants.Screen.Stack.Main);
            } else {
                Alert.alert('Sign-In Failed', result.error);
            }
        } catch (error) {
            console.error('Social login error:', error);

            if (error.message.includes('Firebase not initialized')) {
                Alert.alert('Configuration Error', 'Firebase is not properly configured. Please check your setup.');
            } else if (error.message.includes('runtime not ready')) {
                Alert.alert('Initialization Error', 'Services are still initializing. Please try again in a moment.');
            } else {
                Alert.alert('Error', 'Failed to sign in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailLogin = () => {
        navigation.navigate(Constants.Screen.AuthStack.Login);
    };

    const handleSignUp = () => {
        navigation.navigate(Constants.Screen.AuthStack.Register);
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>

                {/* logo */}
                <View style={styles.logoContainer}>
                    <AppImage
                        localKey="logo-full"
                        source={ImageAsset.logos.logoFull}
                        style={styles.logoImage}
                        width={theme.responsive.size(170)}
                        height={theme.responsive.size(170)}
                        borderRadius={theme.borderRadius.lg}
                        showLoadingIndicator={false}
                        showErrorPlaceholder={false}
                    />
                </View>

                {/* Social Login Options */}
                <View style={styles.socialContainer}>
                    {Constants.socialOptions(Platform.OS).map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.socialButton,
                                { borderColor: option.color, backgroundColor: option.color },
                                isLoading && styles.socialButtonDisabled,
                            ]}
                            onPress={() => handleSocialLogin(option.id)}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            <View style={styles.socialButtonContent}>
                                <View style={styles.socialTextContainer}>
                                    <Text style={styles.socialTitle}>{option.title}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <Text style={styles.dividerText}>OR</Text>
                </View>

                {/* Email Login Option */}
                <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleEmailLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.emailButtonText}>Login with e-mail</Text>
                </TouchableOpacity>

                {/* Sign Up Option */}
                <TouchableOpacity
                    style={styles.signUpButton}
                    onPress={handleSignUp}
                    activeOpacity={0.6}
                >
                    <Text style={styles.signUpText}>Don't have an account yet? <Text style={styles.signUpTextLink}>Sign up</Text></Text>
                </TouchableOpacity>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.xxl,
        height: theme.responsive.height(theme.responsive.screen().height * 0.35),
        minHeight: theme.responsive.height(250),
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        maxWidth: 280,
    },
    socialContainer: {
        // marginBottom: theme.spacing.xl,
    },
    socialButton: {
        borderWidth: 1,
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
        minHeight: theme.responsive.buttonHeight('medium'),
        ...theme.shadows.small,
    },
    socialButtonDisabled: {
        opacity: 0.6,
    },
    socialButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    socialIcon: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    socialTextContainer: {
        flex: 1,
    },
    socialTitle: {
        ...theme.typography.buttonMedium,
        color: theme.colors.background.primary,
        textAlign: 'center',
    },
    socialSubtitle: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.secondary,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.responsive.isSmall() ? theme.spacing.lg : theme.spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border.light,
    },
    dividerText: {
        ...theme.typography.bodyMedium,
        fontWeight: 'bold',
        color: theme.colors.neutral[900],
        marginHorizontal: theme.spacing.md,
        textAlign: 'center',
        flex: 1,
    },
    emailButton: {
        borderWidth: 1,
        borderColor: theme.colors.neutral[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        backgroundColor: theme.colors.background.primary,
        height: theme.responsive.buttonHeight('medium'),
        minHeight: theme.responsive.buttonHeight('medium'),
    },
    emailButtonText: {
        ...theme.typography.bodySmall,
        color: theme.colors.neutral[900],
        fontWeight: 'bold',
    },
    signUpButton: {
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        minHeight: theme.responsive.height(44),
    },
    signUpText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: theme.spacing.xl,
    },
    footerText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 18,
    },
    linkText: {
        color: theme.colors.primary[500],
    },
    signUpTextLink: {
        color: theme.colors.primary[500],
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default SocialLogicScreen; 