import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppImage from './AppImage';
import { theme } from '../../constants/theme';
import { LOCAL_IMAGES } from '../../utils/preloadImages/PreloadImagesUtils';

/**
 * Example component showing how to use preloaded images throughout the app
 * This demonstrates different use cases and configurations
 */
const PreloadedImageExample = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Preloaded Images Examples</Text>

            {/* Logo Examples */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Logo Images</Text>

                <View style={styles.imageRow}>
                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['logo-full']}
                            localKey="logo-full"
                            style={styles.smallImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Logo Full</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['logo-icon']}
                            localKey="logo-icon"
                            style={styles.smallImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Logo Icon</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['logo-small']}
                            localKey="logo-small"
                            style={styles.smallImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Logo Small</Text>
                    </View>
                </View>
            </View>

            {/* Intro Images */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Intro Images</Text>

                <View style={styles.imageRow}>
                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['intro-1']}
                            localKey="intro-1"
                            style={styles.mediumImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Intro 1</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['intro-2']}
                            localKey="intro-2"
                            style={styles.mediumImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Intro 2</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['intro-3']}
                            localKey="intro-3"
                            style={styles.mediumImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Intro 3</Text>
                    </View>
                </View>
            </View>

            {/* Tab Icons */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tab Icons</Text>

                <View style={styles.imageRow}>
                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['map-icon']}
                            localKey="map-icon"
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Map</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['profile-icon']}
                            localKey="profile-icon"
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Profile</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['referrals-icon']}
                            localKey="referrals-icon"
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Referrals</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={LOCAL_IMAGES['rewards-icon']}
                            localKey="rewards-icon"
                            style={styles.iconImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.imageLabel}>Rewards</Text>
                    </View>
                </View>
            </View>

            {/* Remote Image Example */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Remote Images (Preloaded)</Text>

                <View style={styles.imageRow}>
                    <View style={styles.imageContainer}>
                        <AppImage
                            source={{ uri: 'https://picsum.photos/400/400?random=1' }}
                            localKey="remote-1"
                            style={styles.mediumImage}
                            resizeMode="cover"
                            fallbackSource={LOCAL_IMAGES['logo-icon']}
                        />
                        <Text style={styles.imageLabel}>Remote 1</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={{ uri: 'https://picsum.photos/400/400?random=2' }}
                            localKey="remote-2"
                            style={styles.mediumImage}
                            resizeMode="cover"
                            fallbackSource={LOCAL_IMAGES['logo-icon']}
                        />
                        <Text style={styles.imageLabel}>Remote 2</Text>
                    </View>

                    <View style={styles.imageContainer}>
                        <AppImage
                            source={{ uri: 'https://picsum.photos/400/400?random=3' }}
                            localKey="remote-3"
                            style={styles.mediumImage}
                            resizeMode="cover"
                            fallbackSource={LOCAL_IMAGES['logo-icon']}
                        />
                        <Text style={styles.imageLabel}>Remote 3</Text>
                    </View>
                </View>
            </View>

            {/* Usage Instructions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usage Instructions</Text>

                <View style={styles.instructionContainer}>
                    <Text style={styles.instructionTitle}>1. Preload Images in SplashScreen:</Text>
                    <Text style={styles.instructionText}>
                        Use the ImagePreloader component to preload all necessary images before the app starts.
                    </Text>

                    <Text style={styles.instructionTitle}>2. Use Preloaded Images:</Text>
                    <Text style={styles.instructionText}>
                        Pass the localKey prop to AppImage to use preloaded images for instant loading.
                    </Text>

                    <Text style={styles.instructionTitle}>3. Fallback Handling:</Text>
                    <Text style={styles.instructionText}>
                        Provide fallbackSource for remote images in case they fail to load.
                    </Text>

                    <Text style={styles.instructionTitle}>4. Performance Benefits:</Text>
                    <Text style={styles.instructionText}>
                        Preloaded images load instantly without any delay or loading indicators.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    imageRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: theme.spacing.md,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    smallImage: {
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.secondary,
    },
    mediumImage: {
        width: 100,
        height: 100,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.background.secondary,
    },
    iconImage: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.background.secondary,
    },
    imageLabel: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    instructionContainer: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
    },
    instructionTitle: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
        marginTop: theme.spacing.md,
    },
    instructionText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
        lineHeight: 20,
    },
});

export default PreloadedImageExample; 