import { colors } from '../colors';
import { fontFamily, fontSize, lineHeight, fontWeight } from '../fonts';

export const spacing = {
    // Base spacing unit (4px)
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,

    // Specific spacing for common use cases
    screenPadding: 16,
    cardPadding: 16,
    buttonPadding: 12,
    inputPadding: 16,
    sectionSpacing: 24,
};

export const borderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
    full: 9999,
};

export const shadows = {
    // iOS shadows
    ios: {
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
    },

    // Android shadows
    android: {
        small: {
            elevation: 2,
        },
        medium: {
            elevation: 4,
        },
        large: {
            elevation: 8,
        },
    },
};

export const typography = {
    // Display Styles
    displayLarge: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: fontSize.display.large,
        lineHeight: lineHeight.display.large,
        fontWeight: fontWeight.bold,
    },
    displayMedium: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: fontSize.display.medium,
        lineHeight: lineHeight.display.medium,
        fontWeight: fontWeight.bold,
    },
    displaySmall: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: fontSize.display.small,
        lineHeight: lineHeight.display.small,
        fontWeight: fontWeight.bold,
    },

    // Heading Styles
    h1: {
        fontFamily: fontFamily.secondary.bold,
        fontSize: fontSize.heading.h1,
        lineHeight: lineHeight.heading.h1,
        fontWeight: fontWeight.bold,
    },
    h2: {
        fontFamily: fontFamily.secondary.semiBold,
        fontSize: fontSize.heading.h2,
        lineHeight: lineHeight.heading.h2,
        fontWeight: fontWeight.semiBold,
    },
    h3: {
        fontFamily: fontFamily.secondary.semiBold,
        fontSize: fontSize.heading.h3,
        lineHeight: lineHeight.heading.h3,
        fontWeight: fontWeight.semiBold,
    },
    h4: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: fontSize.heading.h4,
        lineHeight: lineHeight.heading.h4,
        fontWeight: fontWeight.medium,
    },
    h5: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: fontSize.heading.h5,
        lineHeight: lineHeight.heading.h5,
        fontWeight: fontWeight.medium,
    },
    h6: {
        fontFamily: fontFamily.secondary.medium,
        fontSize: fontSize.heading.h6,
        lineHeight: lineHeight.heading.h6,
        fontWeight: fontWeight.medium,
    },

    // Body Styles
    bodyLarge: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.body.large,
        lineHeight: lineHeight.body.large,
        fontWeight: fontWeight.regular,
    },
    bodyMedium: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.body.medium,
        lineHeight: lineHeight.body.medium,
        fontWeight: fontWeight.regular,
    },
    bodySmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.body.small,
        lineHeight: lineHeight.body.small,
        fontWeight: fontWeight.regular,
    },
    bodyXSmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.body.xsmall,
        lineHeight: lineHeight.body.xsmall,
        fontWeight: fontWeight.regular,
    },

    // Label Styles
    labelLarge: {
        fontFamily: fontFamily.primary.medium,
        fontSize: fontSize.label.large,
        lineHeight: lineHeight.label.large,
        fontWeight: fontWeight.medium,
    },
    labelMedium: {
        fontFamily: fontFamily.primary.medium,
        fontSize: fontSize.label.medium,
        lineHeight: lineHeight.label.medium,
        fontWeight: fontWeight.medium,
    },
    labelSmall: {
        fontFamily: fontFamily.primary.medium,
        fontSize: fontSize.label.small,
        lineHeight: lineHeight.label.small,
        fontWeight: fontWeight.medium,
    },

    // Button Styles
    buttonLarge: {
        fontFamily: fontFamily.primary.bold,
        fontSize: fontSize.button.large,
        lineHeight: lineHeight.button.large,
        fontWeight: fontWeight.bold,
    },
    buttonMedium: {
        fontFamily: fontFamily.primary.semiBold,
        fontSize: fontSize.button.medium,
        lineHeight: lineHeight.button.medium,
        fontWeight: fontWeight.semiBold,
    },
    buttonSmall: {
        fontFamily: fontFamily.primary.semiBold,
        fontSize: fontSize.button.small,
        lineHeight: lineHeight.button.small,
        fontWeight: fontWeight.semiBold,
    },

    // Caption Styles
    captionLarge: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.caption.large,
        lineHeight: lineHeight.caption.large,
        fontWeight: fontWeight.regular,
    },
    captionMedium: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.caption.medium,
        lineHeight: lineHeight.caption.medium,
        fontWeight: fontWeight.regular,
    },
    captionSmall: {
        fontFamily: fontFamily.primary.regular,
        fontSize: fontSize.caption.small,
        lineHeight: lineHeight.caption.small,
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
};

export default theme; 