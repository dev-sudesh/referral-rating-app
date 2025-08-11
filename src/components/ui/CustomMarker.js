import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Defs, Filter, FeFlood, FeColorMatrix, FeOffset, FeGaussianBlur, FeBlend } from 'react-native-svg';
import { getMarkerIcon, getMarkerColor } from '../../assets/icons/markers/MarkerIcons';

const CustomMarker = ({
    category = 'default',
    isOpen = true,
    size = 'medium',
    style,
    children
}) => {
    const markerColor = getMarkerColor(category, isOpen);
    const markerIcon = getMarkerIcon(category, isOpen);

    const sizes = {
        small: { width: 30, height: 33 },
        medium: { width: 40, height: 44 },
        large: { width: 50, height: 55 },
    };

    const { width, height } = sizes[size] || sizes.medium;

    // For now, we'll use a simple colored circle as a fallback
    // In a real implementation, you'd want to render the actual SVG content
    return (
        <View style={[styles.container, { width, height }, style]}>
            <Svg width={width} height={height} viewBox="0 0 40 44" fill="none">
                <G filter="url(#filter0_dd_24_1129)">
                    <Path
                        d="M20 0C28.8366 0 36 7.16344 36 16C36 22.4214 32.2166 27.958 26.7578 30.5053C25.9724 30.8718 25.2267 31.3291 24.6139 31.942L21.6729 34.8838C20.8918 35.6647 19.6257 35.6648 18.8447 34.8838L16.2856 32.3253C15.5983 31.6383 14.7458 31.1482 13.8488 30.7744C8.06542 28.3638 4 22.6568 4 16C4 7.16344 11.1634 0 20 0Z"
                        fill={markerColor}
                    />
                </G>

                {/* Category-specific icon content */}
                {category === 'restaurant' && (
                    <>
                        <Path d="M16 8C16 7.44772 16.4477 7 17 7H23C23.5523 7 24 7.44772 24 8V10C24 10.5523 23.5523 11 23 11H17C16.4477 11 16 10.5523 16 10V8Z" fill="white" />
                        <Path d="M17 12C17 11.4477 17.4477 11 18 11H22C22.5523 11 23 11.4477 23 12V14C23 14.5523 22.5523 15 22 15H18C17.4477 15 17 14.5523 17 14V12Z" fill="white" />
                    </>
                )}

                {category === 'shop' && (
                    <>
                        <Path d="M14 8C14 6.89543 14.8954 6 16 6H24C25.1046 6 26 6.89543 26 8V10C26 11.1046 25.1046 12 24 12H16C14.8954 12 14 11.1046 14 10V8Z" fill="white" />
                        <Path d="M12 10C12 8.89543 12.8954 8 14 8H26C27.1046 8 28 8.89543 28 10V12C28 13.1046 27.1046 14 26 14H14C12.8954 14 12 13.1046 12 12V10Z" fill="white" />
                        <Path d="M16 10H24V12H16V10Z" fill={markerColor} />
                    </>
                )}

                {category === 'service' && (
                    <>
                        <Path d="M12 8C12 6.89543 12.8954 6 14 6H26C27.1046 6 28 6.89543 28 8V18C28 19.1046 27.1046 20 26 20H14C12.8954 20 12 19.1046 12 18V8Z" fill="white" />
                        <Path d="M14 8H26V10H14V8Z" fill={markerColor} />
                        <Path d="M14 12H26V14H14V12Z" fill={markerColor} />
                        <Path d="M14 16H26V18H14V16Z" fill={markerColor} />
                    </>
                )}

                {/* X mark for closed places */}
                {!isOpen && (
                    <Path d="M28 6L34 12M34 6L28 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                )}

                <Defs>
                    <Filter id="filter0_dd_24_1129" x="0" y="0" width="40" height="43.4695" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
                        <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <FeOffset dy="1" />
                        <FeGaussianBlur stdDeviation="0.5" />
                        <FeColorMatrix type="matrix" values="0 0 0 0 0.168627 0 0 0 0 0.223529 0 0 0 0 0.25098 0 0 0 0.24 0" />
                        <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_24_1129" />
                        <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                        <FeOffset dy="4" />
                        <FeGaussianBlur stdDeviation="2" />
                        <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                        <FeBlend mode="normal" in2="effect1_dropShadow_24_1129" result="effect2_dropShadow_24_1129" />
                        <FeBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_24_1129" result="shape" />
                    </Filter>
                </Defs>
            </Svg>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default CustomMarker; 