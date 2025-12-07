import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, ImageBackground, Image } from 'react-native';
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
    isSvg: forceSvg, // Manual override to force SVG detection
    ...rest
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imageSource, setImageSource] = useState(null);
    const [imageResizeMode, setImageResizeMode] = useState(resizeMode || 'cover');
    useEffect(() => {
        setImageResizeMode(resizeMode || 'cover');
    }, [resizeMode]);
    const [isCaching, setIsCaching] = useState(false);
    const [isCacheReady, setIsCacheReady] = useState(false);

    // iOS-specific optimizations
    const isIOS = Platform.OS === 'ios';
    const fadeDurationOptimized = isIOS ? 150 : fadeDuration; // Faster fade on iOS

    // Check if source is an SVG
    const isSvg = useMemo(() => {
        // Manual override prop takes precedence
        if (forceSvg !== undefined) {
            return forceSvg;
        }

        if (!source) return false;

        let url = '';
        if (typeof source === 'string') {
            url = source.toLowerCase();
        } else if (source && typeof source === 'object' && source.uri) {
            url = source.uri.toLowerCase();
        } else {
            return false;
        }

        // Check if URL ends with .svg or contains .svg in the path
        if (url.includes('.svg') || url.includes('/svg')) {
            return true;
        }

        // Check for format=svg in query parameters (e.g., placehold.co?format=svg)
        if (url.includes('format=svg') || url.includes('format=svg+xml')) {
            return true;
        }

        // Check for type=svg in query parameters
        if (url.includes('type=svg') || url.includes('type=svg+xml')) {
            return true;
        }

        // For placehold.co, check if it's likely SVG (though default is PNG)
        // You can add format=svg to placehold.co URLs to make them SVG
        if (url.includes('placehold.co') && (url.includes('format=svg') || url.includes('type=svg'))) {
            return true;
        }

        return false;
    }, [source, forceSvg]);

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

                // If it's a remote URL, check if it's already cached (skip SVG files)
                if (source && typeof source === 'string' && source.includes('http') && !isSvg) {
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
    }, [source, isSvg]);

    // Optimized auto-cache with debouncing (skip SVG files)
    const handleAutoCache = useCallback(async (url) => {
        if (!url || isSvg || isImageCached(url)) return;

        try {
            setIsCaching(true);
            await cacheImageUrl(url);
        } catch (error) {
            console.warn('Failed to auto-cache image:', error);
        } finally {
            setIsCaching(false);
        }
    }, [isSvg]);

    // Auto-cache remote images on mount with optimization (skip SVG files)
    useEffect(() => {
        if (preloadOnMount && autoCache && source && typeof source === 'string' && source.includes('http') && isCacheReady && !isSvg) {
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
    }, [source, preloadOnMount, autoCache, isCacheReady, handleAutoCache, isIOS, isSvg]);

    // Update image source when final source changes
    useEffect(() => {
        if (finalImageSource) {
            setImageSource(finalImageSource);
            setIsLoading(true);
            setHasError(false);
        } else {
            // If no source is available, show placeholder or fallback
            setImageSource(null);
            setIsLoading(false);
        }
    }, [finalImageSource]);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
        setHasError(false);

        // Cache the image if it's a remote URL and auto-cache is enabled (skip SVG files)
        if (autoCache && source && typeof source === 'string' && source.includes('http') && !isSvg) {
            // Debounce caching on iOS
            if (isIOS) {
                setTimeout(() => handleAutoCache(source), 50);
            } else {
                handleAutoCache(source);
            }
        }

        onLoad?.();
    }, [autoCache, source, handleAutoCache, onLoad, isIOS, isSvg]);

    const handleError = useCallback(() => {
        setIsLoading(false);
        setHasError(true);

        // Try fallback source if available
        if (placeholderSource && imageSource !== placeholderSource) {
            setImageSource(placeholderSource);
            setImageResizeMode('center');
            setIsLoading(true);
            setHasError(false);
        } else {
            onError?.();
        }
    }, [fallbackSource, imageSource, onError]);

    // Memoize loader visibility logic
    const shouldShowLoader = useMemo(() => {
        if (!showLoader) return false;

        // Show loader if we're loading or caching
        if (isLoading || isCaching) return true;

        // Don't show loader if image is already cached and cache is ready (skip SVG files)
        if (isCacheReady && source && typeof source === 'string' && source.includes('http') && !isSvg && isImageCached(source)) {
            return false;
        }

        // Show loader if we have no image source yet
        if (!imageSource && source) return true;

        return false;
    }, [showLoader, isLoading, isCaching, isCacheReady, source, imageSource]);

    const renderImage = useCallback(() => {
        if (!imageSource) {
            // Show placeholder if no image source is available
            if (placeholderSource) {

                return (
                    <Image
                        source={placeholderSource}
                        style={[styles.image, imageStyle]}
                        resizeMode={'center'}
                        fadeDuration={fadeDurationOptimized}
                        {...rest}
                    />
                );
            }
            return null;
        }

        // Use standard Image component for SVG files since FastImage doesn't support SVG
        if (isSvg) {
            return (
                <Image
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
        }

        // Use FastImage for non-SVG images
        return (
            <FastImage
                source={imageSource}
                style={[styles.image, imageStyle]}
                resizeMode={imageResizeMode}
                fadeDuration={fadeDurationOptimized}
                defaultSource={placeholderSource}
                onLoad={handleLoad}
                onError={handleError}
                {...rest}
            />
        );
    }, [imageSource, imageStyle, resizeMode, fadeDurationOptimized, handleLoad, handleError, placeholderSource, rest, isSvg]);

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
        if (!hasError) {
            return null;
        }

        // Try fallback source first, then placeholder
        const errorSource = fallbackSource || placeholderSource;

        if (!errorSource) {
            return (
                <View style={[styles.errorContainer, styles.placeholderContainer]}>
                    <View style={styles.placeholderBox} />
                </View>
            );
        }

        return (
            <View style={styles.errorContainer}>
                <FastImage
                    source={errorSource}
                    defaultSource={placeholderSource}
                    style={[styles.image, imageStyle]}
                    resizeMode={resizeMode}
                    {...rest}
                />
            </View>
        );
    }, [hasError, fallbackSource, placeholderSource, imageStyle, resizeMode, rest]);

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
    placeholderContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    placeholderBox: {
        width: 40,
        height: 40,
        backgroundColor: '#d0d0d0',
        borderRadius: 4,
    },
});

export default AppImage;
