import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { theme } from '../../constants/theme';
import TextInputField from './TextInputField';

const TextInputFieldExample = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleInputChange = (field, value) => {
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
    };

    const validateForm = () => {
        const newErrors = {
            email: '',
            password: '',
            name: '',
        };
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Please enter your name';
            isValid = false;
        }

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

    const handleSubmit = () => {
        if (validateForm()) {
            Alert.alert('Success', 'Form is valid!', [
                { text: 'OK', onPress: () => console.log('Form submitted') }
            ]);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>TextInputField Test</Text>

            <TextInputField
                label="Full Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                error={errors.name}
                autoCapitalize="words"
            />

            <TextInputField
                label="Email Address"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                placeholder="Enter your email address"
            />

            <TextInputField
                label="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.password}
                placeholder="Enter your password"
            />

            <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.8}
            >
                <Text style={styles.submitButtonText}>Test Form</Text>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    This example demonstrates:
                </Text>
                <Text style={styles.infoText}>• Text input with labels</Text>
                <Text style={styles.infoText}>• Password field with toggle</Text>
                <Text style={styles.infoText}>• Error handling and validation</Text>
                <Text style={styles.infoText}>• Different keyboard types</Text>
                <Text style={styles.infoText}>• Auto-capitalization settings</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    submitButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        ...theme.shadows.small,
    },
    submitButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    infoContainer: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
    },
    infoText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
});

export default TextInputFieldExample; 