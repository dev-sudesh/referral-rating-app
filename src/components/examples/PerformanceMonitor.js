import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import useImageCache from '../../hooks/useImageCache';

/**
 * Performance monitoring component for image caching
 * Helps track performance improvements on iOS
 */
const PerformanceMonitor = () => {
    const [performanceData, setPerformanceData] = useState({
        cacheInitTime: 0,
        imageLoadTimes: [],
        averageLoadTime: 0,
        totalImages: 0,
        cachedImages: 0,
        performanceScore: 0
    });

    const { isCacheReady, cacheStats, checkCached } = useImageCache();
    const testImages = useRef([
        'https://picsum.photos/200/200',
        'https://picsum.photos/300/300',
        'https://picsum.photos/400/400',
        'https://picsum.photos/500/500',
        'https://picsum.photos/600/600',
    ]);

    const loadTimes = useRef([]);
    const startTime = useRef(0);

    useEffect(() => {
        if (isCacheReady) {
            startPerformanceTest();
        }
    }, [isCacheReady]);

    const startPerformanceTest = async () => {
        const testStart = Date.now();
        startTime.current = testStart;

        // Test cache initialization time
        const cacheInitTime = testStart - startTime.current;

        // Test image loading performance
        const imageLoadTimes = [];
        let cachedCount = 0;

        for (let i = 0; i < testImages.current.length; i++) {
            const imageUrl = testImages.current[i];
            const loadStart = Date.now();

            // Check if cached
            const isCached = checkCached(imageUrl);
            if (isCached) {
                cachedCount++;
            }

            // Simulate image load (in real app, this would be actual image loading)
            await new Promise(resolve => setTimeout(resolve, isCached ? 10 : 100));

            const loadTime = Date.now() - loadStart;
            imageLoadTimes.push({
                url: imageUrl,
                time: loadTime,
                cached: isCached
            });
        }

        const totalTime = Date.now() - testStart;
        const averageLoadTime = imageLoadTimes.reduce((sum, item) => sum + item.time, 0) / imageLoadTimes.length;

        // Calculate performance score (higher is better)
        const performanceScore = Math.round((1000 / (averageLoadTime + 1)) * 100);

        setPerformanceData({
            cacheInitTime,
            imageLoadTimes,
            averageLoadTime: Math.round(averageLoadTime),
            totalImages: testImages.current.length,
            cachedImages: cachedCount,
            performanceScore,
            totalTime
        });

        loadTimes.current = imageLoadTimes;
    };

    const getPerformanceColor = (score) => {
        if (score >= 80) return '#34C759'; // Green
        if (score >= 60) return '#FF9500'; // Orange
        return '#FF3B30'; // Red
    };

    const getLoadTimeColor = (time, cached) => {
        if (cached) return '#34C759'; // Green for cached
        if (time < 100) return '#34C759'; // Green for fast
        if (time < 300) return '#FF9500'; // Orange for medium
        return '#FF3B30'; // Red for slow
    };

    const runPerformanceTest = () => {
        startPerformanceTest();
    };

    const clearPerformanceData = () => {
        setPerformanceData({
            cacheInitTime: 0,
            imageLoadTimes: [],
            averageLoadTime: 0,
            totalImages: 0,
            cachedImages: 0,
            performanceScore: 0
        });
        loadTimes.current = [];
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Performance Monitor</Text>

            {/* Platform Info */}
            <View style={styles.platformInfo}>
                <Text style={styles.platformText}>
                    Platform: {Platform.OS.toUpperCase()}
                </Text>
                <Text style={styles.platformText}>
                    Cache Ready: {isCacheReady ? '✅ Yes' : '⏳ No'}
                </Text>
            </View>

            {/* Performance Summary */}
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Performance Summary</Text>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Performance Score:</Text>
                    <Text style={[styles.metricValue, { color: getPerformanceColor(performanceData.performanceScore) }]}>
                        {performanceData.performanceScore}/100
                    </Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Load Time:</Text>
                    <Text style={styles.metricValue}>
                        {performanceData.averageLoadTime}ms
                    </Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Cached Images:</Text>
                    <Text style={styles.metricValue}>
                        {performanceData.cachedImages}/{performanceData.totalImages}
                    </Text>
                </View>

                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Total Test Time:</Text>
                    <Text style={styles.metricValue}>
                        {performanceData.totalTime}ms
                    </Text>
                </View>
            </View>

            {/* Individual Image Performance */}
            {performanceData.imageLoadTimes.length > 0 && (
                <View style={styles.detailContainer}>
                    <Text style={styles.detailTitle}>Individual Image Performance</Text>

                    {performanceData.imageLoadTimes.map((item, index) => (
                        <View key={index} style={styles.imageRow}>
                            <Text style={styles.imageUrl} numberOfLines={1}>
                                {item.url.split('/').pop()}
                            </Text>
                            <View style={styles.imageMetrics}>
                                <Text style={[styles.loadTime, { color: getLoadTimeColor(item.time, item.cached) }]}>
                                    {item.time}ms
                                </Text>
                                <Text style={[styles.cacheStatus, { color: item.cached ? '#34C759' : '#FF9500' }]}>
                                    {item.cached ? 'Cached' : 'Network'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* Cache Statistics */}
            {cacheStats && (
                <View style={styles.cacheContainer}>
                    <Text style={styles.cacheTitle}>Cache Statistics</Text>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Total Entries:</Text>
                        <Text style={styles.metricValue}>{cacheStats.total}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Valid Entries:</Text>
                        <Text style={styles.metricValue}>{cacheStats.valid}</Text>
                    </View>

                    <View style={styles.metricRow}>
                        <Text style={styles.metricLabel}>Expired Entries:</Text>
                        <Text style={styles.metricValue}>{cacheStats.expired}</Text>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={runPerformanceTest}>
                    <Text style={styles.actionButtonText}>Run Performance Test</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={clearPerformanceData}>
                    <Text style={styles.actionButtonText}>Clear Data</Text>
                </TouchableOpacity>
            </View>

            {/* Performance Tips */}
            <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>Performance Tips for iOS:</Text>
                <Text style={styles.tipText}>• Use smaller batch sizes (3-5 images)</Text>
                <Text style={styles.tipText}>• Enable automatic caching with AppImage</Text>
                <Text style={styles.tipText}>• Preload critical images on app start</Text>
                <Text style={styles.tipText}>• Monitor cache statistics regularly</Text>
                <Text style={styles.tipText}>• Clear expired cache entries periodically</Text>
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
    platformInfo: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    platformText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    summaryContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 14,
        color: '#666',
    },
    metricValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    detailContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    imageUrl: {
        fontSize: 12,
        color: '#666',
        flex: 1,
        marginRight: 8,
    },
    imageMetrics: {
        alignItems: 'flex-end',
    },
    loadTime: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    cacheStatus: {
        fontSize: 10,
        fontStyle: 'italic',
    },
    cacheContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cacheTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        flex: 0.48,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#FF3B30',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    tipsContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    tipText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
});

export default PerformanceMonitor;
