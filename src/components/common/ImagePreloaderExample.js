import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../constants/theme';
import useImagePreloader from '../../hooks/useImagePreloader';
import { preloadLocalImages, preloadRemoteImages, clearImageCache } from '../../utils/preloadImages/PreloadImagesUtils';

/**
 * Example component demonstrating different ways to use image preloading
 * This can be used as a reference for implementing preloading in your app
 */
const ImagePreloaderExample = () => {
    const [results, setResults] = useState(null);
    const {
        isLoading,
        progress,
        completedCount,
        totalCount,
        currentImage,
        preloadLocal,
        preloadRemote,
        preloadAll,
        clearCache,
        resetState,
        isComplete,
        hasError,
        successCount,
        failureCount,
    } = useImagePreloader();

    // Example 1: Preload specific local images
    const handlePreloadLocal = async () => {
        const result = await preloadLocal(
            ['logo-full', 'logo-icon'],
            (result) => {
                setResults(result);
            },
            (error) => {
                console.error('Local preloading failed:', error);
            }
        );
    };

    // Example 2: Preload remote images
    const handlePreloadRemote = async () => {
        const remoteImages = [
            'https://picsum.photos/200/300',
            'https://picsum.photos/300/200',
            'https://picsum.photos/400/400',
        ];

        const result = await preloadRemote(
            remoteImages,
            (result) => {
                setResults(result);
            },
            (error) => {
                console.error('Remote preloading failed:', error);
            }
        );
    };

    // Example 3: Preload both local and remote images
    const handlePreloadAll = async () => {
        const localImages = ['logo-full', 'logo-icon', 'logo-small'];
        const remoteImages = [
            'https://picsum.photos/200/300',
            'https://picsum.photos/300/200',
        ];

        const result = await preloadAll(
            localImages,
            remoteImages,
            (result) => {
                setResults(result);
            },
            (error) => {
                console.error('All preloading failed:', error);
            }
        );
    };

    // Example 4: Clear cache
    const handleClearCache = async () => {
        try {
            await clearCache(() => {
                setResults(null);
            });
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    // Example 5: Using utility functions directly
    const handleDirectPreload = async () => {
        try {
            const result = await preloadLocalImages(
                ['logo-full'],
                (progress, completed, total, key) => {
                },
                (result) => {
                    setResults(result);
                }
            );
        } catch (error) {
            console.error('Direct preload failed:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Image Preloader Examples</Text>

            {/* Status Display */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusTitle}>Current Status:</Text>
                <Text style={styles.statusText}>
                    Loading: {isLoading ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.statusText}>
                    Progress: {Math.round(progress)}%
                </Text>
                <Text style={styles.statusText}>
                    Completed: {completedCount}/{totalCount}
                </Text>
                {currentImage && (
                    <Text style={styles.statusText}>
                        Current: {currentImage}
                    </Text>
                )}
                {isComplete && (
                    <Text style={styles.statusText}>
                        ✅ Complete! Success: {successCount}, Failed: {failureCount}
                    </Text>
                )}
                {hasError && (
                    <Text style={styles.statusText}>
                        ❌ Error occurred
                    </Text>
                )}
            </View>

            {/* Progress Bar */}
            {isLoading && (
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
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.primaryButton]}
                    onPress={handlePreloadLocal}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Preload Local Images</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handlePreloadRemote}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Preload Remote Images</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.successButton]}
                    onPress={handlePreloadAll}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Preload All Images</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.warningButton]}
                    onPress={handleDirectPreload}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>Direct Preload (Utility)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.dangerButton]}
                    onPress={handleClearCache}
                >
                    <Text style={styles.buttonText}>Clear Cache</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, styles.infoButton]}
                    onPress={resetState}
                >
                    <Text style={styles.buttonText}>Reset State</Text>
                </TouchableOpacity>
            </View>

            {/* Results Display */}
            {results && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Last Operation Results:</Text>
                    <Text style={styles.resultsText}>
                        Total: {results.total || results.local?.total + results.remote?.total}
                    </Text>
                    <Text style={styles.resultsText}>
                        Successful: {results.successful || results.local?.successful + results.remote?.successful}
                    </Text>
                    <Text style={styles.resultsText}>
                        Failed: {results.failed || results.local?.failed + results.remote?.failed}
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.primary,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    statusContainer: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing.lg,
    },
    statusTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    statusText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.sm,
        marginRight: theme.spacing.sm,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.sm,
    },
    progressText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        fontWeight: '600',
        minWidth: 40,
    },
    buttonContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    button: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: theme.colors.primary[500],
    },
    secondaryButton: {
        backgroundColor: theme.colors.secondary[500],
    },
    successButton: {
        backgroundColor: theme.colors.success[500],
    },
    warningButton: {
        backgroundColor: theme.colors.warning[500],
    },
    dangerButton: {
        backgroundColor: theme.colors.error[500],
    },
    infoButton: {
        backgroundColor: theme.colors.info[500],
    },
    buttonText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.white,
        fontWeight: '600',
    },
    resultsContainer: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
    },
    resultsTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    resultsText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
});

export default ImagePreloaderExample; 