import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { theme } from '../../constants/theme';

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    error,
    disabled = false,
    multiline = false,
    numberOfLines = 1,
    style,
    containerStyle,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getInputStyle = () => {
        const baseStyle = [styles.input];

        if (isFocused) {
            baseStyle.push(styles.inputFocused);
        }

        if (error) {
            baseStyle.push(styles.inputError);
        }

        if (disabled) {
            baseStyle.push(styles.inputDisabled);
        }

        if (multiline) {
            baseStyle.push(styles.inputMultiline);
        }

        if (style) baseStyle.push(style);
        return baseStyle;
    };

    const getContainerStyle = () => {
        const baseContainerStyle = [styles.container];
        if (containerStyle) baseContainerStyle.push(containerStyle);
        return baseContainerStyle;
    };

    return (
        <View style={getContainerStyle()}>
            {label && (
                <Text style={[
                    styles.label,
                    error && styles.labelError,
                    disabled && styles.labelDisabled,
                ]}>
                    {label}
                </Text>
            )}

            <View style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError,
                disabled && styles.inputContainerDisabled,
            ]}>
                <TextInput
                    style={getInputStyle()}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.eyeButtonText}>
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.labelLarge,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    labelError: {
        color: theme.colors.error[500],
    },
    labelDisabled: {
        color: theme.colors.text.disabled,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.primary,
    },
    inputContainerFocused: {
        borderColor: theme.colors.primary[500],
        ...theme.shadows.ios.small,
    },
    inputContainerError: {
        borderColor: theme.colors.error[500],
    },
    inputContainerDisabled: {
        backgroundColor: theme.colors.neutral[100],
        borderColor: theme.colors.border.light,
    },
    input: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
    },
    inputFocused: {
        color: theme.colors.text.primary,
    },
    inputError: {
        color: theme.colors.error[500],
    },
    inputDisabled: {
        color: theme.colors.text.disabled,
    },
    inputMultiline: {
        textAlignVertical: 'top',
        minHeight: 80,
    },
    eyeButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    eyeButtonText: {
        fontSize: 20,
    },
    errorText: {
        ...theme.typography.captionMedium,
        color: theme.colors.error[500],
        marginTop: theme.spacing.xs,
    },
});

export default Input; 