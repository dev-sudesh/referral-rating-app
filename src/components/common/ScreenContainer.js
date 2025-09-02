import React from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import { theme } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

/**
 * ScreenContainer - A wrapper component that provides consistent theming and layout for all screens
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.backgroundColor - Background color (defaults to theme background.primary)
 * @param {string} props.statusBarStyle - Status bar style ('light-content', 'dark-content', 'default')
 * @param {string} props.statusBarColor - Status bar background color
 * @param {boolean} props.statusBarHidden - Whether to hide the status bar
 * @param {boolean} props.translucent - Whether the status bar is translucent
 * @param {Object} props.containerStyle - Additional styles for the main container
 * @param {Object} props.contentStyle - Additional styles for the content area
 * @param {boolean} props.safeArea - Whether to use SafeAreaView (defaults to true)
 * @param {boolean} props.edges - SafeAreaView edges to apply (defaults to ['top', 'right', 'bottom', 'left'])
 * @param {string} props.padding - Padding preset ('none', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl')
 * @param {Object} props.paddingCustom - Custom padding object {top, right, bottom, left}
 * @param {boolean} props.centerContent - Whether to center content vertically and horizontally
 * @param {boolean} props.scrollable - Whether the content should be scrollable
 * @param {string} props.alignItems - Content alignment ('flex-start', 'center', 'flex-end', 'stretch')
 * @param {string} props.justifyContent - Content justification ('flex-start', 'center', 'flex-end', 'space-between', 'space-around')
 */
const ScreenContainer = ({
    children,
    backgroundColor = theme.colors.background.primary,
    statusBarStyle = 'dark-content',
    statusBarColor,
    statusBarHidden = true,
    translucent = false,
    containerStyle,
    contentStyle,
    safeArea = true,
    edges = ['top', 'right', 'bottom', 'left'],
    padding = 'none',
    paddingCustom,
    centerContent = false,
    scrollable = false,
    alignItems = 'stretch',
    justifyContent = 'flex-start',
}) => {
    // Get padding value based on preset
    const getPaddingValue = (preset) => {
        const paddingMap = {
            none: 0,
            xs: theme.spacing.xs,
            sm: theme.spacing.sm,
            md: theme.spacing.md,
            lg: theme.spacing.lg,
            xl: theme.spacing.xl,
            xxl: theme.spacing.xxl,
            xxxl: theme.spacing.xxxl,
        };
        return paddingMap[preset] || theme.spacing.md;
    };

    // Determine status bar background color
    const getStatusBarColor = () => {
        if (statusBarColor) return statusBarColor;
        if (translucent) return 'transparent';
        return backgroundColor;
    };

    // Base container styles
    const baseContainerStyle = {
        flex: 1,
        backgroundColor,
        alignItems: centerContent ? 'center' : alignItems,
        justifyContent: centerContent ? 'center' : justifyContent,
    };

    // Content styles
    const contentStyles = {
        flex: 1,
        width: Dimensions.get('window').width,
        ...(paddingCustom && { ...paddingCustom }),
        ...(!paddingCustom && { padding: getPaddingValue(padding) }),
        alignItems: centerContent ? 'center' : alignItems,
        justifyContent: centerContent ? 'center' : justifyContent,
    };

    // Status bar configuration
    const statusBarConfig = {
        barStyle: statusBarStyle,
        backgroundColor: getStatusBarColor(),
        hidden: statusBarHidden,
        translucent,
    };

    // Render content with appropriate wrapper
    const renderContent = () => {
        const content = (
            <View style={[contentStyles, contentStyle]}>
                {children}
            </View>
        );

        if (scrollable) {
            const ScrollView = require('react-native').ScrollView;
            return (
                <ScrollView
                    style={baseContainerStyle}
                    contentContainerStyle={[contentStyles, contentStyle]}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    bounces={true}
                >
                    {children}
                </ScrollView>
            );
        }

        return (
            <View style={[baseContainerStyle, containerStyle]}>
                {content}
            </View>
        );
    };

    // Render with SafeAreaView if enabled
    if (safeArea) {
        const { SafeAreaProvider, useSafeAreaInsets, SafeAreaView } = require('react-native-safe-area-context');

        return (
            <>
                <StatusBar {...statusBarConfig} />
                <SafeAreaProvider>
                    <SafeAreaView
                        style={[baseContainerStyle, containerStyle]}
                        edges={edges}
                    >
                        {renderContent()}
                    </SafeAreaView>
                </SafeAreaProvider>
            </>
        );
    }

    return (
        <>
            <StatusBar {...statusBarConfig} />
            {renderContent()}
        </>
    );
};

// Preset configurations for common screen types
ScreenContainer.presets = {
    // Default screen with standard padding
    default: {
        padding: 'md',
        safeArea: true,
    },

    // Full screen without padding
    full: {
        padding: 'none',
        safeArea: true,
    },

    // Centered content screen
    centered: {
        padding: 'md',
        safeArea: true,
        centerContent: true,
    },

    // Scrollable screen
    scrollable: {
        padding: 'md',
        safeArea: true,
        scrollable: true,
    },

    // Modal screen
    modal: {
        padding: 'lg',
        safeArea: true,
        backgroundColor: theme.colors.background.secondary,
    },

    // Auth screen
    auth: {
        paddingVertical: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
        safeArea: true,
        centerContent: true,
        backgroundColor: theme.colors.background.primary,
    },

    // List screen
    list: {
        padding: 'sm',
        safeArea: true,
        scrollable: true,
    },

    // Detail screen
    detail: {
        padding: 'md',
        safeArea: true,
        scrollable: true,
    },
};

export default ScreenContainer;
