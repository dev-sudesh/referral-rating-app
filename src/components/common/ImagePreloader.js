import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import useImagePreloader from '../../hooks/useImagePreloader';
import { LOCAL_IMAGES } from '../../utils/preloadImages/PreloadImagesUtils';

/**
 * ImagePreloader Component
 * Demonstrates how to use the image preloading functionality
 * Can be used in SplashScreen or any other screen where you want to preload images
 */
const ImagePreloader = ({
    localImageKeys = Object.keys(LOCAL_IMAGES),
    remoteImageUrls = [],
    onComplete = null,
    onError = null,
    showProgress = true,
    autoStart = true,
    children = null,
}) => {
    const {
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
        preloadAll,
        resetState,
    } = useImagePreloader();

    // Auto-start preloading when component mounts
    useEffect(() => {
        if (autoStart && localImageKeys.length > 0) {
            startPreloading();
        }
    }, [autoStart, localImageKeys]);

    const startPreloading = async () => {
        try {
            await preloadAll(
                localImageKeys,
                remoteImageUrls,
                (result) => {
                    onComplete?.(result);
                },
                (error) => {
                    onError?.(error);
                }
            );
        } catch (error) {
            onError?.(error);
        }
    };

    const handleRetry = () => {
        resetState();
        startPreloading();
    };

    // Show children if preloading is complete or if no preloading is needed
    if (isComplete || (!autoStart && !isLoading)) {
        return children;
    }

    // Show error state
    if (hasError) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>Image Preloading Failed</Text>
                    <Text style={styles.errorMessage}>
                        {error?.message || 'An error occurred while preloading images'}
                    </Text>
                    <Text style={styles.retryText} onPress={handleRetry}>
                        Tap to retry
                    </Text>
                </View>
            </View>
        );
    }

    // Show loading state
    return (
        <View style={styles.container}>
            <View style={styles.loadingContainer}>
                <Text style={styles.title}>Loading Images</Text>

                {showProgress && (
                    <>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progress}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                        </View>

                        <Text style={styles.statusText}>
                            {completedCount} of {totalCount} images loaded
                        </Text>

                        {currentImage && (
                            <Text style={styles.currentImageText}>
                                Loading: {currentImage}
                            </Text>
                        )}
                    </>
                )}

                {results && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultsText}>
                            ✅ {successCount} successful
                        </Text>
                        {failureCount > 0 && (
                            <Text style={styles.resultsText}>
                                ❌ {failureCount} failed
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: 250,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginRight: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        minWidth: 40,
    },
    statusText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    currentImageText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        maxWidth: 200,
    },
    resultsContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    resultsText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    errorContainer: {
        alignItems: 'center',
        padding: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 15,
    },
    retryText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default ImagePreloader; 