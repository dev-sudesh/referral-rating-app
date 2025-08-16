import React from 'react';
import {
    View,
    StyleSheet,
    ImageBackground,
} from 'react-native';
import { theme } from '../../constants/theme';
import ImageAsset from '../../assets/images/ImageAsset';

const BackgroundCard = ({
    children,
    backgroundImage = ImageAsset.places.placeFullBg,
    style,
    imageStyle,
    overlayOpacity = 0.3,
    overlayColor = theme.colors.background.overlay || 'rgba(0,0,0,0.3)',
    ...props
}) => {
    return (
        <ImageBackground
            source={backgroundImage}
            style={[styles.backgroundContainer, style]}
            imageStyle={[styles.backgroundImage, imageStyle]}
            {...props}
        >
            {/* Overlay */}
            <View
                style={[
                    styles.overlay,
                    {
                        backgroundColor: overlayColor,
                        opacity: overlayOpacity
                    }
                ]}
            />

            {/* Content */}
            <View style={styles.contentContainer}>
                {children}
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundContainer: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        position: 'relative',
    },
    backgroundImage: {
        borderRadius: theme.borderRadius.md,
        resizeMode: 'cover',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: theme.borderRadius.md,
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
});

export default BackgroundCard;
