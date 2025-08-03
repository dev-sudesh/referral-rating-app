import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Dimensions,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { theme } from '../../constants/theme';
import Constants from '../../constants/data';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const renderOnboardingItem = ({ item, index }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <item.icon />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
                {item.description && <Text style={styles.description}>{item.description}</Text>}
            </View>
        </View>
    );

    const handleNext = () => {
        if (currentIndex < Constants.onboarding.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            navigation.replace(Constants.Screen.Stack.Auth);
        }
    };

    const handleSkip = () => {
        navigation.replace(Constants.Screen.Stack.Auth);
    };

    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const renderPagination = () => (
        <View style={styles.paginationContainer}>
            {Constants.onboarding.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === currentIndex && styles.paginationDotActive,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background.primary}
            />

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Onboarding Slides */}
            <FlatList
                ref={flatListRef}
                data={Constants.onboarding}
                renderItem={renderOnboardingItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
            />

            <View style={styles.footerContainer}>
                {/* Pagination */}
                {renderPagination()}

                {/* Navigation Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.nextButton}
                        onPress={handleNext}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.nextButtonText}>
                            {currentIndex === Constants.onboarding.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    skipButton: {
        position: 'absolute',
        top: 60,
        right: theme.spacing.md,
        zIndex: 1,
        padding: theme.spacing.sm,
    },
    skipText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    flatList: {
        flex: 1,
    },
    flatListContent: {
        flexGrow: 1,
    },
    slide: {
        width,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    icon: {
        fontSize: 60,
    },
    contentContainer: {
        width,
        height: height * 0.2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.white,
        paddingHorizontal: width * 0.2,
    },
    title: {
        ...theme.typography.h3,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    subtitle: {
        ...theme.typography.h4,
        color: theme.colors.primary[500],
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    paginationContainer: {
        width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        marginBottom: theme.spacing.xxl,
        backgroundColor: theme.colors.background.white,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.tertiary[100],
        marginHorizontal: theme.spacing.xs,
    },
    paginationDotActive: {
        backgroundColor: theme.colors.tertiary[500],
        width: 24,
    },
    buttonContainer: {
        width,
        paddingHorizontal: theme.spacing.xxxl,
        paddingBottom: theme.spacing.xxl,
        backgroundColor: theme.colors.background.white,
    },
    nextButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.ios.small,
    },
    nextButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    footerContainer: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        backgroundColor: theme.colors.background.white,
    },
});

export default OnboardingScreen; 