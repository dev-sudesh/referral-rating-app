import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../../constants/theme';

const NoDataAnimation = ({
    message = "No data available",
    subtitle = "Try adjusting your filters or check back later",
    icon: Icon,
    size = 'medium',
    showAnimation = true,
    customStyles = {}
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

    React.useEffect(() => {
        if (showAnimation) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(1);
            scaleAnim.setValue(1);
        }
    }, [showAnimation]);

    const getSizeConfig = () => {
        switch (size) {
            case 'small':
                return {
                    containerPadding: theme.spacing.lg,
                    iconSize: 80,
                    titleSize: theme.typography.bodyMedium,
                    subtitleSize: theme.typography.captionMedium,
                };
            case 'large':
                return {
                    containerPadding: theme.spacing.xxl,
                    iconSize: 160,
                    titleSize: theme.typography.h3,
                    subtitleSize: theme.typography.bodyMedium,
                };
            default: // medium
                return {
                    containerPadding: theme.spacing.xl,
                    iconSize: 120,
                    titleSize: theme.typography.h4,
                    subtitleSize: theme.typography.bodySmall,
                };
        }
    };

    const sizeConfig = getSizeConfig();

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                    padding: sizeConfig.containerPadding,
                },
                customStyles
            ]}
        >
            {Icon && (
                <View style={[styles.iconContainer, { width: sizeConfig.iconSize, height: sizeConfig.iconSize }]}>
                    <Icon width={sizeConfig.iconSize * 0.6} height={sizeConfig.iconSize * 0.6} />
                </View>
            )}

            <Text style={[styles.message, sizeConfig.titleSize]}>
                {message}
            </Text>

            {subtitle && (
                <Text style={[styles.subtitle, sizeConfig.subtitleSize]}>
                    {subtitle}
                </Text>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        opacity: 0.7,
    },
    message: {
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
        fontWeight: theme.fontWeight.medium,
    },
    subtitle: {
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        lineHeight: theme.typography.bodyMedium.lineHeight * 1.2,
    },
});

export default NoDataAnimation;
