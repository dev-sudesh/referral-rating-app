import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
    cacheImageUrl,
    cacheImageUrls,
    isImageCached,
    getCachedImage,
    getCacheStats,
    clearImageCache,
    clearExpiredCache,
    waitForCacheInit
} from '../utils/preloadImages/PreloadImagesUtils';

/**
 * Custom hook for managing image URL caching
 * Optimized for iOS performance
 */
const useImageCache = () => {
    const [cacheStats, setCacheStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCacheReady, setIsCacheReady] = useState(false);

    // Performance optimizations
    const isIOS = Platform.OS === 'ios';
    const operationQueue = useRef(new Set());
    const lastStatsUpdate = useRef(0);
    const STATS_UPDATE_THROTTLE = isIOS ? 1000 : 500; // Throttle stats updates on iOS

    // Initialize cache on mount with performance optimization
    useEffect(() => {
        let isMounted = true;

        const initCache = async () => {
            try {
                const startTime = Date.now();
                await waitForCacheInit();

                if (!isMounted) return;

                setIsCacheReady(true);

                // Throttle initial stats update on iOS
                if (isIOS) {
                    setTimeout(() => {
                        if (isMounted) {
                            updateCacheStats();
                        }
                    }, 100);
                } else {
                    updateCacheStats();
                }

                if (__DEV__) {
                    console.log(`[useImageCache] Cache initialized in ${Date.now() - startTime}ms`);
                }
            } catch (error) {
                console.error('Failed to initialize cache:', error);
                if (isMounted) {
                    setIsCacheReady(true);
                }
            }
        };

        initCache();

        return () => {
            isMounted = false;
        };
    }, []);

    // Throttled cache stats update
    const updateCacheStats = useCallback(() => {
        if (!isCacheReady) return;

        const now = Date.now();
        if (now - lastStatsUpdate.current < STATS_UPDATE_THROTTLE) {
            return;
        }

        lastStatsUpdate.current = now;

        // Use requestAnimationFrame on iOS for better performance
        if (isIOS) {
            requestAnimationFrame(() => {
                const stats = getCacheStats();
                setCacheStats(stats);
            });
        } else {
            const stats = getCacheStats();
            setCacheStats(stats);
        }
    }, [isCacheReady, isIOS]);

    // Optimized single URL caching
    const cacheUrl = useCallback(async (url, options = {}) => {
        if (!url || !isCacheReady) return false;

        // Prevent duplicate operations
        if (operationQueue.current.has(url)) {
            return false;
        }

        operationQueue.current.add(url);

        try {
            setIsLoading(true);
            const startTime = Date.now();

            const result = await cacheImageUrl(url, options);

            if (__DEV__) {
                console.log(`[useImageCache] Cached URL in ${Date.now() - startTime}ms:`, url);
            }

            // Throttle stats update on iOS
            if (isIOS) {
                setTimeout(updateCacheStats, 100);
            } else {
                updateCacheStats();
            }

            return result;
        } catch (error) {
            console.error('Failed to cache image URL:', error);
            return false;
        } finally {
            setIsLoading(false);
            operationQueue.current.delete(url);
        }
    }, [updateCacheStats, isCacheReady, isIOS]);

    // Optimized multiple URL caching with batching
    const cacheUrls = useCallback(async (urls, onProgress = null) => {
        if (!urls || urls.length === 0 || !isCacheReady) {
            return { total: 0, successful: 0, failed: 0 };
        }

        // Filter out URLs that are already being processed
        const uniqueUrls = urls.filter(url => !operationQueue.current.has(url));

        if (uniqueUrls.length === 0) {
            return { total: urls.length, successful: 0, failed: 0, errors: [] };
        }

        try {
            setIsLoading(true);
            const startTime = Date.now();

            // Add URLs to operation queue
            uniqueUrls.forEach(url => operationQueue.current.add(url));

            const results = await cacheImageUrls(uniqueUrls, onProgress);

            if (__DEV__) {
                console.log(`[useImageCache] Cached ${results.successful} URLs in ${Date.now() - startTime}ms`);
            }

            // Throttle stats update on iOS
            if (isIOS) {
                setTimeout(updateCacheStats, 200);
            } else {
                updateCacheStats();
            }

            return results;
        } catch (error) {
            console.error('Failed to cache image URLs:', error);
            return { total: urls.length, successful: 0, failed: urls.length, errors: [error] };
        } finally {
            setIsLoading(false);
            // Clear operation queue
            uniqueUrls.forEach(url => operationQueue.current.delete(url));
        }
    }, [updateCacheStats, isCacheReady, isIOS]);

    // Optimized cache checking
    const checkCached = useCallback((url) => {
        if (!isCacheReady) return false;
        return isImageCached(url);
    }, [isCacheReady]);

    // Optimized cached image retrieval
    const getCached = useCallback((url) => {
        if (!isCacheReady) return null;
        return getCachedImage(url);
    }, [isCacheReady]);

    // Optimized cache clearing
    const clearCache = useCallback(async () => {
        if (!isCacheReady) return;

        try {
            setIsLoading(true);
            const startTime = Date.now();

            await clearImageCache();

            if (__DEV__) {
                console.log(`[useImageCache] Cache cleared in ${Date.now() - startTime}ms`);
            }

            updateCacheStats();
        } catch (error) {
            console.error('Failed to clear cache:', error);
        } finally {
            setIsLoading(false);
        }
    }, [updateCacheStats, isCacheReady]);

    // Optimized expired cache clearing
    const clearExpired = useCallback(async () => {
        if (!isCacheReady) return;

        try {
            setIsLoading(true);
            const startTime = Date.now();

            await clearExpiredCache();

            if (__DEV__) {
                console.log(`[useImageCache] Expired cache cleared in ${Date.now() - startTime}ms`);
            }

            updateCacheStats();
        } catch (error) {
            console.error('Failed to clear expired cache:', error);
        } finally {
            setIsLoading(false);
        }
    }, [updateCacheStats, isCacheReady]);

    // Optimized batch caching with iOS-specific optimizations
    const batchCache = useCallback(async (urls, batchSize = 5, onProgress = null) => {
        if (!urls || urls.length === 0 || !isCacheReady) {
            return { total: 0, successful: 0, failed: 0 };
        }

        const results = {
            total: urls.length,
            successful: 0,
            failed: 0,
            errors: [],
            completed: []
        };

        try {
            setIsLoading(true);
            const startTime = Date.now();

            // Use smaller batch sizes on iOS for better performance
            const optimizedBatchSize = isIOS ? Math.min(batchSize, 3) : batchSize;

            // Process URLs in batches
            for (let i = 0; i < urls.length; i += optimizedBatchSize) {
                const batch = urls.slice(i, i + optimizedBatchSize);
                const batchResults = await cacheImageUrls(batch, (progress, completed, total, currentUrl) => {
                    const overallProgress = ((i + completed) / urls.length) * 100;
                    onProgress?.(overallProgress, i + completed, urls.length, currentUrl);
                });

                // Aggregate results
                results.successful += batchResults.successful;
                results.failed += batchResults.failed;
                results.errors.push(...batchResults.errors);
                results.completed.push(...batchResults.completed);

                // Yield control on iOS to prevent blocking
                if (isIOS && i % (optimizedBatchSize * 2) === 0) {
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }

            if (__DEV__) {
                console.log(`[useImageCache] Batch cached ${results.successful} URLs in ${Date.now() - startTime}ms`);
            }

            updateCacheStats();
            return results;
        } catch (error) {
            console.error('Failed to batch cache URLs:', error);
            return { total: urls.length, successful: 0, failed: urls.length, errors: [error] };
        } finally {
            setIsLoading(false);
        }
    }, [updateCacheStats, isCacheReady, isIOS]);

    // Optimized critical image preloading
    const preloadCritical = useCallback(async (criticalUrls, onProgress = null) => {
        if (!criticalUrls || criticalUrls.length === 0 || !isCacheReady) {
            return { total: 0, successful: 0, failed: 0 };
        }

        try {
            setIsLoading(true);
            const startTime = Date.now();

            // Use higher priority for critical images with iOS optimization
            const results = await cacheImageUrls(criticalUrls, onProgress);

            if (__DEV__) {
                console.log(`[useImageCache] Critical images preloaded in ${Date.now() - startTime}ms`);
            }

            updateCacheStats();
            return results;
        } catch (error) {
            console.error('Failed to preload critical images:', error);
            return { total: criticalUrls.length, successful: 0, failed: criticalUrls.length, errors: [error] };
        } finally {
            setIsLoading(false);
        }
    }, [updateCacheStats, isCacheReady]);

    return {
        // State
        isLoading,
        cacheStats,
        isCacheReady,

        // Actions
        cacheUrl,
        cacheUrls,
        batchCache,
        preloadCritical,

        // Queries
        checkCached,
        getCached,

        // Cache management
        clearCache,
        clearExpired,
        updateCacheStats,
    };
};

export default useImageCache;
