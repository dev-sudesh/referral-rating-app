import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

const LoadingIndicator = ({
    type = 'spinner',
    size = 'medium',
    color = colors.primary[500],
    backgroundColor = colors.background.primary,
    style,
    containerStyle,
}) => {
    const animatedValues = useRef({
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        translateY: new Animated.Value(0),
    }).current;

    const dotAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const waveAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    // Store animation references for cleanup
    const animationRefs = useRef({
        spinner: null,
        pulse: null,
        dots: [],
        wave: [],
    }).current;

    // Size configurations
    const sizeConfig = {
        small: {
            spinner: 20,
            dots: 4,
            pulse: 24,
            wave: 30,
        },
        medium: {
            spinner: 32,
            dots: 6,
            pulse: 40,
            wave: 50,
        },
        large: {
            spinner: 48,
            dots: 8,
            pulse: 60,
            wave: 80,
        },
    };

    const currentSize = sizeConfig[size];

    // Consolidated animation effect
    useEffect(() => {
        // Clean up any existing animations
        if (animationRefs.spinner) {
            animationRefs.spinner.stop();
            animationRefs.spinner = null;
        }
        if (animationRefs.pulse) {
            animationRefs.pulse.stop();
            animationRefs.pulse = null;
        }
        animationRefs.dots.forEach(anim => {
            if (anim) anim.stop();
        });
        animationRefs.dots.length = 0;
        animationRefs.wave.forEach(anim => {
            if (anim) anim.stop();
        });
        animationRefs.wave.length = 0;

        // Reset animation values
        animatedValues.rotation.setValue(0);
        animatedValues.scale.setValue(1);
        dotAnimations.forEach(dot => dot.setValue(0));
        waveAnimations.forEach(wave => wave.setValue(0));

        // Start appropriate animation based on type
        switch (type) {
            case 'spinner':
                animationRefs.spinner = Animated.loop(
                    Animated.timing(animatedValues.rotation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    })
                );
                animationRefs.spinner.start();
                break;

            case 'pulse':
                animationRefs.pulse = Animated.loop(
                    Animated.sequence([
                        Animated.timing(animatedValues.scale, {
                            toValue: 1.2,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(animatedValues.scale, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ])
                );
                animationRefs.pulse.start();
                break;

            case 'dots':
                // Create a coordinated dots animation that restarts from the beginning
                const dotsSequence = Animated.sequence([
                    // First dot
                    Animated.timing(dotAnimations[0], {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // Second dot
                    Animated.timing(dotAnimations[1], {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // Third dot
                    Animated.timing(dotAnimations[2], {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    // Fade out all dots together
                    Animated.parallel([
                        Animated.timing(dotAnimations[0], {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dotAnimations[1], {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dotAnimations[2], {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]),
                ]);

                const dotsLoop = Animated.loop(dotsSequence);
                animationRefs.dots.push(dotsLoop);
                dotsLoop.start();
                break;

            case 'wave':
                const waveAnimationsArray = waveAnimations.map((_, index) => {
                    const animation = Animated.loop(
                        Animated.sequence([
                            Animated.timing(waveAnimations[index], {
                                toValue: 1,
                                duration: 1000,
                                delay: index * 100,
                                useNativeDriver: true,
                            }),
                            Animated.timing(waveAnimations[index], {
                                toValue: 0,
                                duration: 1000,
                                useNativeDriver: true,
                            }),
                        ])
                    );
                    animationRefs.wave.push(animation);
                    return animation;
                });
                waveAnimationsArray.forEach(animation => animation.start());
                break;

            default:
                // Default to spinner
                animationRefs.spinner = Animated.loop(
                    Animated.timing(animatedValues.rotation, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    })
                );
                animationRefs.spinner.start();
                break;
        }

        // Cleanup function
        return () => {
            if (animationRefs.spinner) {
                animationRefs.spinner.stop();
            }
            if (animationRefs.pulse) {
                animationRefs.pulse.stop();
            }
            animationRefs.dots.forEach(anim => {
                if (anim) anim.stop();
            });
            animationRefs.wave.forEach(anim => {
                if (anim) anim.stop();
            });
        };
    }, [type, size]); // Only re-run when type or size changes

    const spin = animatedValues.rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const renderSpinner = () => (
        <View style={[styles.spinnerContainer, { width: currentSize.spinner, height: currentSize.spinner }]}>
            <Animated.View
                style={[
                    styles.spinner,
                    {
                        width: currentSize.spinner,
                        height: currentSize.spinner,
                        borderColor: color,
                        transform: [{ rotate: spin }],
                    },
                ]}
            />
        </View>
    );

    const renderPulse = () => (
        <Animated.View
            style={[
                styles.pulse,
                {
                    width: currentSize.pulse,
                    height: currentSize.pulse,
                    backgroundColor: color,
                    transform: [{ scale: animatedValues.scale }],
                },
            ]}
        />
    );

    const renderDots = () => (
        <View style={styles.dotsContainer}>
            {dotAnimations.map((animation, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            width: currentSize.dots,
                            height: currentSize.dots,
                            backgroundColor: color,
                            opacity: animation,
                            transform: [
                                {
                                    scale: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );

    const renderWave = () => (
        <View style={styles.waveContainer}>
            {waveAnimations.map((animation, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.waveBar,
                        {
                            width: 4,
                            height: currentSize.wave,
                            backgroundColor: color,
                            opacity: animation,
                            transform: [
                                {
                                    scaleY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.1, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}
        </View>
    );

    const renderContent = () => {
        switch (type) {
            case 'spinner':
                return renderSpinner();
            case 'pulse':
                return renderPulse();
            case 'dots':
                return renderDots();
            case 'wave':
                return renderWave();
            default:
                return renderSpinner();
        }
    };

    return (
        <View style={[containerStyle]}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        shadowColor: colors.neutral[900],
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    spinnerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        borderWidth: 3,
        borderTopColor: 'transparent',
        borderRadius: 50,
    },
    pulse: {
        borderRadius: 50,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        borderRadius: 50,
        marginHorizontal: 4,
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    waveBar: {
        marginHorizontal: 2,
        borderRadius: 2,
    },
});

export default LoadingIndicator;
