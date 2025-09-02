import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppImage from '../common/AppImage';
import useImageCache from '../../hooks/useImageCache';

/**
 * Simple test component to verify cache behavior
 * This helps test if images show loader on app restart
 */
const CacheTestComponent = () => {
    const [testImageUrl] = useState('https://picsum.photos/300/200');
    const { isCacheReady, checkCached, cacheStats } = useImageCache();

    useEffect(() => {
        // Log cache status when component mounts
        console.log('[CacheTest] Component mounted, cache ready:', isCacheReady);
        if (isCacheReady) {
            const isCached = checkCached(testImageUrl);
            console.log('[CacheTest] Image cached:', isCached);
            console.log('[CacheTest] Cache stats:', cacheStats);
        }
    }, [isCacheReady, testImageUrl, checkCached, cacheStats]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cache Test Component</Text>

            <Text style={styles.status}>
                Cache Ready: {isCacheReady ? '✅ Yes' : '⏳ No'}
            </Text>

            {cacheStats && (
                <Text style={styles.status}>
                    Cached Images: {cacheStats.total}
                </Text>
            )}

            <Text style={styles.description}>
                This image should NOT show loader if it's already cached.
                Try restarting the app to test persistence.
            </Text>

            <AppImage
                source={testImageUrl}
                style={styles.imageContainer}
                imageStyle={styles.image}
                showLoader={true}
                autoCache={true}
                preloadOnMount={true}
            />

            <Text style={styles.note}>
                If you see the loader every time you restart the app,
                there's still an issue with cache initialization.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    status: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 12,
        marginBottom: 16,
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    note: {
        fontSize: 11,
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
    },
});

export default CacheTestComponent;
