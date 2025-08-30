import React from 'react';
import {
    View,
    TouchableOpacity,
    Animated,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { theme } from '../../constants/theme';

/**
 * ToggleSwitch Component
 * A customizable toggle switch component with smooth animations
 * 
 * @param {Object} props
 * @param {boolean} props.value - Current state of the toggle
 * @param {Function} props.onValueChange - Callback when toggle state changes
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @param {string} props.activeColor - Color when toggle is active
 * @param {string} props.inactiveColor - Color when toggle is inactive
 * @param {string} props.thumbColor - Color of the toggle thumb
 * @param {Object} props.style - Additional styles for the container
 */
const ToggleSwitch = ({
    value = false,
    onValueChange,
    disabled = false,
    activeColor,
    inactiveColor,
    thumbColor,
    style,
}) => {
    const [animatedValue] = React.useState(new Animated.Value(value ? 1 : 0));

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [value, animatedValue]);

    const handlePress = () => {
        if (!disabled && onValueChange) {
            onValueChange(!value);
        }
    };

    // Color configuration
    const getActiveColor = () => activeColor || theme.colors.primary[500];
    const getInactiveColor = () => inactiveColor || theme.colors.neutral[300];
    const getThumbColor = () => thumbColor || theme.colors.background.white;

    // Animated styles
    const trackColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [getInactiveColor(), getActiveColor()],
    });

    const thumbTranslateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.responsive.size(2), theme.responsive.size(24)], // Based on track width and thumb size
    });

    const thumbScale = animatedValue.interpolate({
        inputRange: [0, 0.1, 0.9, 1],
        outputRange: [1, 1.1, 1.1, 1],
    });

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handlePress}
            activeOpacity={1}
            disabled={disabled}
        >
            <Animated.View
                style={[
                    styles.track,
                    {
                        backgroundColor: trackColor,
                        opacity: disabled ? 0.5 : 1,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            backgroundColor: getThumbColor(),
                            transform: [
                                { translateX: thumbTranslateX },
                                { scale: thumbScale },
                            ],
                        },
                    ]}
                />
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    track: {
        width: theme.responsive.size(46),
        height: theme.responsive.size(24),
        borderRadius: theme.borderRadius.full,
        position: 'relative',
        justifyContent: 'center',
    },
    thumb: {
        width: theme.responsive.size(20),
        height: theme.responsive.size(20),
        borderRadius: theme.borderRadius.full,
        position: 'absolute',
        ...theme.shadows.small,
    },
});

export default ToggleSwitch;
