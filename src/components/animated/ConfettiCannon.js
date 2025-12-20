import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import theme from '../../constants/theme';

const PARTICLE_COUNT = 120;

const ConfettiCannon = ({
    visible = false,
    colors = [
        theme.colors.primary[400],
        theme.colors.primary[500],
        theme.colors.secondary[400],
        theme.colors.success[400],
        theme.colors.warning[400],
        theme.colors.tertiary[400],
    ],
    confettiCount = PARTICLE_COUNT,
    duration = 2500,
    origin,
}) => {
    const [particles, setParticles] = useState([]);
    const isAnimating = useRef(false);
    const timeoutRefs = useRef([]);
    const animationRefs = useRef([]);
    const rafRefs = useRef([]);
    const isMountedRef = useRef(true);
    const shouldUpdateStateRef = useRef(true);

    // Safe state update wrapper that checks if component is mounted
    // Handles both direct values and function updaters
    const safeSetParticles = useCallback((newParticlesOrUpdater) => {
        if (!isMountedRef.current || !shouldUpdateStateRef.current) {
            return;
        }
        // Use requestAnimationFrame to defer state update
        const rafId = requestAnimationFrame(() => {
            // Remove from tracking array
            const index = rafRefs.current.indexOf(rafId);
            if (index > -1) {
                rafRefs.current.splice(index, 1);
            }
            // Only update if still mounted
            if (isMountedRef.current && shouldUpdateStateRef.current) {
                if (typeof newParticlesOrUpdater === 'function') {
                    setParticles(newParticlesOrUpdater);
                } else {
                    setParticles(newParticlesOrUpdater);
                }
            }
        });
        rafRefs.current.push(rafId);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        shouldUpdateStateRef.current = true;
        return () => {
            // Prevent any state updates during unmount
            isMountedRef.current = false;
            shouldUpdateStateRef.current = false;
            isAnimating.current = false;

            // Clear all timeouts
            timeoutRefs.current.forEach(timeout => {
                if (timeout) {
                    clearTimeout(timeout);
                }
            });
            timeoutRefs.current = [];

            // Cancel all pending animation frames
            rafRefs.current.forEach(rafId => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
            });
            rafRefs.current = [];

            // Stop all animations
            animationRefs.current.forEach(animation => {
                try {
                    if (animation && typeof animation.stop === 'function') {
                        animation.stop();
                    }
                } catch (e) {
                    // Ignore errors during cleanup
                }
            });
            animationRefs.current = [];
        };
    }, []);

    useEffect(() => {
        if (!visible) {
            isAnimating.current = false;
            // Clear all timeouts when hidden
            timeoutRefs.current.forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            timeoutRefs.current = [];
            // Cancel pending animation frames
            rafRefs.current.forEach(rafId => {
                if (rafId) cancelAnimationFrame(rafId);
            });
            rafRefs.current = [];
            // Stop all animations
            animationRefs.current.forEach(animation => {
                try {
                    if (animation && typeof animation.stop === 'function') {
                        animation.stop();
                    }
                } catch (e) {
                    // Ignore errors
                }
            });
            animationRefs.current = [];
            // Clear particles state if mounted (this will schedule a new RAF which is fine)
            safeSetParticles([]);
            return;
        }

        if (visible && !isAnimating.current && isMountedRef.current) {
            isAnimating.current = true;

            const getAnimOrigin = () => origin || {
                x: Dimensions.get('window').width / 2,
                y: Dimensions.get('window').height / 2,
            };

            // Helper function to create burst
            const createBurst = (burstId) => {
                const animOrigin = getAnimOrigin();
                const newParticles = [];
                const animations = [];

                for (let i = 0; i < confettiCount; i++) {
                    // Tighter upward cone: less spread
                    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
                    const velocity = 250 + Math.random() * 350;
                    const xVelocity = Math.cos(angle) * velocity;
                    const yVelocity = Math.sin(angle) * velocity;

                    // Paper-like sizes (varying rectangles) - larger
                    const isTall = Math.random() > 0.5;
                    const particleWidth = isTall ? 6 + Math.random() * 4 : 12 + Math.random() * 6;
                    const particleHeight = isTall ? 16 + Math.random() * 6 : 10 + Math.random() * 4;

                    // Center particles on origin by offsetting by half width/height
                    const startX = animOrigin.x - particleWidth / 2;
                    const startY = animOrigin.y - particleHeight / 2;

                    const translateX = new Animated.Value(startX);
                    const translateY = new Animated.Value(startY);
                    const rotate = new Animated.Value(0);
                    const opacity = new Animated.Value(1);

                    const particle = {
                        id: `burst-${burstId}-${i}`,
                        translateX,
                        translateY,
                        rotate,
                        opacity,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        width: particleWidth,
                        height: particleHeight,
                    };

                    newParticles.push(particle);

                    // Create smooth animation with natural physics
                    // Calculate final positions
                    const maxUpwardDistance = yVelocity * 0.8; // Decelerate naturally
                    const peakY = startY + maxUpwardDistance;

                    // Horizontal spread happens smoothly throughout
                    const horizontalTravel = xVelocity * 1.0; // Full spread during entire animation
                    const finalX = startX + horizontalTravel;

                    // Gravity pulls down from peak
                    const gravityPull = 400;
                    const finalY = peakY + gravityPull;

                    const animation = Animated.parallel([
                        // X movement: smooth continuous spread throughout
                        Animated.timing(translateX, {
                            toValue: finalX,
                            duration: duration,
                            useNativeDriver: true,
                        }),
                        // Y movement: parabolic arc - up then down smoothly
                        Animated.sequence([
                            Animated.timing(translateY, {
                                toValue: peakY,
                                duration: duration * 0.4,
                                useNativeDriver: true,
                            }),
                            Animated.timing(translateY, {
                                toValue: finalY,
                                duration: duration * 0.6,
                                useNativeDriver: true,
                            }),
                        ]),
                        // Rotation continues throughout
                        Animated.timing(rotate, {
                            toValue: 1,
                            duration: duration * (0.5 + Math.random() * 0.5),
                            useNativeDriver: true,
                        }),
                        // Fade out near the end
                        Animated.sequence([
                            Animated.delay(duration * 0.6),
                            Animated.timing(opacity, {
                                toValue: 0,
                                duration: duration * 0.4,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]);
                    animations.push(animation);
                }

                return { newParticles, animations };
            };

            // Create first burst
            const burst1 = createBurst(1);

            // Set initial particles only if still mounted
            if (!isMountedRef.current) return;

            safeSetParticles(burst1.newParticles);

            // Start first burst animation
            const timeout1 = setTimeout(() => {
                if (!isMountedRef.current) return;

                const animation1 = Animated.parallel(burst1.animations);
                animationRefs.current.push(animation1);
                animation1.start();

                // Create and start second burst after delay
                const timeout2 = setTimeout(() => {
                    if (!isMountedRef.current) return;

                    const burst2 = createBurst(2);
                    safeSetParticles(prev => [...prev, ...burst2.newParticles]);

                    const animation2 = Animated.parallel(burst2.animations);
                    animationRefs.current.push(animation2);
                    animation2.start(() => {
                        // Animation callback - use safe state update
                        safeSetParticles([]);
                        isAnimating.current = false;
                    });
                }, 200);
                timeoutRefs.current.push(timeout2);
            }, 10);
            timeoutRefs.current.push(timeout1);
        }

        // Cleanup function
        return () => {
            // Clear timeouts when effect re-runs
            timeoutRefs.current.forEach(timeout => {
                if (timeout) clearTimeout(timeout);
            });
            timeoutRefs.current = [];
            // Cancel pending animation frames
            rafRefs.current.forEach(rafId => {
                if (rafId) cancelAnimationFrame(rafId);
            });
            rafRefs.current = [];
            // Stop all animations
            animationRefs.current.forEach(animation => {
                try {
                    if (animation && typeof animation.stop === 'function') {
                        animation.stop();
                    }
                } catch (e) {
                    // Ignore errors
                }
            });
            animationRefs.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    // Memoize getRotation to prevent recreation on every render
    const getRotation = useCallback((value) => {
        return value.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '720deg'],
        });
    }, []);

    if (!visible || particles.length === 0 || !isMountedRef.current) {
        return null;
    }

    return (
        <View style={styles.container} pointerEvents="none">
            {particles.map((particle) => (
                <Animated.View
                    key={particle.id}
                    style={[
                        styles.particle,
                        {
                            backgroundColor: particle.color,
                            width: particle.width,
                            height: particle.height,
                            borderRadius: Math.min(particle.width, particle.height) * 0.3,
                            transform: [
                                { translateX: particle.translateX },
                                { translateY: particle.translateY },
                                { rotate: getRotation(particle.rotate) },
                            ],
                            opacity: particle.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    particle: {
        position: 'absolute',
        // Dynamic size will be set per particle
    },
});

export default ConfettiCannon;
