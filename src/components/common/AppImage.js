import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, ImageBackground } from 'react-native';
import {
    getCachedImage,
    isImageCached,
    cacheImageUrl,
    cacheImageUrls,
    waitForCacheInit
} from '../../utils/preloadImages/PreloadImagesUtils';

import FastImage from 'react-native-fast-image'

/**
 * Enhanced AppImage component that supports preloaded images and automatic URL caching
 * Optimized for iOS performance
 */
const AppImage = ({
    source,
    placeholderSource,
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
    autoCache = true,
    preloadOnMount = true,
    ...rest
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSource, setImageSource] = useState(null);
    const [isCaching, setIsCaching] = useState(false);
    const [isCacheReady, setIsCacheReady] = useState(false);

    // iOS-specific optimizations
    const isIOS = Platform.OS === 'ios';
    const fadeDurationOptimized = isIOS ? 150 : fadeDuration; // Faster fade on iOS

    // Memoize source processing to avoid unnecessary recalculations
    const processedSource = useMemo(() => {
        if (!source) return null;

        if (typeof source === 'string' && source.includes('http')) {
            return { uri: source };
        }

        return source;
    }, [source]);

    // Memoize final image source
    const finalImageSource = useMemo(() => {
        if (!processedSource) return null;

        // Try to use preloaded image if available
        if (usePreloaded && localKey) {
            const cachedImage = getCachedImage(localKey);
            if (cachedImage) {
                return cachedImage;
            }
        }

        return processedSource;
    }, [processedSource, localKey, usePreloaded]);

    // Optimized cache initialization
    useEffect(() => {
        let isMounted = true;

        const initializeCacheAndCheck = async () => {
            try {
                await waitForCacheInit();

                if (!isMounted) return;

                setIsCacheReady(true);

                // If it's a remote URL, check if it's already cached
                if (source && typeof source === 'string' && source.includes('http')) {
                    if (isImageCached(source)) {
                        // Image is cached, don't show loader
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.warn('Failed to initialize cache:', error);
                if (isMounted) {
                    setIsCacheReady(true);
                }
            }
        };

        initializeCacheAndCheck();

        return () => {
            isMounted = false;
        };
    }, [source]);

    // Optimized auto-cache with debouncing
    const handleAutoCache = useCallback(async (url) => {
        if (!url || isImageCached(url)) return;

        try {
            setIsCaching(true);
            await cacheImageUrl(url);
        } catch (error) {
            console.warn('Failed to auto-cache image:', error);
        } finally {
            setIsCaching(false);
        }
    }, []);

    // Auto-cache remote images on mount with optimization
    useEffect(() => {
        if (preloadOnMount && autoCache && source && typeof source === 'string' && source.includes('http') && isCacheReady) {
            // Debounce auto-cache on iOS to prevent blocking
            if (isIOS) {
                const timer = setTimeout(() => {
                    handleAutoCache(source);
                }, 100);
                return () => clearTimeout(timer);
            } else {
                handleAutoCache(source);
            }
        }
    }, [source, preloadOnMount, autoCache, isCacheReady, handleAutoCache, isIOS]);

    // Update image source when final source changes
    useEffect(() => {
        setImageSource(finalImageSource);
        setIsLoading(true);
        setHasError(false);
    }, [finalImageSource]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);

        // Cache the image if it's a remote URL and auto-cache is enabled
        if (autoCache && source && typeof source === 'string' && source.includes('http')) {
            // Debounce caching on iOS
            if (isIOS) {
                setTimeout(() => handleAutoCache(source), 50);
            } else {
                handleAutoCache(source);
            }
        }

        onLoad?.();
    }, [autoCache, source, handleAutoCache, onLoad, isIOS]);

    const handleError = useCallback(() => {
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
    }, [fallbackSource, imageSource, onError]);

    // Memoize loader visibility logic
    const shouldShowLoader = useMemo(() => {
        if (!showLoader) return false;
        if (!isLoading && !isCaching) return false;

        // Don't show loader if image is already cached and cache is ready
        if (isCacheReady && source && typeof source === 'string' && source.includes('http') && isImageCached(source)) {
            return false;
        }

        return true;
    }, [showLoader, isLoading, isCaching, isCacheReady, source]);

    const renderImage = useCallback(() => {
        if (!imageSource) {
            return null;
        }

        return (
            <FastImage
                source={imageSource}
                style={[styles.image, imageStyle]}
                resizeMode={resizeMode}
                fadeDuration={fadeDurationOptimized}
                defaultSource={placeholderSource}
                onLoad={handleLoad}
                onError={handleError}
                {...rest}
            />
        );
    }, [imageSource, imageStyle, resizeMode, fadeDurationOptimized, handleLoad, handleError, rest]);

    const renderLoader = useCallback(() => {
        if (!shouldShowLoader) {
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
    }, [shouldShowLoader, loaderStyle, loaderSize, loaderColor]);

    const renderError = useCallback(() => {
        if (!hasError || !fallbackSource) {
            return null;
        }

        return (
            <View style={styles.errorContainer}>
                <FastImage
                    source={fallbackSource}
                    defaultSource={placeholderSource}
                    style={[styles.image, imageStyle]}
                    resizeMode={resizeMode}
                    {...rest}
                />
                {/* <Image
                    source={fallbackSource}
                    style={[styles.image, imageStyle]}
                    resizeMode={resizeMode}
                    {...rest}
                /> */}
            </View>
        );
    }, [hasError, fallbackSource, imageStyle, resizeMode, fadeDurationOptimized, placeholderSource, rest]);

    return (
        <View style={[styles.container, containerStyle, style]}>
            {renderImage()}
            {/* {renderLoader()} */}
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
