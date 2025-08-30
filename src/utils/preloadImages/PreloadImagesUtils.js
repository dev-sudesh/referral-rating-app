import { Image } from 'react-native';

// Local image mappings - add your local images here
export const LOCAL_IMAGES = {
    'logo-full': require('../../assets/images/logos/logo-full.png'),
    'logo-icon': require('../../assets/images/logos/logo-icon.png'),
    'logo-small': require('../../assets/images/logos/logo-small.png'),
};

// Cache for preloaded images
const imageCache = new Map();

/**
 * Preload local images
 * @param {string[]} imageKeys - Array of image keys from LOCAL_IMAGES
 * @param {function} onProgress - Progress callback (progress, completed, total, currentKey)
 * @param {function} onComplete - Completion callback with results
 * @param {function} onError - Error callback
 * @returns {Promise<Object>} Results object
 */
export const preloadLocalImages = async (
    imageKeys = Object.keys(LOCAL_IMAGES),
    onProgress = null,
    onComplete = null,
    onError = null
) => {
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
                imageCache.set(key, LOCAL_IMAGES[key]);

                results.successful++;
                results.completed.push(key);

            } catch (error) {
                results.failed++;
                results.errors.push({ key, error: error.message });
            }

            // Call progress callback
            onProgress?.(progress, i + 1, imageKeys.length, key);
        }

        onComplete?.(results);
        return results;
    } catch (error) {
        onError?.(error);
        throw error;
    }
};

/**
 * Preload remote images
 * @param {string[]} imageUrls - Array of remote image URLs
 * @param {function} onProgress - Progress callback (progress, completed, total, currentUrl)
 * @param {function} onComplete - Completion callback with results
 * @param {function} onError - Error callback
 * @returns {Promise<Object>} Results object
 */
export const preloadRemoteImages = async (
    imageUrls = [],
    onProgress = null,
    onComplete = null,
    onError = null
) => {
    const results = {
        total: imageUrls.length,
        successful: 0,
        failed: 0,
        errors: [],
        completed: [],
    };

    try {
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const progress = ((i + 1) / imageUrls.length) * 100;

            try {
                // Preload the remote image
                await Image.prefetch(url);

                // Add to cache
                imageCache.set(url, url);

                results.successful++;
                results.completed.push(url);

            } catch (error) {
                results.failed++;
                results.errors.push({ url, error: error.message });
            }

            // Call progress callback
            onProgress?.(progress, i + 1, imageUrls.length, url);
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
 * Get cached image
 * @param {string} key - Image key or URL
 * @returns {any} Cached image or null
 */
export const getCachedImage = (key) => {
    return imageCache.get(key) || null;
};

/**
 * Check if image is cached
 * @param {string} key - Image key or URL
 * @returns {boolean} True if cached
 */
export const isImageCached = (key) => {
    return imageCache.has(key);
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
    return {
        size: imageCache.size,
        keys: Array.from(imageCache.keys()),
    };
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
