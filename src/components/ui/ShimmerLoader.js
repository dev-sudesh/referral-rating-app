import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ShimmerLoader = ({ style, count = 3 }) => {
    return (
        <ScrollView
            style={style}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {Array.from({ length: count }).map((_, index) => (
                <ShimmerCard key={index} delay={index * 200} />
            ))}
        </ScrollView>
    );
};

const ShimmerCard = ({ delay = 0 }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startDelay = setTimeout(() => {
            const shimmerAnimation = Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            );
            shimmerAnimation.start();
        }, delay);

        return () => {
            clearTimeout(startDelay);
            shimmerAnim.stopAnimation();
        };
    }, [shimmerAnim, delay]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
        <View style={styles.shimmerCard}>
            <View style={styles.shimmerCardHeader}>
                <ShimmerBox
                    style={styles.shimmerImage}
                    shimmerAnim={shimmerAnim}
                    translateX={translateX}
                />
                <View style={styles.shimmerCardInfo}>
                    <View style={styles.shimmerTags}>
                        <ShimmerBox
                            style={styles.shimmerTag}
                            shimmerAnim={shimmerAnim}
                            translateX={translateX}
                        />
                        <ShimmerBox
                            style={[styles.shimmerTag, { width: 60 }]}
                            shimmerAnim={shimmerAnim}
                            translateX={translateX}
                        />
                    </View>
                    <ShimmerBox
                        style={styles.shimmerTitle}
                        shimmerAnim={shimmerAnim}
                        translateX={translateX}
                    />
                    <ShimmerBox
                        style={styles.shimmerSubtitle}
                        shimmerAnim={shimmerAnim}
                        translateX={translateX}
                    />
                </View>
            </View>
        </View>
    );
};

const ShimmerBox = ({ style, shimmerAnim, translateX }) => {
    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 0.3, 0.5, 0.7, 1],
        outputRange: [0, 0.3, 1, 0.3, 0],
    });

    return (
        <View style={[style, styles.shimmerBox]}>
            <Animated.View
                style={[
                    styles.shimmerOverlay,
                    {
                        transform: [{ translateX }],
                        opacity,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: theme.spacing.xl,
    },
    shimmerCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.custom({
            color: theme.colors.neutral[500],
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 0.4,
        }),
    },
    shimmerCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
    },
    shimmerBox: {
        backgroundColor: theme.colors.neutral[200],
        overflow: 'hidden',
    },
    shimmerImage: {
        width: theme.responsive.size(70),
        height: theme.responsive.size(70),
        borderRadius: theme.borderRadius.sm,
    },
    shimmerCardInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    shimmerTags: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    shimmerTag: {
        height: 20,
        width: 50,
        borderRadius: theme.borderRadius.sm,
    },
    shimmerTitle: {
        height: 16,
        width: '80%',
        borderRadius: theme.borderRadius.xs,
    },
    shimmerSubtitle: {
        height: 14,
        width: '60%',
        borderRadius: theme.borderRadius.xs,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: SCREEN_WIDTH * 0.3,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
});

export default ShimmerLoader;

