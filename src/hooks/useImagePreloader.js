import { useState, useCallback } from 'react';
import {
    preloadLocalImages,
    preloadRemoteImages,
    preloadAllImages,
    clearImageCache,
    LOCAL_IMAGES,
} from '../utils/preloadImages/PreloadImagesUtils';

/**
 * Custom hook for image preloading with state management
 * @returns {Object} Hook state and methods
 */
const useImagePreloader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [currentImage, setCurrentImage] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isComplete, setIsComplete] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [successCount, setSuccessCount] = useState(0);
    const [failureCount, setFailureCount] = useState(0);

    /**
     * Reset all state
     */
    const resetState = useCallback(() => {
        setIsLoading(false);
        setProgress(0);
        setCompletedCount(0);
        setTotalCount(0);
        setCurrentImage(null);
        setResults(null);
        setError(null);
        setIsComplete(false);
        setHasError(false);
        setSuccessCount(0);
        setFailureCount(0);
    }, []);

    /**
     * Preload local images
     * @param {string[]} imageKeys - Array of image keys
     * @param {function} onComplete - Completion callback
     * @param {function} onError - Error callback
     */
    const preloadLocal = useCallback(async (
        imageKeys = Object.keys(LOCAL_IMAGES),
        onComplete = null,
        onError = null
    ) => {
        setIsLoading(true);
        setProgress(0);
        setCompletedCount(0);
        setTotalCount(imageKeys.length);
        setCurrentImage(null);
        setError(null);
        setIsComplete(false);
        setHasError(false);
        setSuccessCount(0);
        setFailureCount(0);

        try {
            const results = await preloadLocalImages(
                imageKeys,
                (progress, completed, total, currentKey) => {
                    setProgress(progress);
                    setCompletedCount(completed);
                    setCurrentImage(currentKey);
                },
                (results) => {
                    setResults(results);
                    setSuccessCount(results.successful);
                    setFailureCount(results.failed);
                    setIsComplete(true);
                    setIsLoading(false);
                    onComplete?.(results);
                },
                (error) => {
                    setError(error);
                    setHasError(true);
                    setIsLoading(false);
                    onError?.(error);
                }
            );

            return results;
        } catch (error) {
            setError(error);
            setHasError(true);
            setIsLoading(false);
            onError?.(error);
            throw error;
        }
    }, []);

    /**
     * Preload remote images
     * @param {string[]} imageUrls - Array of remote image URLs
     * @param {function} onComplete - Completion callback
     * @param {function} onError - Error callback
     */
    const preloadRemote = useCallback(async (
        imageUrls = [],
        onComplete = null,
        onError = null
    ) => {
        setIsLoading(true);
        setProgress(0);
        setCompletedCount(0);
        setTotalCount(imageUrls.length);
        setCurrentImage(null);
        setError(null);
        setIsComplete(false);
        setHasError(false);
        setSuccessCount(0);
        setFailureCount(0);

        try {
            const results = await preloadRemoteImages(
                imageUrls,
                (progress, completed, total, currentUrl) => {
                    setProgress(progress);
                    setCompletedCount(completed);
                    setCurrentImage(currentUrl);
                },
                (results) => {
                    setResults(results);
                    setSuccessCount(results.successful);
                    setFailureCount(results.failed);
                    setIsComplete(true);
                    setIsLoading(false);
                    onComplete?.(results);
                },
                (error) => {
                    setError(error);
                    setHasError(true);
                    setIsLoading(false);
                    onError?.(error);
                }
            );

            return results;
        } catch (error) {
            setError(error);
            setHasError(true);
            setIsLoading(false);
            onError?.(error);
            throw error;
        }
    }, []);

    /**
     * Preload both local and remote images
     * @param {string[]} localImageKeys - Array of local image keys
     * @param {string[]} remoteImageUrls - Array of remote image URLs
     * @param {function} onComplete - Completion callback
     * @param {function} onError - Error callback
     */
    const preloadAll = useCallback(async (
        localImageKeys = [],
        remoteImageUrls = [],
        onComplete = null,
        onError = null
    ) => {
        setIsLoading(true);
        setProgress(0);
        setCompletedCount(0);
        setTotalCount(localImageKeys.length + remoteImageUrls.length);
        setCurrentImage(null);
        setError(null);
        setIsComplete(false);
        setHasError(false);
        setSuccessCount(0);
        setFailureCount(0);

        try {
            const results = await preloadAllImages(
                localImageKeys,
                remoteImageUrls,
                (results) => {
                    setResults(results);
                    setSuccessCount(results.successful);
                    setFailureCount(results.failed);
                    setIsComplete(true);
                    setIsLoading(false);
                    onComplete?.(results);
                },
                (error) => {
                    setError(error);
                    setHasError(true);
                    setIsLoading(false);
                    onError?.(error);
                }
            );

            return results;
        } catch (error) {
            setError(error);
            setHasError(true);
            setIsLoading(false);
            onError?.(error);
            throw error;
        }
    }, []);

    /**
     * Clear image cache
     * @param {function} onComplete - Completion callback
     */
    const clearCache = useCallback(async (onComplete = null) => {
        try {
            await clearImageCache(() => {
                resetState();
                onComplete?.();
            });
        } catch (error) {
            setError(error);
            setHasError(true);
            onComplete?.();
            throw error;
        }
    }, [resetState]);

    return {
        // State
        isLoading,
        progress,
        completedCount,
        totalCount,
        currentImage,
        results,
        error,
        isComplete,
        hasError,
        successCount,
        failureCount,

        // Methods
        preloadLocal,
        preloadRemote,
        preloadAll,
        clearCache,
        resetState,
    };
};

export default useImagePreloader; 