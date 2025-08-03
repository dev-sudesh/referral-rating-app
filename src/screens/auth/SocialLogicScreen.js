import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    Platform,
    Dimensions,
} from 'react-native';
import { theme } from '../../constants/theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppImage from '../../components/common/AppImage';
import ImageAsset from '../../assets/images/ImageAsset';
import Constants from '../../constants/data';

const { height } = Dimensions.get('window');

const SocialLogicScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialLogin = async (provider) => {
        setIsLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            navigation.replace(Constants.Screen.Stack.Main);
        } catch (error) {
            Alert.alert('Error', 'Failed to sign in. Please try again.');
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
                        width={130}
                        height={130}
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
        height: height * 0.35,
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
        ...theme.shadows.ios.small,
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
        marginVertical: theme.spacing.xl,
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
        ...theme.shadows.ios.small,
    },
    emailButtonText: {
        ...theme.typography.bodySmall,
        color: theme.colors.neutral[900],
        fontWeight: 'bold',
    },
    signUpButton: {
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
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