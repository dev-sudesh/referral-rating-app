import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet, ActivityIndicator } from 'react-native';
import { getCachedImage, isImageCached } from '../../utils/preloadImages/PreloadImagesUtils';

/**
 * Enhanced AppImage component that supports preloaded images
 * @param {Object} props - Component props
 * @param {string|number} props.source - Image source (local require or remote URL)
 * @param {string} props.localKey - Key for local preloaded image
 * @param {Object} props.style - Image styles
 * @param {Object} props.imageStyle - Additional image styles
 * @param {boolean} props.showLoader - Whether to show loading indicator
 * @param {Object} props.loaderStyle - Loading indicator styles
 * @param {string} props.loaderColor - Loading indicator color
 * @param {number} props.loaderSize - Loading indicator size
 * @param {function} props.onLoad - Image load callback
 * @param {function} props.onError - Image error callback
 * @param {Object} props.fallbackSource - Fallback image source
 * @param {boolean} props.usePreloaded - Whether to use preloaded images
 * @param {Object} props.containerStyle - Container styles
 * @param {boolean} props.resizeMode - Image resize mode
 * @param {boolean} props.fadeDuration - Image fade duration
 * @param {Object} props.rest - Additional props passed to Image component
 */
const AppImage = ({
    source,
    localKey,
    style,
    imageStyle,
    showLoader = true,
    loaderStyle,
    loaderColor = '#007AFF',
    loaderSize = 'small',
    onLoad,
    onError,
    fallbackSource,
    usePreloaded = true,
    containerStyle,
    resizeMode = 'cover',
    fadeDuration = 300,
    ...rest
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSource, setImageSource] = useState(null);

    useEffect(() => {
        let finalSource = source;

        if (finalSource && typeof finalSource === 'string' && finalSource.includes('http')) {
            finalSource = { uri: finalSource };
        }

        // Try to use preloaded image if available
        if (usePreloaded && localKey) {
            const cachedImage = getCachedImage(localKey);
            if (cachedImage) {
                finalSource = cachedImage;
            } else {
                // Use debug level logging instead of warning for missing preloaded images 
            }
        }

        setImageSource(finalSource);
        setIsLoading(true);
        setHasError(false);
    }, [source, localKey, usePreloaded]);

    const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);

        // Try fallback source if available
        if (fallbackSource && imageSource !== fallbackSource) {
            setImageSource(fallbackSource);
            setIsLoading(true);
            setHasError(false);
        } else {
            onError?.();
        }
    };

    const renderImage = () => {
        if (!imageSource) {
            return null;
        }

        return (
            <Image
                source={imageSource}
                style={[styles.image, imageStyle]}
                resizeMode={resizeMode}
                fadeDuration={fadeDuration}
                onLoad={handleLoad}
                onError={handleError}
                {...rest}
            />
        );
    };

    const renderLoader = () => {
        if (!showLoader || !isLoading) {
            return null;
        }

        return (
            <View style={[styles.loaderContainer, loaderStyle]}>
                <ActivityIndicator
                    size={loaderSize}
                    color={loaderColor}
                />
            </View>
        );
    };

    const renderError = () => {
        if (!hasError || !fallbackSource) {
            return null;
        }

        return (
            <View style={styles.errorContainer}>
                <Image
                    source={fallbackSource}
                    style={[styles.image, imageStyle]}
                    resizeMode={resizeMode}
                    fadeDuration={fadeDuration}
                    {...rest}
                />
            </View>
        );
    };

    return (
        <View style={[styles.container, containerStyle, style]}>
            {renderImage()}
            {renderLoader()}
            {renderError()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
    },
    errorContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default AppImage;
