import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, ClipPath } from 'react-native-svg';
import { theme } from '../../constants/theme';

const CurvedCard = ({ children, width = 300, height = 200, curveDepth = 40, cornerRadius = 16, style, ...props }) => {
    // Create exact semicircle shape matching your image
    const radius = curveDepth;
    const innerRadius = 10;
    let pathData = `
        M ${cornerRadius} 0 
        L ${width - cornerRadius} 0  
        Q ${width} 0 ${width} ${cornerRadius}
        L ${width} ${height - cornerRadius}
        Q ${width} ${height} ${width - cornerRadius} ${height}
        L ${width * 0.5 + radius + innerRadius} ${height}
        C ${width * 0.5 + radius + innerRadius * 0.5} ${height} ${width * 0.5 + radius} ${height + innerRadius * 0.5} ${width * 0.5 + radius} ${height + innerRadius}
        A ${radius} ${radius} 0 0 1 ${width * 0.5 - radius} ${height + innerRadius} 
        C ${width * 0.5 - radius} ${height + innerRadius * 0.5} ${width * 0.5 - radius - innerRadius * 0.5} ${height} ${width * 0.5 - radius - innerRadius} ${height}
        L ${cornerRadius} ${height}
        Q 0 ${height} 0 ${height - cornerRadius}
        L 0 ${cornerRadius}
        Q 0 0 ${cornerRadius} 0
        Z
    `;

    return (
        <View style={[styles.container, { width, height: height + curveDepth + innerRadius, }, style]} {...props}>
            {/* SVG Shape Background */}
            <Svg
                width={width}
                height={height + curveDepth + innerRadius}
                style={StyleSheet.absoluteFillObject}
                viewBox={`0 0 ${width} ${height + curveDepth + innerRadius}`}
            >
                <Defs>
                    <ClipPath id="curvedClip">
                        <Path d={pathData} />
                    </ClipPath>
                </Defs>

                {/* Background Shape */}
                <Path
                    d={pathData}
                    fill={theme.colors.background.primary}
                    stroke={theme.colors.border.light}
                    strokeWidth="1"
                />
            </Svg>

            {/* Content Container */}
            <View style={[styles.content, { width, height: height - curveDepth, }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        ...theme.shadows.large,
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: theme.spacing.sm,
        zIndex: 1,
    },
});

export default CurvedCard;
