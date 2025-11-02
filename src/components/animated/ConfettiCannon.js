import React, { useEffect, useRef, useState } from 'react';
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
    const particlesRef = useRef([]);

    useEffect(() => {
        if (visible && !isAnimating.current) {
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

                    animations.push(
                        Animated.parallel([
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
                        ])
                    );
                }

                return { newParticles, animations };
            };

            // Create first burst
            const burst1 = createBurst(1);

            // Set initial particles
            setParticles(burst1.newParticles);
            particlesRef.current = burst1.newParticles;

            // Start first burst animation
            setTimeout(() => {
                Animated.parallel(burst1.animations).start();

                // Create and start second burst after delay
                setTimeout(() => {
                    const burst2 = createBurst(2);
                    setParticles(prev => [...prev, ...burst2.newParticles]);
                    particlesRef.current = [...particlesRef.current, ...burst2.newParticles];

                    Animated.parallel(burst2.animations).start(() => {
                        setParticles([]);
                        particlesRef.current = [];
                        isAnimating.current = false;
                    });
                }, 200);
            }, 10);
        }
    }, [visible, confettiCount, colors, duration, origin]);

    useEffect(() => {
        if (!visible) {
            isAnimating.current = false;
            setParticles([]);
            particlesRef.current = [];
        }
    }, [visible]);

    if (!visible || particles.length === 0) {
        return null;
    }

    const getRotation = (value) =>
        value.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '720deg'],
        });

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

