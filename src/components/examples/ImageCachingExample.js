import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AppImage from '../common/AppImage';
import useImageCache from '../../hooks/useImageCache';
import { theme } from '../../constants/theme';

/**
 * Example component demonstrating the enhanced image caching system
 * Shows how to use AppImage with automatic caching and the useImageCache hook
 */
const ImageCachingExample = () => {
    const [imageUrl, setImageUrl] = useState('https://picsum.photos/400/300');
    const [customUrl, setCustomUrl] = useState('');

    const {
        cacheUrl,
        cacheUrls,
        batchCache,
        checkCached,
        getCached,
        clearCache,
        cacheStats,
        isLoading
    } = useImageCache();

    const sampleUrls = [
        'https://picsum.photos/200/200',
        'https://picsum.photos/300/300',
        'https://picsum.photos/400/400',
        'https://picsum.photos/500/500',
    ];

    const handleCacheSingle = async () => {
        if (customUrl) {
            const success = await cacheUrl(customUrl);
            alert(success ? 'Image cached successfully!' : 'Failed to cache image');
        }
    };

    const handleCacheBatch = async () => {
        const results = await batchCache(sampleUrls, 2, (progress, completed, total, currentUrl) => {
            console.log(`Progress: ${progress.toFixed(1)}% - ${completed}/${total} - ${currentUrl}`);
        });
        alert(`Batch cache complete!\nSuccess: ${results.successful}\nFailed: ${results.failed}`);
    };

    const handleCheckCached = () => {
        const isCached = checkCached(customUrl || imageUrl);
        alert(`Image is ${isCached ? 'cached' : 'not cached'}`);
    };

    const handleClearAll = async () => {
        await clearCache();
        alert('Cache cleared!');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Image Caching Example</Text>

            {/* Cache Statistics */}
            {cacheStats && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Cache Statistics</Text>
                    <Text style={styles.statsText}>Total: {cacheStats.total}</Text>
                    <Text style={styles.statsText}>Valid: {cacheStats.valid}</Text>
                    <Text style={styles.statsText}>Expired: {cacheStats.expired}</Text>
                </View>
            )}

            {/* Example AppImage with automatic caching */}
            <View style={styles.imageSection}>
                <Text style={styles.sectionTitle}>AppImage with Auto-Caching</Text>
                <Text style={styles.description}>
                    This image automatically caches when loaded (autoCache=true)
                </Text>
                <AppImage
                    source={imageUrl}
                    style={styles.imageContainer}
                    imageStyle={styles.image}
                    showLoader={true}
                    autoCache={true}
                    preloadOnMount={true}
                />
            </View>

            {/* Custom URL Input */}
            <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Custom Image URL</Text>
                <TextInput
                    style={styles.textInput}
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    placeholder="Enter image URL"
                    placeholderTextColor="#999"
                />
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.button} onPress={handleCacheSingle}>
                        <Text style={styles.buttonText}>Cache URL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleCheckCached}>
                        <Text style={styles.buttonText}>Check Cached</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Batch Operations */}
            <View style={styles.batchSection}>
                <Text style={styles.sectionTitle}>Batch Operations</Text>
                <TouchableOpacity
                    style={[styles.button, styles.batchButton]}
                    onPress={handleCacheBatch}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>
                        {isLoading ? 'Caching...' : `Cache ${sampleUrls.length} Images`}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Cache Management */}
            <View style={styles.managementSection}>
                <Text style={styles.sectionTitle}>Cache Management</Text>
                <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearAll}>
                    <Text style={styles.buttonText}>Clear All Cache</Text>
                </TouchableOpacity>
            </View>

            {/* Multiple Images Display */}
            <View style={styles.multipleSection}>
                <Text style={styles.sectionTitle}>Multiple Cached Images</Text>
                <Text style={styles.description}>
                    These images use the enhanced AppImage component with caching
                </Text>
                {sampleUrls.map((url, index) => (
                    <View key={index} style={styles.multipleImageContainer}>
                        <Text style={styles.imageLabel}>Image {index + 1}</Text>
                        <AppImage
                            source={url}
                            style={styles.multipleImageContainer}
                            imageStyle={styles.multipleImage}
                            showLoader={true}
                            autoCache={true}
                        />
                    </View>
                ))}
            </View>
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
    statsText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    imageSection: {
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    inputSection: {
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
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        fontSize: 14,
        marginBottom: 12,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        flex: 0.48,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    batchSection: {
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
    batchButton: {
        backgroundColor: '#34C759',
        width: '100%',
    },
    managementSection: {
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
    clearButton: {
        backgroundColor: '#FF3B30',
        width: '100%',
    },
    multipleSection: {
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
    multipleImageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
    },
    multipleImage: {
        width: '100%',
        height: '100%',
    },
    imageLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
});

export default ImageCachingExample;
