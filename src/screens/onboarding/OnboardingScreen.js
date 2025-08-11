import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Platform,
} from 'react-native';
import { theme } from '../../constants/theme';
import Constants from '../../constants/data';
import ScreenContainer from '../../components/common/ScreenContainer';

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
    const flatListRef = useRef(null);
    const autoScrollTimer = useRef(null);

    // Auto scroll functionality
    useEffect(() => {
        const startAutoScroll = () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }

            autoScrollTimer.current = setInterval(() => {
                if (isAutoScrollActive) {
                    setCurrentIndex(prevIndex => {
                        const nextIndex = prevIndex + 1;
                        if (nextIndex < Constants.onboarding.length) {
                            flatListRef.current?.scrollToIndex({
                                index: nextIndex,
                                animated: true,
                            });
                            return nextIndex;
                        } else {
                            if (autoScrollTimer.current) {
                                clearInterval(autoScrollTimer.current);
                            }
                            return Constants.onboarding.length - 1;
                        }
                    });
                }
            }, 10000); // 10 seconds
        };

        if (isAutoScrollActive) {
            startAutoScroll();
        }

        return () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }
        };
    }, [isAutoScrollActive, navigation]);

    // Pause auto scroll when component unmounts or navigation happens
    useEffect(() => {
        return () => {
            if (autoScrollTimer.current) {
                clearInterval(autoScrollTimer.current);
            }
        };
    }, []);

    const renderOnboardingItem = ({ item, index }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <item.icon width={'100%'} height={'100%'} style={styles.icon} />
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.title}>{item.title}</Text>
                {item.subtitle && <Text style={styles.subtitle}>{item.subtitle}</Text>}
                {item.description && <Text style={styles.description}>{item.description}</Text>}
            </View>
        </View>
    );

    const handleNext = () => {
        // Pause auto scroll when user manually navigates
        setIsAutoScrollActive(false);

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
        // Pause auto scroll when user skips
        setIsAutoScrollActive(false);
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
        <ScreenContainer {...ScreenContainer.presets.default}
            paddingCustom={{
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
            }}>

            <View style={styles.container}>
                {/* Skip Button */}
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>

                {/* Onboarding Slides */}
                <View style={styles.flatListContainer}>
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
                        onScrollBeginDrag={() => setIsAutoScrollActive(false)}
                        style={styles.flatList}
                        contentContainerStyle={styles.flatListContent}
                    />
                </View>

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
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: theme.colors.background.primary,
    },
    viewContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    skipButton: {
        position: 'absolute',
        top: theme.responsive.height(20),
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
    flatList: {
        height: '100%',
    },
    flatListContainer: {
        flex: 2,
    },
    flatListContent: {
        flexGrow: 1,
    },
    slide: {
        flex: 1,
        width: theme.responsive.screen().width,
        alignItems: 'center',
    },
    iconContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        width: theme.responsive.screen().width,
        height: theme.responsive.height(theme.responsive.screen().height * 0.14),
        minHeight: theme.responsive.height(100),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.white,
        paddingHorizontal: theme.responsive.width(theme.responsive.screen().width * 0.2),
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