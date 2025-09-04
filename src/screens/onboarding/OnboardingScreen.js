import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { theme } from '../../constants/theme';
import Constants from '../../constants/data';
import ScreenContainer from '../../components/common/ScreenContainer';
import OnboardingItem from '../../components/onboarding/OnboardingItem';
import { useOnboarding } from '../../hooks/useOnboarding';

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);
    const { isLoading, getStarted } = useOnboarding(navigation);

    // Memoize onboarding data to prevent unnecessary re-renders
    const onboardingData = useMemo(() => Constants.onboarding, []);
    const isLastSlide = useMemo(() => currentIndex === onboardingData.length - 1, [currentIndex, onboardingData.length]);

    // Memoize the render item function to prevent unnecessary re-renders
    const renderOnboardingItem = useCallback(({ item }) => (
        <OnboardingItem item={item} />
    ), []);

    // Memoize the key extractor function
    const keyExtractor = useCallback((item) => item.id, []);

    // Memoize the viewability config
    const viewabilityConfig = useMemo(() => ({
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 100,
    }), []);



    const handleNext = useCallback(() => {
        if (isLastSlide) {
            getStarted();
        } else {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        }
    }, [currentIndex, isLastSlide, getStarted]);

    const handleSkip = useCallback(() => {
        getStarted();
    }, [getStarted]);

    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    // Memoize pagination dots to prevent unnecessary re-renders
    const renderPagination = useCallback(() => (
        <View style={styles.paginationContainer}>
            {onboardingData.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === currentIndex && styles.paginationDotActive,
                    ]}
                />
            ))}
        </View>
    ), [currentIndex, onboardingData.length]);

    // Memoize button text
    const buttonText = useMemo(() =>
        isLastSlide ? 'Get Started' : 'Next',
        [isLastSlide]
    );

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            safeArea={false}
            paddingCustom={{
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
            }}>

            <View style={styles.container}>
                {/* Skip Button */}
                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                    disabled={isLoading}
                    activeOpacity={1}
                >
                    <Text style={[styles.skipText, isLoading && styles.disabledText]}>
                        Skip
                    </Text>
                </TouchableOpacity>

                {/* Onboarding Slides */}
                <View style={styles.flatListContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={onboardingData}
                        renderItem={renderOnboardingItem}
                        keyExtractor={keyExtractor}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        style={styles.flatList}
                        contentContainerStyle={styles.flatListContent}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={2}
                        windowSize={3}
                        initialNumToRender={1}
                        getItemLayout={(data, index) => ({
                            length: theme.responsive.screen().width,
                            offset: theme.responsive.screen().width * index,
                            index,
                        })}
                    />
                </View>

                <View style={styles.footerContainer}>
                    {/* Pagination */}
                    {renderPagination()}

                    {/* Navigation Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.nextButton]}
                            onPress={handleNext}
                            activeOpacity={1}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.background.primary} size="small" />
                            ) : (
                                <Text style={styles.nextButtonText}>
                                    {buttonText}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.colors.background.primary,
    },
    skipButton: {
        position: 'absolute',
        top: theme.responsive.height(theme.responsive.screen().height * 0.05),
        right: theme.spacing.md,
        zIndex: 1,
        padding: theme.spacing.sm,
        minHeight: theme.responsive.size(44),
        minWidth: theme.responsive.size(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    skipText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    disabledText: {
        opacity: 0.5,
    },
    flatList: {
        height: '100%',
    },
    flatListContainer: {
        flex: 2,
    },
    flatListContent: {
        flexGrow: 1,
    },

    paginationContainer: {
        width: theme.responsive.screen().width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.white,
        marginBottom: theme.responsive.isSmall() ? theme.spacing.xxl : theme.spacing.xxxl,
        marginTop: theme.spacing.md,
    },
    paginationDot: {
        width: theme.responsive.size(10),
        height: theme.responsive.size(10),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.tertiary[100],
        marginHorizontal: theme.spacing.xs,
    },
    paginationDotActive: {
        backgroundColor: theme.colors.tertiary[500],
        width: theme.responsive.size(20),
    },
    buttonContainer: {
        width: theme.responsive.screen().width,
        paddingHorizontal: theme.responsive.isSmall() ? theme.spacing.lg : theme.spacing.xxl,
        backgroundColor: theme.colors.background.white,
    },
    nextButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.xl,
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
        minHeight: theme.responsive.buttonHeight('large'),
        ...theme.shadows.small,
    },
    nextButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    footerContainer: {
        height: theme.responsive.height(theme.responsive.screen().height * 0.22),
        minHeight: theme.responsive.height(160),
        width: theme.responsive.screen().width,
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        backgroundColor: theme.colors.background.white,
    },
});

export default OnboardingScreen; 