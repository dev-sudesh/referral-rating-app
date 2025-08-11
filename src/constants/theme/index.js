import { Platform } from 'react-native';
import { colors } from '../colors';
import { fontFamily, fontSize, lineHeight, fontWeight } from '../fonts';
import { ResponsiveUI } from '../../utils/responsive/ResponsiveUi';

export const spacing = {
    // Base spacing unit (4px) - now responsive
    xs: ResponsiveUI.size(4),
    sm: ResponsiveUI.size(8),
    md: ResponsiveUI.size(16),
    lg: ResponsiveUI.size(24),
    xl: ResponsiveUI.size(32),
    xxl: ResponsiveUI.size(48),
    xxxl: ResponsiveUI.size(64),

    // Specific spacing for common use cases - now responsive
    screenPadding: ResponsiveUI.horizontalPadding(),
    cardPadding: ResponsiveUI.padding.md,
    buttonPadding: ResponsiveUI.padding.sm,
    inputPadding: ResponsiveUI.padding.md,
    sectionSpacing: ResponsiveUI.spacing().sectionSpacing,
};

export const borderRadius = {
    none: 0,
    xs: ResponsiveUI.size(4),
    sm: ResponsiveUI.size(8),
    md: ResponsiveUI.size(12),
    lg: ResponsiveUI.size(16),
    xl: ResponsiveUI.size(20),
    xxl: ResponsiveUI.size(24),
    round: ResponsiveUI.size(50),
    full: 9999,
};

export const shadows = {
    ...(Platform.OS === 'ios' ? {
        small: {
            shadowColor: colors.neutral[900],
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        medium: {
            shadowColor: colors.neutral[900],
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
        },
        large: {
            shadowColor: colors.neutral[900],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
        },
    } : {
        small: {
            elevation: 2,
        },
        medium: {
            elevation: 4,
        },
        large: {
            elevation: 8,
        },
    })
};

export const typography = {
    // Display Styles - now responsive
    displayLarge: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: ResponsiveUI.fontSize(fontSize.display.large),
        lineHeight: ResponsiveUI.fontSize(lineHeight.display.large),
        fontWeight: fontWeight.bold,
    },
    displayMedium: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: ResponsiveUI.fontSize(fontSize.display.medium),
        lineHeight: ResponsiveUI.fontSize(lineHeight.display.medium),
        fontWeight: fontWeight.bold,
    },
    displaySmall: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: ResponsiveUI.fontSize(fontSize.display.small),
        lineHeight: ResponsiveUI.fontSize(lineHeight.display.small),
        fontWeight: fontWeight.bold,
    },

    // Heading Styles - now responsive
    h1: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h1),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h1),
        fontWeight: fontWeight.bold,
    },
    h2: {
        fontFamily: fontFamily.secondary.semiBold,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h2),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h2),
        fontWeight: fontWeight.semiBold,
    },
    h3: {
        fontFamily: fontFamily.secondary.semiBold,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h3),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h3),
        fontWeight: fontWeight.semiBold,
    },
    h4: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h4),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h4),
        fontWeight: fontWeight.medium,
    },
    h5: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h5),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h5),
        fontWeight: fontWeight.medium,
    },
    h6: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.heading.h6),
        lineHeight: ResponsiveUI.fontSize(lineHeight.heading.h6),
        fontWeight: fontWeight.medium,
    },

    // Body Styles - now responsive
    bodyLarge: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.body.large),
        lineHeight: ResponsiveUI.fontSize(lineHeight.body.large),
        fontWeight: fontWeight.regular,
    },
    bodyMedium: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.body.medium),
        lineHeight: ResponsiveUI.fontSize(lineHeight.body.medium),
        fontWeight: fontWeight.regular,
    },
    bodySmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.body.small),
        lineHeight: ResponsiveUI.fontSize(lineHeight.body.small),
        fontWeight: fontWeight.regular,
    },
    bodyXSmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.body.xsmall),
        lineHeight: ResponsiveUI.fontSize(lineHeight.body.xsmall),
        fontWeight: fontWeight.regular,
    },

    // Label Styles - now responsive
    labelLarge: {
        fontFamily: fontFamily.primary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.label.large),
        lineHeight: ResponsiveUI.fontSize(lineHeight.label.large),
        fontWeight: fontWeight.medium,
    },
    labelMedium: {
        fontFamily: fontFamily.primary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.label.medium),
        lineHeight: ResponsiveUI.fontSize(lineHeight.label.medium),
        fontWeight: fontWeight.medium,
    },
    labelSmall: {
        fontFamily: fontFamily.primary.medium,
        fontSize: ResponsiveUI.fontSize(fontSize.label.small),
        lineHeight: ResponsiveUI.fontSize(lineHeight.label.small),
        fontWeight: fontWeight.medium,
    },

    // Button Styles - now responsive
    buttonLarge: {
        fontFamily: fontFamily.primary.bold,
        fontSize: ResponsiveUI.fontSize(fontSize.button.large),
        lineHeight: ResponsiveUI.fontSize(lineHeight.button.large),
        fontWeight: fontWeight.bold,
    },
    buttonMedium: {
        fontFamily: fontFamily.primary.semiBold,
        fontSize: ResponsiveUI.fontSize(fontSize.button.medium),
        lineHeight: ResponsiveUI.fontSize(lineHeight.button.medium),
        fontWeight: fontWeight.semiBold,
    },
    buttonSmall: {
        fontFamily: fontFamily.primary.semiBold,
        fontSize: ResponsiveUI.fontSize(fontSize.button.small),
        lineHeight: ResponsiveUI.fontSize(lineHeight.button.small),
        fontWeight: fontWeight.semiBold,
    },

    // Caption Styles - now responsive
    captionLarge: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.caption.large),
        lineHeight: ResponsiveUI.fontSize(lineHeight.caption.large),
        fontWeight: fontWeight.regular,
    },
    captionMedium: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.caption.medium),
        lineHeight: ResponsiveUI.fontSize(lineHeight.caption.medium),
        fontWeight: fontWeight.regular,
    },
    captionSmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: ResponsiveUI.fontSize(fontSize.caption.small),
        lineHeight: ResponsiveUI.fontSize(lineHeight.caption.small),
        fontWeight: fontWeight.regular,
    },
};

export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    fontFamily,
    fontSize,
    lineHeight,
    fontWeight,
    ResponsiveUI,
    // Responsive helpers for convenience
    responsive: {
        width: ResponsiveUI.width,
        height: ResponsiveUI.height,
        fontSize: ResponsiveUI.fontSize,
        size: ResponsiveUI.size,
        padding: ResponsiveUI.padding,
        margin: ResponsiveUI.margin,
        buttonHeight: ResponsiveUI.buttonHeight,
        inputHeight: ResponsiveUI.inputHeight,
        headerHeight: ResponsiveUI.headerHeight,
        iconSize: ResponsiveUI.iconSize,
        avatarSize: ResponsiveUI.avatarSize,
        isSmall: ResponsiveUI.isSmall,
        isLarge: ResponsiveUI.isLarge,
        deviceType: ResponsiveUI.deviceType,
        screen: ResponsiveUI.screen,
    },
};

export default theme; 