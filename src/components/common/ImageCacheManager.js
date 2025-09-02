import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import useImageCache from '../../hooks/useImageCache';
import { theme } from '../../constants/theme';

/**
 * ImageCacheManager Component
 * Provides a UI for managing image cache with statistics and controls
 * Useful for development/debugging or admin panels
 */
const ImageCacheManager = () => {
    const {
        isLoading,
        cacheStats,
        cacheUrl,
        cacheUrls,
        batchCache,
        preloadCritical,
        clearCache,
        clearExpired,
        updateCacheStats,
    } = useImageCache();

    const handleCacheSingleUrl = async () => {
        Alert.prompt(
            'Cache Image URL',
            'Enter the image URL to cache:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cache',
                    onPress: async (url) => {
                        if (url) {
                            const success = await cacheUrl(url);
                            if (success) {
                                Alert.alert('Success', 'Image cached successfully!');
                            } else {
                                Alert.alert('Error', 'Failed to cache image');
                            }
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    const handleCacheMultipleUrls = async () => {
        Alert.prompt(
            'Cache Multiple URLs',
            'Enter image URLs separated by commas:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cache',
                    onPress: async (urlsText) => {
                        if (urlsText) {
                            const urls = urlsText.split(',').map(url => url.trim()).filter(Boolean);
                            if (urls.length > 0) {
                                const results = await cacheUrls(urls);
                                Alert.alert(
                                    'Cache Results',
                                    `Successfully cached: ${results.successful}\nFailed: ${results.failed}`
                                );
                            }
                        }
                    }
                }
            ],
            'plain-text'
        );
    };

    const handleBatchCache = async () => {
        const sampleUrls = [
            'https://picsum.photos/200/300',
            'https://picsum.photos/300/200',
            'https://picsum.photos/400/400',
            'https://picsum.photos/500/500',
            'https://picsum.photos/600/600',
        ];

        Alert.alert(
            'Batch Cache',
            `Cache ${sampleUrls.length} sample images?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cache',
                    onPress: async () => {
                        const results = await batchCache(sampleUrls, 2, (progress, completed, total, currentUrl) => {
                            console.log(`Progress: ${progress.toFixed(1)}% - ${completed}/${total} - ${currentUrl}`);
                        });
                        Alert.alert(
                            'Batch Cache Results',
                            `Successfully cached: ${results.successful}\nFailed: ${results.failed}`
                        );
                    }
                }
            ]
        );
    };

    const handlePreloadCritical = async () => {
        const criticalUrls = [
            'https://picsum.photos/800/600',
            'https://picsum.photos/900/700',
        ];

        Alert.alert(
            'Preload Critical Images',
            `Preload ${criticalUrls.length} critical images?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Preload',
                    onPress: async () => {
                        const results = await preloadCritical(criticalUrls);
                        Alert.alert(
                            'Preload Results',
                            `Successfully preloaded: ${results.successful}\nFailed: ${results.failed}`
                        );
                    }
                }
            ]
        );
    };

    const handleClearCache = () => {
        Alert.alert(
            'Clear Cache',
            'Are you sure you want to clear all cached images?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        await clearCache();
                        Alert.alert('Success', 'Cache cleared successfully!');
                    }
                }
            ]
        );
    };

    const handleClearExpired = async () => {
        await clearExpired();
        Alert.alert('Success', 'Expired cache entries cleared!');
    };

    const renderCacheStats = () => {
        if (!cacheStats) return null;

        return (
            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Cache Statistics</Text>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Total Entries:</Text>
                    <Text style={styles.statsValue}>{cacheStats.total}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Valid Entries:</Text>
                    <Text style={styles.statsValue}>{cacheStats.valid}</Text>
                </View>
                <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Expired Entries:</Text>
                    <Text style={styles.statsValue}>{cacheStats.expired}</Text>
                </View>
            </View>
        );
    };

    const renderActionButton = (title, onPress, style = {}) => (
        <TouchableOpacity
            style={[styles.actionButton, style]}
            onPress={onPress}
            disabled={isLoading}
        >
            <Text style={styles.actionButtonText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Image Cache Manager</Text>

            {renderCacheStats()}

            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Cache Actions</Text>

                {renderActionButton('Cache Single URL', handleCacheSingleUrl, styles.primaryButton)}
                {renderActionButton('Cache Multiple URLs', handleCacheMultipleUrls, styles.primaryButton)}
                {renderActionButton('Batch Cache Sample Images', handleBatchCache, styles.secondaryButton)}
                {renderActionButton('Preload Critical Images', handlePreloadCritical, styles.secondaryButton)}

                <Text style={styles.sectionTitle}>Cache Management</Text>

                {renderActionButton('Clear Expired Entries', handleClearExpired, styles.warningButton)}
                {renderActionButton('Clear All Cache', handleClearCache, styles.dangerButton)}
                {renderActionButton('Refresh Stats', updateCacheStats, styles.infoButton)}
            </View>

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    statsContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statsLabel: {
        fontSize: 14,
        color: '#666',
    },
    statsValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    actionsContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 12,
        color: '#333',
    },
    actionButton: {
        padding: 12,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#34C759',
    },
    warningButton: {
        backgroundColor: '#FF9500',
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    infoButton: {
        backgroundColor: '#5AC8FA',
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
});

export default ImageCacheManager;
