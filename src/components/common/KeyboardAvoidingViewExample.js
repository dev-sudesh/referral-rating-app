import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
} from 'react-native';
import KeyboardAvoidingView from './KeyboardAvoidingView';
import Button from '../ui/Button';
import { theme } from '../../constants/theme';

const KeyboardAvoidingViewExample = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = () => {
        Alert.alert('Form Submitted', JSON.stringify(formData, null, 2));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
            keyboardVerticalOffset={20}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            onKeyboardShow={() => { }}
            onKeyboardHide={() => { }}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Contact Form</Text>
                <Text style={styles.subtitle}>
                    This form demonstrates the KeyboardAvoidingView component
                </Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.colors.neutral[400]}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="Enter your email"
                        placeholderTextColor={theme.colors.neutral[400]}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(value) => handleInputChange('phone', value)}
                        placeholder="Enter your phone number"
                        placeholderTextColor={theme.colors.neutral[400]}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.message}
                        onChangeText={(value) => handleInputChange('message', value)}
                        placeholder="Enter your message"
                        placeholderTextColor={theme.colors.neutral[400]}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Submit Form"
                        onPress={handleSubmit}
                        variant="primary"
                        size="large"
                        style={styles.submitButton}
                    />
                </View>
            </View>

            {/* Add some extra content to demonstrate scrolling */}
            <View style={styles.extraContent}>
                <Text style={styles.extraText}>
                    This content will be pushed up when the keyboard appears,
                    demonstrating the keyboard avoiding behavior.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
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
        padding: theme.spacing.lg,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.labelMedium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.neutral[300],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        fontSize: theme.typography.bodyMedium.fontSize,
        color: theme.colors.text.primary,
        backgroundColor: theme.colors.background.secondary,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: theme.spacing.xl,
    },
    submitButton: {
        width: '100%',
    },
    extraContent: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.secondary,
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
    },
    extraText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
});

export default KeyboardAvoidingViewExample; 