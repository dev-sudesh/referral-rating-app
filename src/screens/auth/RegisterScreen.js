import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { theme } from '../../constants/theme';
import ScreenContainer from '../../components/common/ScreenContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import TextInputField from '../../components/ui/TextInputField';
import Button from '../../components/ui/Button';

const RegisterScreen = ({ navigation }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            return false;
        }
        if (!formData.lastName.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            return false;
        }
        if (!formData.email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return false;
        }
        if (!formData.password.trim()) {
            Alert.alert('Error', 'Please enter a password');
            return false;
        }
        if (formData.password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }
        if (!acceptTerms) {
            Alert.alert('Error', 'Please accept the terms and conditions');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo purposes, show success and navigate
            Alert.alert(
                'Success',
                'Account created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.replace('MainTabs'),
                    },
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = () => {
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
                title="Create Account"
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <KeyboardAvoidingView>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Name Inputs */}
                        <View style={styles.nameContainer}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <TextInputField
                                    label="First Name"
                                    placeholder="Enter first name"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={formData.firstName}
                                    onChangeText={(value) => handleInputChange('firstName', value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <TextInputField
                                    label="Last Name"
                                    placeholder="Enter last name"
                                    placeholderTextColor={theme.colors.text.tertiary}
                                    value={formData.lastName}
                                    onChangeText={(value) => handleInputChange('lastName', value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* Email Input */}
                        <View style={styles.inputContainer}>
                            <TextInputField
                                label="Email Address"
                                placeholder="Enter your email"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                            />
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputContainer}>
                            <TextInputField
                                type="password"
                                label="Password"
                                placeholder="Create a password"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                            />
                        </View>

                        {/* Confirm Password Input */}
                        <View style={styles.inputContainer}>
                            <TextInputField
                                type="password"
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                placeholderTextColor={theme.colors.text.tertiary}
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                            />
                        </View>

                        {/* Register Button */}
                        <Button
                            title={isLoading ? 'Creating Account...' : 'Create an account'}
                            onPress={handleRegister}
                            disabled={isLoading}
                            loading={isLoading}
                            variant="primary"
                            size="medium"
                        />

                        {/* Terms and Conditions */}
                        <View style={styles.termsContainer}>
                            <Text style={styles.termsText}>
                                By entering your number, you agreeing to our{'\n'}
                                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                                <Text style={styles.termsLink}>Privacy Policy</Text>.
                            </Text>
                        </View>

                    </View>
                </ScrollView>
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
        marginTop: theme.responsive.isSmall() ? theme.spacing.lg : theme.spacing.xl,
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
    },
    form: {
        marginBottom: theme.spacing.xl,
    },
    nameContainer: {
        flexDirection: theme.responsive.isSmall() ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: theme.responsive.isSmall() ? 0 : theme.spacing.sm,
    },
    inputContainer: {
    },
    halfWidth: {
        width: theme.responsive.isSmall() ? '100%' : '48%',
        marginBottom: theme.responsive.isSmall() ? theme.spacing.md : 0,
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
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        minWidth: theme.responsive.size(44),
        minHeight: theme.responsive.size(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    eyeButtonText: {
        fontSize: 20,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: theme.spacing.xl,
    },
    checkbox: {
        width: theme.responsive.size(20),
        height: theme.responsive.size(20),
        borderWidth: 2,
        borderColor: theme.colors.border.medium,
        borderRadius: theme.borderRadius.xs,
        marginRight: theme.spacing.sm,
        marginTop: theme.responsive.size(2),
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary[500],
        borderColor: theme.colors.primary[500],
    },
    checkmark: {
        color: theme.colors.background.primary,
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
    },
    termsText: {
        flex: 1,
        ...theme.typography.bodyMedium,
        color: theme.colors.text.black,
        lineHeight: 20,
        textAlign: 'center',
    },
    termsLink: {
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.bold,
        textDecorationLine: 'underline',
    },
    registerButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.small,
    },
    registerButtonDisabled: {
        opacity: 0.6,
    },
    registerButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
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
        ...theme.typography.bodySmall,
        color: theme.colors.text.tertiary,
        marginHorizontal: theme.spacing.md,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: theme.spacing.xl,
    },
    loginText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    loginLink: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.semiBold,
    },
});

export default RegisterScreen; 