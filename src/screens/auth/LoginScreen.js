import React, { useState, useCallback, useRef } from 'react';
import useFocusManager from '../../hooks/useFocusManager';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import { theme } from '../../constants/theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import Constants from '../../constants/data';
import IconAsset from '../../assets/icons/IconAsset';
import ScreenHeader from '../../components/ui/ScreenHeader';
import KeyboardAvoidingView from '../../components/common/KeyboardAvoidingView';
import TextInputField from '../../components/ui/TextInputField';
import Button from '../../components/ui/Button';
import ToastUtils from '../../utils/ToastUtils';

const LoginScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });
    const focusedInputRef = useRef(null);
    const focusManager = useFocusManager();

    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {
            email: '',
            password: '',
        };
        let isValid = true;

        if (!formData.email.trim()) {
            newErrors.email = 'Please enter your email address';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Please enter your password';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo purposes, show success and navigate
            // ToastUtils.success('Successfully logged in!', 'Welcome!');

            // Navigate after showing toast
            setTimeout(() => {
                navigation.replace('MainTabs');
            }, 1500);
        } catch (error) {
            ToastUtils.error('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigation.navigate(Constants.Screen.AuthStack.ResetPassword);
    };

    const handleRegister = () => {
        navigation.navigate(Constants.Screen.AuthStack.Register);
    };

    return (
        <ScreenContainer
            statusBarStyle="dark-content"
            paddingCustom={{
                paddingLeft: theme.spacing.md,
                paddingRight: theme.spacing.md,
            }}
        >
            <View style={styles.container}>
                {/* Header */}
                <ScreenHeader
                    title="Log in"
                    showBackButton
                    onBackPress={() => navigation.goBack()}
                />

                <KeyboardAvoidingView>
                    {/* Form */}
                    <View style={styles.form}>
                        {/* Email Input */}
                        <TextInputField
                            key="email"
                            type="email"
                            label="E-mail address"
                            value={formData.email}
                            onChangeText={useCallback((value) => {
                                handleInputChange('email', value);
                            }, [handleInputChange])}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.email}
                            placeholder="Enter your e-mail address"
                            onValidation={useCallback((result, value) => {
                            }, [])}
                            focusManager={focusManager}
                            inputId="email"
                        />

                        {/* Password Input */}
                        <TextInputField
                            key="password"
                            type="password"
                            label="Password"
                            value={formData.password}
                            onChangeText={useCallback((value) => {
                                handleInputChange('password', value);
                            }, [handleInputChange])}
                            autoCapitalize="none"
                            autoCorrect={false}
                            error={errors.password}
                            placeholder="Enter your password"
                            onValidation={useCallback((result, value) => {
                            }, [])}
                            focusManager={focusManager}
                            inputId="password"
                        />
                        {/* Login Button */}
                        <View style={styles.loginButtonContainer}>
                            <Button
                                title={isLoading ? 'Logging in...' : 'Log in'}
                                onPress={handleLogin}
                                disabled={isLoading}
                                loading={isLoading}
                                variant="primary"
                                size="medium"
                            />
                        </View>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity activeOpacity={1} style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                        <Text style={styles.forgotPasswordText}>Forgot your password</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    header: {
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
    },
    form: {
        marginTop: theme.responsive.isSmall() ? theme.spacing.xl : theme.spacing.xxl,
        marginBottom: theme.spacing.xl,
    },
    inputContainer: {
        marginBottom: theme.responsive.isSmall() ? theme.spacing.md : theme.spacing.lg,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.primary,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        minHeight: theme.responsive.inputHeight(),
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
    },
    eyeButton: {
        padding: theme.spacing.md,
        minWidth: theme.responsive.size(44),
        minHeight: theme.responsive.size(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotPasswordButton: {
        alignSelf: 'center',
        marginBottom: theme.spacing.xl,
    },
    forgotPasswordText: {
        ...theme.typography.bodyLarge,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.bold,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.small,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    loginButtonContainer: {
        marginTop: theme.spacing.lg,
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
        color: theme.colors.text.primary,
        marginHorizontal: theme.spacing.md,
        textAlign: 'center',
        fontWeight: theme.fontWeight.black,
        flex: 1,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: theme.spacing.xl,
    },
    registerText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    registerLink: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.semiBold,
    },
});

export default LoginScreen; 