import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../../constants/theme';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    ...props
}) => {
    const getButtonStyle = () => {
        const baseStyle = [styles.button, styles[size]];

        if (variant === 'primary') {
            baseStyle.push(styles.primary);
            if (disabled) baseStyle.push(styles.primaryDisabled);
        } else if (variant === 'secondary') {
            baseStyle.push(styles.secondary);
            if (disabled) baseStyle.push(styles.secondaryDisabled);
        } else if (variant === 'outline') {
            baseStyle.push(styles.outline);
            if (disabled) baseStyle.push(styles.outlineDisabled);
        }

        if (style) baseStyle.push(style);
        return baseStyle;
    };

    const getTextStyle = () => {
        const baseTextStyle = [styles.text, styles[`${size}Text`]];

        if (variant === 'primary') {
            baseTextStyle.push(styles.primaryText);
            if (disabled) baseTextStyle.push(styles.primaryTextDisabled);
        } else if (variant === 'secondary') {
            baseTextStyle.push(styles.secondaryText);
            if (disabled) baseTextStyle.push(styles.secondaryTextDisabled);
        } else if (variant === 'outline') {
            baseTextStyle.push(styles.outlineText);
            if (disabled) baseTextStyle.push(styles.outlineTextDisabled);
        }

        if (textStyle) baseTextStyle.push(textStyle);
        return baseTextStyle;
    };

    return (
        <TouchableOpacity

            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={1}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={
                        variant === 'primary'
                            ? theme.colors.background.primary
                            : theme.colors.primary[500]
                    }
                    size="small"
                />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.small,
    },
    // Size variants
    small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: theme.responsive.buttonHeight('small'),
    },
    medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: theme.responsive.buttonHeight('medium'),
    },
    large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: theme.responsive.buttonHeight('large'),
    },
    // Primary variant
    primary: {
        backgroundColor: theme.colors.primary[500],
    },
    primaryDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    // Secondary variant
    secondary: {
        backgroundColor: theme.colors.secondary[500],
    },
    secondaryDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    // Outline variant
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
    },
    outlineDisabled: {
        borderColor: theme.colors.neutral[300],
    },
    // Text styles
    text: {
        fontWeight: theme.fontWeight.semiBold,
    },
    smallText: {
        ...theme.typography.buttonSmall,
    },
    mediumText: {
        ...theme.typography.buttonMedium,
    },
    largeText: {
        ...theme.typography.buttonLarge,
    },
    // Primary text
    primaryText: {
        color: theme.colors.background.primary,
    },
    primaryTextDisabled: {
        color: theme.colors.text.disabled,
    },
    // Secondary text
    secondaryText: {
        color: theme.colors.background.primary,
    },
    secondaryTextDisabled: {
        color: theme.colors.text.disabled,
    },
    // Outline text
    outlineText: {
        color: theme.colors.primary[500],
    },
    outlineTextDisabled: {
        color: theme.colors.text.disabled,
    },
});

export default Button; 