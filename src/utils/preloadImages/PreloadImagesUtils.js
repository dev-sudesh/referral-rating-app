import { Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local image mappings - add your local images here
export const LOCAL_IMAGES = {
    'logo-full': require('../../assets/images/logos/logo-full.png'),
    'logo-icon': require('../../assets/images/logos/logo-icon.png'),
    'logo-small': require('../../assets/images/logos/logo-small.png'),
};

// Cache for preloaded images with TTL support
const imageCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const CACHE_KEY = 'image_cache_data';

// Cache state management
let isCacheInitialized = false;
let cacheInitPromise = null;
const DEBUG = false; // Set to false in production for better performance

// iOS-specific optimizations
const isIOS = Platform.OS === 'ios';
const STORAGE_DEBOUNCE = isIOS ? 500 : 100; // Longer debounce on iOS
const BATCH_STORAGE_SIZE = isIOS ? 10 : 5; // Batch storage operations on iOS

// Storage queue for iOS optimization
let storageQueue = [];
let storageTimeout = null;

/**
 * Cache entry structure
 */
class CacheEntry {
    constructor(data, timestamp = Date.now()) {
        this.data = data;
        this.timestamp = timestamp;
    }

    isExpired() {
        return Date.now() - this.timestamp > CACHE_TTL;
    }
}

/**
 * Initialize cache from AsyncStorage with iOS optimization
 */
export const initializeCache = async () => {
    if (isCacheInitialized) {
        if (DEBUG) console.log('[ImageCache] Cache already initialized');
        return;
    }

    if (cacheInitPromise) {
        if (DEBUG) console.log('[ImageCache] Cache initialization already in progress');
        return cacheInitPromise;
    }

    if (DEBUG) console.log('[ImageCache] Starting cache initialization...');

    cacheInitPromise = new Promise(async (resolve) => {
        try {
            const startTime = Date.now();

            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                // Only restore non-expired entries
                const now = Date.now();
                let restoredCount = 0;

                // Batch process for better iOS performance
                const validEntries = parsed.filter(([key, entry]) => {
                    return now - entry.timestamp < CACHE_TTL;
                });

                // Restore in batches to avoid blocking the main thread
                const batchSize = isIOS ? 20 : 50;
                for (let i = 0; i < validEntries.length; i += batchSize) {
                    const batch = validEntries.slice(i, i + batchSize);
                    batch.forEach(([key, entry]) => {
                        imageCache.set(key, new CacheEntry(entry.data, entry.timestamp));
                        restoredCount++;
                    });

                    // Yield control on iOS to prevent blocking
                    if (isIOS && i % (batchSize * 2) === 0) {
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }
                }

                if (DEBUG) console.log(`[ImageCache] Restored ${restoredCount} cached images in ${Date.now() - startTime}ms`);
            } else {
                if (DEBUG) console.log('[ImageCache] No cached data found');
            }

            isCacheInitialized = true;
            if (DEBUG) console.log('[ImageCache] Cache initialization complete');
            resolve();
        } catch (error) {
            console.warn('Failed to initialize image cache:', error);
            isCacheInitialized = true; // Mark as initialized even on error
            if (DEBUG) console.log('[ImageCache] Cache initialization failed, but marked as ready');
            resolve();
        }
    });

    return cacheInitPromise;
};

/**
 * Wait for cache to be initialized
 */
export const waitForCacheInit = async () => {
    if (!isCacheInitialized) {
        if (DEBUG) console.log('[ImageCache] Waiting for cache initialization...');
        await initializeCache();
        if (DEBUG) console.log('[ImageCache] Cache initialization wait complete');
    }
};

/**
 * Optimized storage save with batching for iOS
 */
const saveCacheToStorage = async () => {
    if (!isCacheInitialized) return;

    try {
        const cacheData = Array.from(imageCache.entries()).map(([key, entry]) => [
            key,
            { data: entry.data, timestamp: entry.timestamp }
        ]);

        // On iOS, use a more efficient storage approach
        if (isIOS) {
            // Store in smaller chunks to avoid blocking
            const chunkSize = 50;
            for (let i = 0; i < cacheData.length; i += chunkSize) {
                const chunk = cacheData.slice(i, i + chunkSize);
                const chunkKey = `${CACHE_KEY}_chunk_${Math.floor(i / chunkSize)}`;
                await AsyncStorage.setItem(chunkKey, JSON.stringify(chunk));
            }
            // Store metadata
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
                totalChunks: Math.ceil(cacheData.length / chunkSize),
                timestamp: Date.now()
            }));
        } else {
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        }
    } catch (error) {
        console.warn('Failed to save image cache:', error);
    }
};

/**
 * Add image to cache with optimized storage
 */
const addToCache = (key, data) => {
    if (!isCacheInitialized) return;

    imageCache.set(key, new CacheEntry(data));

    // Optimized storage for iOS
    if (isIOS) {
        // Queue storage operations and batch them
        storageQueue.push({ key, data });

        if (storageQueue.length >= BATCH_STORAGE_SIZE) {
            if (storageTimeout) {
                clearTimeout(storageTimeout);
            }
            storageTimeout = setTimeout(() => {
                const currentQueue = [...storageQueue];
                storageQueue = [];
                saveCacheToStorage();
            }, STORAGE_DEBOUNCE);
        }
    } else {
        // Standard debounced storage for Android
        setTimeout(() => saveCacheToStorage(), 100);
    }
};

/**
 * Clean expired cache entries with iOS optimization
 */
const cleanExpiredCache = () => {
    if (!isCacheInitialized) return;

    const now = Date.now();
    const expiredKeys = [];

    // Collect expired keys first
    for (const [key, entry] of imageCache.entries()) {
        if (entry.isExpired()) {
            expiredKeys.push(key);
        }
    }

    // Remove expired entries in batches
    if (expiredKeys.length > 0) {
        expiredKeys.forEach(key => imageCache.delete(key));

        // Trigger storage update
        if (isIOS) {
            if (storageTimeout) {
                clearTimeout(storageTimeout);
            }
            storageTimeout = setTimeout(() => {
                saveCacheToStorage();
            }, STORAGE_DEBOUNCE);
        } else {
            setTimeout(() => saveCacheToStorage(), 100);
        }
    }
};

// Clean expired cache every hour
setInterval(cleanExpiredCache, 60 * 60 * 1000);

/**
 * Preload local images with iOS optimization
 */
export const preloadLocalImages = async (
    imageKeys = Object.keys(LOCAL_IMAGES),
    onProgress = null,
    onComplete = null,
    onError = null
) => {
    await waitForCacheInit();

    const results = {
        total: imageKeys.length,
        successful: 0,
        failed: 0,
        errors: [],
        completed: [],
    };

    try {
        for (let i = 0; i < imageKeys.length; i++) {
            const key = imageKeys[i];
            const progress = ((i + 1) / imageKeys.length) * 100;

            try {
                if (!LOCAL_IMAGES[key]) {
                    throw new Error(`Local image not found: ${key}`);
                }

                // Preload the image
                await Image.prefetch(LOCAL_IMAGES[key]);

                // Add to cache
                addToCache(key, LOCAL_IMAGES[key]);

                results.successful++;
                results.completed.push(key);

            } catch (error) {
                results.failed++;
                results.errors.push({ key, error: error.message });
            }

            // Call progress callback
            onProgress?.(progress, i + 1, imageKeys.length, key);

            // Yield control on iOS to prevent blocking
            if (isIOS && i % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        onComplete?.(results);
        return results;
    } catch (error) {
        onError?.(error);
        throw error;
    }
};

/**
 * Preload remote images with iOS performance optimization
 */
export const preloadRemoteImages = async (
    imageUrls = [],
    onProgress = null,
    onComplete = null,
    onError = null
) => {
    await waitForCacheInit();

    const results = {
        total: imageUrls.length,
        successful: 0,
        failed: 0,
        errors: [],
        completed: [],
    };

    try {
        // Process URLs in parallel batches for better iOS performance
        const batchSize = isIOS ? 3 : 5; // Smaller batches on iOS

        for (let i = 0; i < imageUrls.length; i += batchSize) {
            const batch = imageUrls.slice(i, i + batchSize);
            const batchPromises = batch.map(async (url, batchIndex) => {
                const globalIndex = i + batchIndex;
                const progress = ((globalIndex + 1) / imageUrls.length) * 100;

                try {
                    // Check if already cached and not expired
                    if (isImageCached(url)) {
                        results.successful++;
                        results.completed.push(url);
                        onProgress?.(progress, globalIndex + 1, imageUrls.length, url);
                        return;
                    }

                    // Preload the remote image
                    await Image.prefetch(url);

                    // Add to cache with URL as key
                    addToCache(url, { uri: url });

                    results.successful++;
                    results.completed.push(url);

                } catch (error) {
                    results.failed++;
                    results.errors.push({ url, error: error.message });
                }

                onProgress?.(progress, globalIndex + 1, imageUrls.length, url);
            });

            // Wait for batch to complete
            await Promise.all(batchPromises);

            // Yield control on iOS to prevent blocking
            if (isIOS) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        onComplete?.(results);
        return results;
    } catch (error) {
        console.error('Error in preloadRemoteImages:', error);
        onError?.(error);
        throw error;
    }
};

/**
 * Preload both local and remote images
 * @param {string[]} localImageKeys - Array of local image keys
 * @param {string[]} remoteImageUrls - Array of remote image URLs
 * @param {function} onComplete - Completion callback with results
 * @param {function} onError - Error callback
 * @returns {Promise<Object>} Combined results object
 */
export const preloadAllImages = async (
    localImageKeys = [],
    remoteImageUrls = [],
    onComplete = null,
    onError = null
) => {
    try {
        const localResults = await preloadLocalImages(localImageKeys);
        const remoteResults = await preloadRemoteImages(remoteImageUrls);

        const combinedResults = {
            local: localResults,
            remote: remoteResults,
            total: localResults.total + remoteResults.total,
            successful: localResults.successful + remoteResults.successful,
            failed: localResults.failed + remoteResults.failed,
        };

        onComplete?.(combinedResults);
        return combinedResults;
    } catch (error) {
        console.error('Error in preloadAllImages:', error);
        onError?.(error);
        throw error;
    }
};

/**
 * Clear the image cache
 * @param {function} onComplete - Completion callback
 */
export const clearImageCache = async (onComplete = null) => {
    try {
        imageCache.clear();
        onComplete?.();
    } catch (error) {
        console.error('Error clearing image cache:', error);
        throw error;
    }
};

/**
 * Get cached image with expiration check
 * @param {string} key - Image key or URL
 * @returns {any} Cached image or null
 */
export const getCachedImage = (key) => {
    const entry = imageCache.get(key);
    if (!entry) return null;

    if (entry.isExpired()) {
        imageCache.delete(key);
        return null;
    }

    return entry.data;
};

/**
 * Check if image is cached and not expired
 * @param {string} key - Image key or URL
 * @returns {boolean} True if cached and not expired
 */
export const isImageCached = (key) => {
    const entry = imageCache.get(key);
    if (!entry) return false;

    if (entry.isExpired()) {
        imageCache.delete(key);
        return false;
    }

    return true;
};

/**
 * Cache a single image URL
 * @param {string} url - Image URL to cache
 * @param {Object} options - Caching options
 * @returns {Promise<boolean>} Success status
 */
export const cacheImageUrl = async (url, options = {}) => {
    try {
        if (!url || typeof url !== 'string') {
            throw new Error('Invalid URL provided');
        }

        // Check if already cached
        if (isImageCached(url)) {
            return true;
        }

        // Preload and cache the image
        await Image.prefetch(url);
        addToCache(url, { uri: url });

        return true;
    } catch (error) {
        console.warn(`Failed to cache image URL: ${url}`, error);
        return false;
    }
};

/**
 * Cache multiple image URLs
 * @param {string[]} urls - Array of image URLs to cache
 * @param {function} onProgress - Progress callback
 * @returns {Promise<Object>} Results object
 */
export const cacheImageUrls = async (urls, onProgress = null) => {
    const results = {
        total: urls.length,
        successful: 0,
        failed: 0,
        errors: [],
        completed: [],
    };

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const progress = ((i + 1) / urls.length) * 100;

        try {
            const success = await cacheImageUrl(url);
            if (success) {
                results.successful++;
                results.completed.push(url);
            } else {
                results.failed++;
                results.errors.push({ url, error: 'Failed to cache' });
            }
        } catch (error) {
            results.failed++;
            results.errors.push({ url, error: error.message });
        }

        onProgress?.(progress, i + 1, urls.length, url);
    }

    return results;
};

/**
 * Get cache statistics with expiration info
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
    const now = Date.now();
    const expired = [];
    const valid = [];

    for (const [key, entry] of imageCache.entries()) {
        if (entry.isExpired()) {
            expired.push(key);
        } else {
            valid.push(key);
        }
    }

    return {
        total: imageCache.size,
        valid: valid.length,
        expired: expired.length,
        validKeys: valid,
        expiredKeys: expired,
    };
};

/**
 * Clear expired cache entries
 * @param {function} onComplete - Completion callback
 */
export const clearExpiredCache = async (onComplete = null) => {
    try {
        cleanExpiredCache();
        onComplete?.();
    } catch (error) {
        console.error('Error clearing expired cache:', error);
        throw error;
    }
};

/**
 * Preload images with timeout
 * @param {string[]} imageKeys - Array of image keys
 * @param {number} timeout - Timeout in milliseconds
 * @param {function} onProgress - Progress callback
 * @param {function} onComplete - Completion callback
 * @param {function} onError - Error callback
 * @returns {Promise<Object>} Results object
 */
export const preloadImagesWithTimeout = async (
    imageKeys = [],
    timeout = 30000,
    onProgress = null,
    onComplete = null,
    onError = null
) => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Image preloading timed out after ${timeout}ms`));
        }, timeout);

        preloadLocalImages(imageKeys, onProgress, (results) => {
            clearTimeout(timeoutId);
            onComplete?.(results);
            resolve(results);
        }, (error) => {
            clearTimeout(timeoutId);
            onError?.(error);
            reject(error);
        });
    });
};

// Initialize cache when module loads
initializeCache();

