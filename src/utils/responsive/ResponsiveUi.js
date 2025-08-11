import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get device dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11/XR - 414x896)
const BASE_WIDTH = 414;
const BASE_HEIGHT = 896;

/**
 * Responsive Width
 * Scales a width value based on the current device width relative to base width
 */
export const responsiveWidth = (size) => {
    return (size * SCREEN_WIDTH) / BASE_WIDTH;
};

/**
 * Responsive Height
 * Scales a height value based on the current device height relative to base height
 */
export const responsiveHeight = (size) => {
    return (size * SCREEN_HEIGHT) / BASE_HEIGHT;
};

/**
 * Responsive Font Size
 * Scales font size with pixel ratio consideration for better text rendering
 */
export const responsiveFontSize = (size) => {
    const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
    const newSize = size * scale;

    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
};

/**
 * Responsive Size (for both width and height equally)
 * Useful for square elements like icons, circular elements
 */
export const responsiveSize = (size) => {
    const scale = Math.min(SCREEN_WIDTH / BASE_WIDTH, SCREEN_HEIGHT / BASE_HEIGHT);
    return size * scale;
};

/**
 * Get Screen Dimensions
 */
export const getScreenDimensions = () => ({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
});

/**
 * Get Device Type based on screen width
 */
export const getDeviceType = () => {
    if (SCREEN_WIDTH < 768) {
        return 'phone';
    } else if (SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024) {
        return 'tablet';
    } else {
        return 'desktop';
    }
};

/**
 * Check if device is small (smaller phones)
 */
export const isSmallDevice = () => {
    return SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 667;
};

/**
 * Check if device is large (larger phones/phablets)
 */
export const isLargeDevice = () => {
    return SCREEN_WIDTH >= 414 || SCREEN_HEIGHT >= 896;
};

/**
 * Check if device is in landscape mode
 */
export const isLandscape = () => {
    return SCREEN_WIDTH > SCREEN_HEIGHT;
};

/**
 * Check if device is in portrait mode
 */
export const isPortrait = () => {
    return SCREEN_HEIGHT > SCREEN_WIDTH;
};

/**
 * Responsive Horizontal Padding
 * Provides appropriate horizontal padding based on device size
 */
export const getResponsiveHorizontalPadding = () => {
    if (isSmallDevice()) {
        return responsiveWidth(12);
    } else if (isLargeDevice()) {
        return responsiveWidth(20);
    } else {
        return responsiveWidth(16);
    }
};

/**
 * Responsive Vertical Padding
 * Provides appropriate vertical padding based on device size
 */
export const getResponsiveVerticalPadding = () => {
    if (isSmallDevice()) {
        return responsiveHeight(12);
    } else if (isLargeDevice()) {
        return responsiveHeight(20);
    } else {
        return responsiveHeight(16);
    }
};

/**
 * Responsive Margin
 */
export const responsiveMargin = {
    xs: responsiveSize(4),
    sm: responsiveSize(8),
    md: responsiveSize(16),
    lg: responsiveSize(24),
    xl: responsiveSize(32),
    xxl: responsiveSize(48),
    xxxl: responsiveSize(64),
};

/**
 * Responsive Padding
 */
export const responsivePadding = {
    xs: responsiveSize(4),
    sm: responsiveSize(8),
    md: responsiveSize(16),
    lg: responsiveSize(24),
    xl: responsiveSize(32),
    xxl: responsiveSize(48),
    xxxl: responsiveSize(64),
};

/**
 * Responsive Border Radius
 */
export const responsiveBorderRadius = {
    none: 0,
    xs: responsiveSize(4),
    sm: responsiveSize(8),
    md: responsiveSize(12),
    lg: responsiveSize(16),
    xl: responsiveSize(20),
    xxl: responsiveSize(24),
    round: responsiveSize(50),
    full: 9999,
};

/**
 * Button Heights based on device size
 */
export const getResponsiveButtonHeight = (size = 'medium') => {
    const heights = {
        small: isSmallDevice() ? 40 : 44,
        medium: isSmallDevice() ? 48 : 56,
        large: isSmallDevice() ? 52 : 60,
    };
    return responsiveHeight(heights[size] || heights.medium);
};

/**
 * Input Heights based on device size
 */
export const getResponsiveInputHeight = () => {
    return isSmallDevice() ? responsiveHeight(48) : responsiveHeight(56);
};

/**
 * Header Heights based on device size
 */
export const getResponsiveHeaderHeight = () => {
    return isSmallDevice() ? responsiveHeight(50) : responsiveHeight(60);
};

/**
 * Icon Sizes based on device size
 */
export const getResponsiveIconSize = (size = 'medium') => {
    const sizes = {
        small: isSmallDevice() ? 16 : 20,
        medium: isSmallDevice() ? 20 : 24,
        large: isSmallDevice() ? 24 : 28,
        xlarge: isSmallDevice() ? 28 : 32,
    };
    return responsiveSize(sizes[size] || sizes.medium);
};

/**
 * Avatar Sizes based on device size
 */
export const getResponsiveAvatarSize = (size = 'medium') => {
    const sizes = {
        small: isSmallDevice() ? 32 : 40,
        medium: isSmallDevice() ? 48 : 56,
        large: isSmallDevice() ? 64 : 80,
        xlarge: isSmallDevice() ? 80 : 100,
    };
    return responsiveSize(sizes[size] || sizes.medium);
};

/**
 * Get percentage-based dimensions
 */
export const getPercentageDimensions = (widthPercent, heightPercent) => ({
    width: (SCREEN_WIDTH * widthPercent) / 100,
    height: (SCREEN_HEIGHT * heightPercent) / 100,
});

/**
 * Responsive spacing for specific use cases
 */
export const getResponsiveSpacing = () => ({
    // Screen padding
    screenPadding: getResponsiveHorizontalPadding(),
    screenPaddingVertical: getResponsiveVerticalPadding(),

    // Card spacing
    cardPadding: responsivePadding.md,
    cardMargin: responsiveMargin.sm,

    // Button spacing
    buttonPadding: responsivePadding.md,
    buttonMargin: responsiveMargin.sm,

    // Input spacing
    inputPadding: responsivePadding.md,
    inputMargin: responsiveMargin.sm,

    // Section spacing
    sectionSpacing: responsiveMargin.lg,

    // Element spacing
    elementSpacing: responsiveMargin.md,
});

/**
 * Typography scaling
 */
export const getResponsiveTypography = () => ({
    // Display sizes
    displayLarge: responsiveFontSize(32),
    displayMedium: responsiveFontSize(28),
    displaySmall: responsiveFontSize(24),

    // Heading sizes
    h1: responsiveFontSize(28),
    h2: responsiveFontSize(24),
    h3: responsiveFontSize(20),
    h4: responsiveFontSize(18),
    h5: responsiveFontSize(16),
    h6: responsiveFontSize(14),

    // Body sizes
    bodyLarge: responsiveFontSize(16),
    bodyMedium: responsiveFontSize(14),
    bodySmall: responsiveFontSize(12),
    bodyXSmall: responsiveFontSize(10),

    // Label sizes
    labelLarge: responsiveFontSize(14),
    labelMedium: responsiveFontSize(12),
    labelSmall: responsiveFontSize(10),

    // Button sizes
    buttonLarge: responsiveFontSize(16),
    buttonMedium: responsiveFontSize(14),
    buttonSmall: responsiveFontSize(12),

    // Caption sizes
    captionLarge: responsiveFontSize(12),
    captionMedium: responsiveFontSize(10),
    captionSmall: responsiveFontSize(8),
});

// Export convenience object with all utilities
export const ResponsiveUI = {
    width: responsiveWidth,
    height: responsiveHeight,
    fontSize: responsiveFontSize,
    size: responsiveSize,
    screen: getScreenDimensions,
    deviceType: getDeviceType,
    isSmall: isSmallDevice,
    isLarge: isLargeDevice,
    isLandscape,
    isPortrait,
    padding: responsivePadding,
    margin: responsiveMargin,
    borderRadius: responsiveBorderRadius,
    buttonHeight: getResponsiveButtonHeight,
    inputHeight: getResponsiveInputHeight,
    headerHeight: getResponsiveHeaderHeight,
    iconSize: getResponsiveIconSize,
    avatarSize: getResponsiveAvatarSize,
    percentage: getPercentageDimensions,
    spacing: getResponsiveSpacing,
    typography: getResponsiveTypography,
    horizontalPadding: getResponsiveHorizontalPadding,
    verticalPadding: getResponsiveVerticalPadding,
};

export default ResponsiveUI;
