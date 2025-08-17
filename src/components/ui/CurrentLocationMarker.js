import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

const CurrentLocationMarker = ({ size = 'medium' }) => {
    const sizeConfig = {
        small: {
            outerSize: 20,
            middleSize: 16,
            innerSize: 8,
            pulseSize: 40,
        },
        medium: {
            outerSize: 24,
            middleSize: 20,
            innerSize: 10,
            pulseSize: 48,
        },
        large: {
            outerSize: 28,
            middleSize: 24,
            innerSize: 12,
            pulseSize: 56,
        },
    };

    const config = sizeConfig[size] || sizeConfig.medium;

    return (
        <View style={[styles.container, { width: config.pulseSize, height: config.pulseSize }]}>
            {/* Pulsing Ring */}
            <View style={[
                styles.pulseRing,
                {
                    width: config.pulseSize,
                    height: config.pulseSize,
                    borderRadius: config.pulseSize / 2,
                }
            ]} />

            {/* Outer Circle */}
            <View style={[
                styles.outerCircle,
                {
                    width: config.outerSize,
                    height: config.outerSize,
                    borderRadius: config.outerSize / 2,
                }
            ]}>
                {/* Middle Circle */}
                <View style={[
                    styles.middleCircle,
                    {
                        width: config.middleSize,
                        height: config.middleSize,
                        borderRadius: config.middleSize / 2,
                    }
                ]}>
                    {/* Inner Dot */}
                    <View style={[
                        styles.innerDot,
                        {
                            width: config.innerSize,
                            height: config.innerSize,
                            borderRadius: config.innerSize / 2,
                        }
                    ]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    pulseRing: {
        position: 'absolute',
        backgroundColor: theme.colors.overlay.map,
    },
    outerCircle: {
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    middleCircle: {
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerDot: {
        backgroundColor: theme.colors.tertiary[500],
    },
});

export default CurrentLocationMarker;
