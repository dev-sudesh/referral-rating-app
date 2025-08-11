import React, { useState, useRef, useId, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';

const TextInputField = ({
    type = 'text',
    label,
    placeholder,
    value,
    onChangeText,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    autoCorrect = true,
    error,
    disabled = false,
    multiline = false,
    numberOfLines = 1,
    style,
    containerStyle,
    labelStyle,
    inputContainerStyle,
    testID,
    onValidation,
    required = false,
    minLength,
    maxLength,
    pattern,
    focusManager,
    inputId,
    ...props
}) => {
    const validTypes = ['text', 'password', 'email', 'number', 'phone', 'url', 'search'];
    if (!validTypes.includes(type)) {
        console.warn(`TextInputField: Invalid type "${type}". Valid types are: ${validTypes.join(', ')}. Defaulting to "text".`);
        type = 'text';
    }
    const [showPassword, setShowPassword] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const inputRef = useRef(null);
    const uniqueId = useId();

    // Prevent validation during initial render
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialized(true);
        }, 100);
        return () => clearTimeout(timer);
    }, [uniqueId, label, type]);

    const handleFocus = React.useCallback(() => {
        setHasInteracted(true);
        setIsInitialized(true);
    }, [uniqueId, label, focusManager, inputId]);

    const validateField = React.useCallback((inputValue) => {
        // Clear previous validation error
        setValidationError(null);

        // Required field validation
        if (required && (!inputValue || inputValue.trim() === '')) {
            return `${label || 'This field'} is required`;
        }

        // Skip other validations if field is empty and not required
        if (!inputValue || inputValue.trim() === '') {
            return null;
        }

        // Length validation
        if (minLength && inputValue.length < minLength) {
            return `${label || 'Field'} must be at least ${minLength} characters`;
        }

        if (maxLength && inputValue.length > maxLength) {
            return `${label || 'Field'} must be no more than ${maxLength} characters`;
        }

        // Type-specific validation
        switch (type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(inputValue)) {
                    return 'Please enter a valid email address';
                }
                break;

            case 'number':
                if (isNaN(inputValue) || inputValue === '') {
                    return 'Please enter a valid number';
                }
                break;

            case 'phone':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(inputValue.replace(/[\s\-\(\)]/g, ''))) {
                    return 'Please enter a valid phone number';
                }
                break;

            case 'url':
                try {
                    new URL(inputValue.startsWith('http') ? inputValue : `https://${inputValue}`);
                } catch {
                    return 'Please enter a valid URL';
                }
                break;

            case 'password':
                if (inputValue.length < 8) {
                    return 'Password must be at least 8 characters long';
                }
                break;

            default:
                break;
        }

        // Custom pattern validation
        if (pattern && !new RegExp(pattern).test(inputValue)) {
            return `${label || 'Field'} format is invalid`;
        }

        return null;
    }, [required, label, minLength, maxLength, type, pattern]);

    const handleBlur = React.useCallback(() => {
        // Only perform validation if user has interacted with the field AND component is initialized
        if (hasInteracted && isInitialized) {
            // Perform validation on blur
            const validationResult = validateField(value);
            setValidationError(validationResult);

            // Call onValidation callback if provided
            if (onValidation) {
                onValidation(validationResult, value);
            }
        } else {
            console.log(`[${uniqueId}] Skipping validation for: ${label} - hasInteracted: ${hasInteracted}, isInitialized: ${isInitialized}`);
        }
    }, [onValidation, value, validateField, uniqueId, label, hasInteracted, isInitialized, focusManager, inputId]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getInputStyle = () => {
        const baseStyle = [styles.input];


        if (error || validationError) {
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
    }

    const getContainerStyle = React.useCallback(() => {
        const baseContainerStyle = [styles.container];
        if (containerStyle) baseContainerStyle.push(containerStyle);
        return baseContainerStyle;
    }, [containerStyle]);

    const getLabelStyle = React.useCallback(() => {
        const baseLabelStyle = [styles.label];
        if (error || validationError) baseLabelStyle.push(styles.labelError);
        if (disabled) baseLabelStyle.push(styles.labelDisabled);
        if (labelStyle) baseLabelStyle.push(labelStyle);
        return baseLabelStyle;
    }, [error, validationError, disabled, labelStyle]);

    const getInputContainerStyle = React.useCallback(() => {
        const baseInputContainerStyle = [styles.inputContainer];


        if (error || validationError) {
            baseInputContainerStyle.push(styles.inputContainerError);
        }

        if (disabled) {
            baseInputContainerStyle.push(styles.inputContainerDisabled);
        }

        if (inputContainerStyle) baseInputContainerStyle.push(inputContainerStyle);

        return baseInputContainerStyle;
    }, [error, validationError, disabled, inputContainerStyle]);

    const EyeIcon = showPassword ? IconAsset.eyeOn : IconAsset.eyeOff;

    React.useEffect(() => {
        console.log(`[${uniqueId}] label: ${label}`);
        console.log(`[${uniqueId}] useEffect: ${inputRef.current?.isFocused()}`);
    }, [inputRef.current]);

    return (
        <View style={getContainerStyle()}>
            {label && (
                <Text style={getLabelStyle()}>
                    {label}
                </Text>
            )}

            <View style={getInputContainerStyle()}>
                <TextInput
                    ref={inputRef}
                    style={getInputStyle()}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.text.tertiary}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={type === 'password' && !showPassword}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    editable={!disabled}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    testID={testID || `text-input-${uniqueId}-${label?.toLowerCase().replace(/\s+/g, '-')}`}
                    {...props}
                />

                {type === 'password' && (
                    <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        <EyeIcon
                            width={20}
                            height={20}
                            fill={theme.colors.text.secondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || validationError) && (
                <Text style={styles.errorText}>{error || validationError}</Text>
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
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
        fontWeight: '500',
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
        borderColor: 'transparent',
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.white,
        minHeight: theme.responsive.inputHeight(),
        borderColor: theme.colors.border.light,
        ...theme.shadows.medium,
    },
    inputContainerFocused: {
        borderColor: theme.colors.primary[500],
        borderWidth: 2,
        ...theme.shadows.small,
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
        minHeight: theme.responsive.inputHeight(),
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        ...theme.typography.captionMedium,
        color: theme.colors.error[500],
        marginTop: theme.spacing.xs,
    },
});

TextInputField.propTypes = {
    type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'phone', 'url', 'search']),
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChangeText: PropTypes.func.isRequired,
    keyboardType: PropTypes.oneOf([
        'default',
        'number-pad',
        'decimal-pad',
        'numeric',
        'email-address',
        'phone-pad',
        'url',
        'web-search'
    ]),
    autoCapitalize: PropTypes.oneOf(['none', 'sentences', 'words', 'characters']),
    autoCorrect: PropTypes.bool,
    error: PropTypes.string,
    disabled: PropTypes.bool,
    multiline: PropTypes.bool,
    numberOfLines: PropTypes.number,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    labelStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    inputContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    testID: PropTypes.string,
    onValidation: PropTypes.func,
    required: PropTypes.bool,
    minLength: PropTypes.number,
    maxLength: PropTypes.number,
    pattern: PropTypes.string,
};

TextInputField.defaultProps = {
    type: 'text',
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    autoCorrect: true,
    disabled: false,
    multiline: false,
    numberOfLines: 1,
    required: false,
};

export default TextInputField;
