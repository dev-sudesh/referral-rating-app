import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { theme } from '../../constants/theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';
import TextInputField from '../../components/ui/TextInputField';

const ResetPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const [errors, setErrors] = useState({
        email: '',
    });

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (!email.trim()) {
            setErrors({
                email: 'Please enter your email address',
            });
            return;
        }

        if (!validateEmail(email)) {
            setErrors({
                email: 'Please enter a valid email address',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            setIsEmailSent(true);
            Alert.alert(
                'Success',
                'Password reset email sent! Please check your inbox.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to send reset email. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <ScreenContainer
            statusBarStyle="dark-content"
            paddingCustom={{
                paddingLeft: theme.spacing.md,
                paddingRight: theme.spacing.md,
            }}
        >
            <ScreenHeader
                title="Reset Password"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <KeyboardAvoidingView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
            >
                {/* Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <TextInputField
                            label="E-mail address"
                            placeholder="Enter your e-mail address"
                            placeholderTextColor={theme.colors.text.tertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isEmailSent}
                            error={errors.email}
                            onValidation={() => { }}
                            inputId="email"
                        />
                    </View>

                    {/* Reset Button */}
                    {/* <TouchableOpacity
                        style={[
                            styles.resetButton,
                            isLoading && styles.resetButtonDisabled,
                        ]}
                        onPress={handleResetPassword}
                        disabled={isLoading || isEmailSent}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.resetButtonText}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Text>
                    </TouchableOpacity> */}
                    <Button
                        title={isLoading ? 'Sending...' : 'Reset password'}
                        onPress={handleResetPassword}
                        disabled={isLoading || isEmailSent}
                        loading={isLoading}
                        variant="primary"
                        size="medium"
                    />

                    {/* Success Message */}
                    {isEmailSent && (
                        <View style={styles.successContainer}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={styles.successTitle}>Email Sent!</Text>
                            <Text style={styles.successMessage}>
                                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                            </Text>
                        </View>
                    )}
                </View>

                {/* Back to Login */}
                <TouchableOpacity
                    style={styles.backToLoginButton}
                    onPress={handleBackToLogin}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backToLoginText}>Go to login page</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.xl,
    },
    backButton: {
        width: theme.responsive.size(40),
        height: theme.responsive.size(40),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    backButtonText: {
        fontSize: 20,
        color: theme.colors.text.primary,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        lineHeight: 24,
    },
    form: {
        marginBottom: theme.responsive.isSmall() ? theme.spacing.lg : theme.spacing.xl,
    },
    inputContainer: {
        marginBottom: theme.responsive.isSmall() ? theme.spacing.lg : theme.spacing.xl,
    },
    inputLabel: {
        ...theme.typography.labelLarge,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        minHeight: theme.responsive.inputHeight(),
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.background.primary,
    },
    resetButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.small,
    },
    resetButtonDisabled: {
        opacity: 0.6,
    },
    resetButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    successContainer: {
        backgroundColor: theme.colors.success[50],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.success[200],
    },
    successIcon: {
        fontSize: 48,
        marginBottom: theme.spacing.sm,
    },
    successTitle: {
        ...theme.typography.h4,
        color: theme.colors.success[700],
        marginBottom: theme.spacing.sm,
    },
    successMessage: {
        ...theme.typography.bodySmall,
        color: theme.colors.success[600],
        textAlign: 'center',
        lineHeight: 20,
    },
    helpContainer: {
        backgroundColor: theme.colors.neutral[50],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    helpTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    helpText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
    backToLoginButton: {
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    backToLoginText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.bold,
        textDecorationLine: 'underline',
    },
});

export default ResetPasswordScreen; 