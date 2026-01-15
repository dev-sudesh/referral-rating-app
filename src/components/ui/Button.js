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
        } else if (variant === 'outline-primary') {
            baseStyle.push(styles.outlinePrimary);
            if (disabled) baseStyle.push(styles.outlinePrimaryDisabled);
        } else if (variant === 'secondary') {
            baseStyle.push(styles.secondary);
            if (disabled) baseStyle.push(styles.secondaryDisabled);
        } else if (variant === 'outline-secondary') {
            baseStyle.push(styles.outlineSecondary);
            if (disabled) baseStyle.push(styles.outlineSecondaryDisabled);
        } else if (variant === 'warning') {
            baseStyle.push(styles.warning);
            if (disabled) baseStyle.push(styles.warningDisabled);
        } else if (variant === 'outline-warning') {
            baseStyle.push(styles.outlineWarning);
            if (disabled) baseStyle.push(styles.outlineWarningDisabled);
        } else if (variant === 'danger') {
            baseStyle.push(styles.danger);
            if (disabled) baseStyle.push(styles.dangerDisabled);
        } else if (variant === 'outline-danger') {
            baseStyle.push(styles.outlineDanger);
            if (disabled) baseStyle.push(styles.outlineDangerDisabled);
        }

        if (style) baseStyle.push(style);
        return baseStyle;
    };

    const getTextStyle = () => {
        const baseTextStyle = [styles.text, styles[`${size}Text`]];

        if (variant === 'primary') {
            baseTextStyle.push(styles.primaryText);
            if (disabled) baseTextStyle.push(styles.primaryTextDisabled);
        } else if (variant === 'outline-primary') {
            baseTextStyle.push(styles.outlinePrimaryText);
            if (disabled) baseTextStyle.push(styles.outlinePrimaryTextDisabled);
        } else if (variant === 'secondary') {
            baseTextStyle.push(styles.secondaryText);
            if (disabled) baseTextStyle.push(styles.secondaryTextDisabled);
        } else if (variant === 'outline-secondary') {
            baseTextStyle.push(styles.outlineSecondaryText);
            if (disabled) baseTextStyle.push(styles.outlineSecondaryTextDisabled);
        } else if (variant === 'warning') {
            baseTextStyle.push(styles.warningText);
            if (disabled) baseTextStyle.push(styles.warningTextDisabled);
        } else if (variant === 'outline-warning') {
            baseTextStyle.push(styles.outlineWarningText);
            if (disabled) baseTextStyle.push(styles.outlineWarningTextDisabled);
        } else if (variant === 'danger') {
            baseTextStyle.push(styles.dangerText);
            if (disabled) baseTextStyle.push(styles.dangerTextDisabled);
        } else if (variant === 'outline-danger') {
            baseTextStyle.push(styles.outlineDangerText);
            if (disabled) baseTextStyle.push(styles.outlineDangerTextDisabled);
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
                        variant === 'primary' || variant === 'danger'
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
    // Outline Primary variant
    outlinePrimary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
        ...theme.shadows.none,
    },
    outlinePrimaryDisabled: {
        borderColor: theme.colors.neutral[300],
    },
    // Secondary variant
    secondary: {
        backgroundColor: theme.colors.secondary[500],
    },
    secondaryDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    // Outline Secondary variant
    outlineSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.secondary[500],
        ...theme.shadows.none,
    },
    outlineSecondaryDisabled: {
        borderColor: theme.colors.neutral[300],
    },
    // Warning variant
    warning: {
        backgroundColor: theme.colors.warning[500],
    },
    warningDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    // Outline Warning variant
    outlineWarning: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.warning[500],
        ...theme.shadows.none,
    },
    outlineWarningDisabled: {
        borderColor: theme.colors.neutral[300],
    },
    // Danger variant
    danger: {
        backgroundColor: '#EF4444',
    },
    dangerDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    // Outline Danger variant
    outlineDanger: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#EF4444',
        ...theme.shadows.none,
    },
    outlineDangerDisabled: {
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
    // Warning text
    warningText: {
        color: theme.colors.text.white,
    },
    warningTextDisabled: {
        color: theme.colors.text.disabled,
    },
    // Outline Warning text
    outlineWarningText: {
        color: theme.colors.warning[500],
    },
    outlineWarningTextDisabled: {
        color: theme.colors.text.disabled,
    },
    // Danger text
    dangerText: {
        color: theme.colors.text.white,
    },
    // Outline Danger text
    outlineDangerText: {
        color: theme.colors.error[500],
    },
    outlineDangerTextDisabled: {
        color: theme.colors.text.disabled,
    },
    dangerTextDisabled: {
        color: theme.colors.text.disabled,
    },
});

export default Button; 