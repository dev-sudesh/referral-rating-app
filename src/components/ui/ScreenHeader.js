import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    Keyboard,
} from 'react-native';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';

/**
 * ScreenHeader Component
 * A flexible header component for screens with various configurations
 * 
 * @param {Object} props
 * @param {string} props.title - The main title text
 * @param {string} props.subtitle - Optional subtitle text
 * @param {React.ReactNode} props.leftComponent - Custom left component (back button, menu, etc.)
 * @param {React.ReactNode} props.rightComponent - Custom right component (actions, buttons, etc.)
 * @param {React.ReactNode} props.centerComponent - Custom center component (overrides title/subtitle)
 * @param {boolean} props.showBackButton - Whether to show a back button
 * @param {Function} props.onBackPress - Callback for back button press
 * @param {string} props.backButtonText - Text for back button (default: "Back")
 * @param {string} props.variant - Header variant: 'default', 'transparent', 'elevated'
 * @param {boolean} props.showShadow - Whether to show shadow (default: true for elevated variant)
 * @param {Object} props.style - Additional styles for the header container
 * @param {Object} props.titleStyle - Additional styles for the title
 * @param {Object} props.subtitleStyle - Additional styles for the subtitle
 * @param {boolean} props.safeArea - Whether to include safe area padding (default: true)
 * @param {string} props.backgroundColor - Custom background color
 * @param {string} props.titleColor - Custom title color
 * @param {string} props.subtitleColor - Custom subtitle color
 */
const ScreenHeader = ({
    title,
    subtitle,
    leftComponent,
    rightComponent,
    centerComponent,
    showBackButton = false,
    onBackPress,
    backButtonText = 'Back',
    variant = 'default',
    showShadow,
    style,
    titleStyle,
    subtitleStyle,
    safeArea = true,
    backgroundColor,
    titleColor,
    subtitleColor,
}) => {
    // Determine shadow based on variant and showShadow prop
    const shouldShowShadow = showShadow !== undefined
        ? showShadow
        : variant === 'elevated';

    // Get background color based on variant
    const getBackgroundColor = () => {
        if (backgroundColor) return backgroundColor;

        switch (variant) {
            case 'transparent':
                return 'transparent';
            case 'elevated':
                return theme.colors.background.white;
            default:
                return 'transparent';
        }
    };

    // Get text colors
    const getTitleColor = () => titleColor || theme.colors.text.primary;
    const getSubtitleColor = () => subtitleColor || theme.colors.text.secondary;

    // Default back button component
    const renderBackButton = () => {
        if (!showBackButton || !onBackPress) return null;

        return (
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    if (Keyboard.isVisible()) {
                        Keyboard.dismiss();
                        return;
                    }
                    onBackPress();
                }}
                activeOpacity={0.7}
            >
                <IconAsset.arrowBack />
            </TouchableOpacity>
        );
    };

    // Default center content
    const renderCenterContent = () => {
        if (centerComponent) {
            return centerComponent;
        }

        return (
            <View style={styles.centerContent}>
                {title && (
                    <Text
                        style={[
                            styles.title,
                            { color: getTitleColor() },
                            titleStyle
                        ]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                )}
                {subtitle && (
                    <Text
                        style={[
                            styles.subtitle,
                            { color: getSubtitleColor() },
                            subtitleStyle
                        ]}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>
        );
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    paddingTop: safeArea ? (Platform.OS === 'ios' ? 0 : 0) : 0,
                    ...(shouldShowShadow && Platform.OS === 'ios' ? shadows.ios.medium : {}),
                    ...(shouldShowShadow && Platform.OS === 'android' ? shadows.android.medium : {}),
                },
                style,
            ]}
        >
            <View style={styles.content}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {leftComponent || renderBackButton()}
                </View>

                {/* Center Section */}
                <View style={styles.centerSection}>
                    {renderCenterContent()}
                </View>

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {rightComponent}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.md,
        minHeight: theme.responsive.headerHeight(),
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.typography.h4,
        textAlign: 'center',
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.bodySmall,
        textAlign: 'center',
    },
    backButton: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.white,
        borderRadius: theme.borderRadius.lg,
        minWidth: theme.responsive.size(44),
        minHeight: theme.responsive.size(44),
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    backButtonText: {
        ...theme.typography.labelMedium,
        color: theme.colors.primary[500],
    },
});

export default ScreenHeader;
