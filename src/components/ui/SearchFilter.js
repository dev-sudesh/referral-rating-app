import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    TextInput,
    FlatList,
    Dimensions,
    Platform,
    StatusBar,
    Keyboard,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';
import SearchFilterController from '../../controllers/filters/SearchFilterController';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapsController from '../../controllers/maps/MapsController';
import ApiController from '../../services/api/ApiController';

const SearchFilter = () => {
    const { data: placeCategoriesResponse } = ApiController.placeCategories();
    const [filters, setFilters] = useState([]);
    const [searchFilterText, setSearchFilterText] = useState('');
    const bottomSheetRef = useRef(null);
    const { isSearchFilterVisible, setIsSearchFilterVisible, filterHeight, showSearchBar, initialFilters, handleFilterCallback, placeCategories } = SearchFilterController();
    const [filterCategories, setFilterCategories] = useState(placeCategoriesResponse ?? []);
    const { places, setPlaces, userLocation } = MapsController();
    const insets = useSafeAreaInsets();
    const nearbyPlacesMutation = ApiController.nearbyPlaces();
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (Array.isArray(placeCategories)) {
            setFilterCategories(placeCategories);
        }
    }, [placeCategories]);

    // Handle visibility changes
    useEffect(() => {
        if (isSearchFilterVisible) {
            bottomSheetRef.current?.open();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [isSearchFilterVisible]);

    // Calculate active filter count
    const getActiveFilterCount = () => {
        return Object.values(filters).flat().length;
    };

    // Toggle filter selection - only one filter can be selected at a time
    const toggleFilter = (filterId) => {

        setFilters(prev => {
            const currentCategory = prev || [];
            const isSelected = currentCategory.includes(filterId);

            if (isSelected) {
                // If already selected, deselect it
                return [];
            }
            // If not selected, clear all and select only this one
            return [filterId];
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters([]);
        setSearchFilterText('');
    };
    const onClose = () => {
        setIsSearchFilterVisible({ isSearchFilterVisible: false });
    };

    // Apply filters and close
    const handleApplyFilters = async () => {
        setIsLoading(true);
        try {
            if (handleFilterCallback) {
                // Wait for the callback to complete before closing
                await handleFilterCallback(filters);
            } else {
                const places = await nearbyPlacesMutation.mutateAsync({ latitude: userLocation.latitude, longitude: userLocation.longitude, category: filters[0] });
                setPlaces(places);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            setIsLoading(false);
            // Close modal only after API call completes
            if (onClose) {
                onClose();
            }
        }
    };

    // Handle close
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // Calculate string similarity using Levenshtein distance
    const calculateSimilarity = (str1, str2) => {
        const s1 = str1.toLowerCase();
        const s2 = str2.toLowerCase();

        // If strings are identical, return 1
        if (s1 === s2) return 1;

        // If one string contains the other, return high similarity
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;

        // Calculate Levenshtein distance
        const len1 = s1.length;
        const len2 = s2.length;

        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;

        const matrix = [];
        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1       // deletion
                    );
                }
            }
        }

        const distance = matrix[len2][len1];
        const maxLen = Math.max(len1, len2);
        return 1 - (distance / maxLen);
    };

    // Filter options based on search text (with fuzzy matching)
    const getFilteredOptions = (options) => {
        if (!searchFilterText.trim()) return options;
        const searchLower = searchFilterText.toLowerCase();

        return options.filter(option => {
            const labelLower = option.label.toLowerCase();
            // Exact match or contains match
            if (labelLower.includes(searchLower)) return true;

            // Fuzzy match for typos (similarity > 50%)
            const similarity = calculateSimilarity(searchLower, labelLower);
            return similarity > 0.5;
        });
    };

    // Check if there are any filtered categories
    const hasFilteredCategories = useMemo(() => {
        if (!searchFilterText.trim()) return true; // Show all if no search
        return filterCategories.some(category => {
            if (!category || !category.options || !Array.isArray(category.options)) {
                return false;
            }
            const filteredOptions = getFilteredOptions(category.options);
            return filteredOptions.length > 0;
        });
    }, [filterCategories, searchFilterText]);

    // Get similar word suggestions based on search text (for typos and similar words)
    const getSimilarSuggestions = useMemo(() => {
        if (!searchFilterText.trim()) return [];

        const searchLower = searchFilterText.toLowerCase().trim();
        const allOptions = [];

        // Collect all options from all categories
        filterCategories.forEach(category => {
            if (category && category.options && Array.isArray(category.options)) {
                category.options.forEach(option => {
                    if (option && option.label) {
                        allOptions.push(option.label);
                    }
                });
            }
        });

        // Calculate similarity scores for each option
        const scoredOptions = allOptions.map(label => ({
            label,
            similarity: calculateSimilarity(searchLower, label.toLowerCase())
        }))
            .filter(item => item.similarity > 0.3) // Only include options with similarity > 30%
            .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (highest first)
            .slice(0, 6) // Get top 6 matches
            .map(item => item.label);

        return scoredOptions;
    }, [filterCategories, searchFilterText]);

    // Get popular filter suggestions (fallback when no search text)
    const getPopularSuggestions = useMemo(() => {
        const suggestions = [];
        filterCategories.forEach(category => {
            if (category && category.options && Array.isArray(category.options)) {
                // Get first few options from each category as suggestions
                category.options.slice(0, 3).forEach(option => {
                    if (option && option.label && suggestions.length < 6) {
                        suggestions.push(option.label);
                    }
                });
            }
        });
        return suggestions.slice(0, 6); // Limit to 6 suggestions
    }, [filterCategories]);

    // Render filter option
    const renderFilterOption = ({ item }) => {
        const isSelected = filters?.includes(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.filterOption,
                    isSelected && styles.filterOptionSelected
                ]}
                onPress={() => toggleFilter(item.id)}
                activeOpacity={1}
            >
                {/* <View style={[
                    styles.filterOptionIcon,
                    isSelected && styles.filterOptionSelectedIcon
                ]}>
                    {isSelected ? (
                        <IconAsset.checkIcon width={18} height={18} fill={theme.colors.background.white} />
                    ) : (
                        <IconAsset.plusIcon width={18} height={18} fill={theme.colors.text.primary} />
                    )}
                </View> */}
                <Text style={[
                    styles.filterOptionText,
                    isSelected && styles.filterOptionTextSelected
                ]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Render filter category
    const renderFilterCategory = ({ item: category }) => {
        if (!category || !category.options || !Array.isArray(category.options)) {
            return null;
        }
        const filteredOptions = getFilteredOptions(category.options);

        if (filteredOptions.length === 0) return null;

        return (
            <View style={styles.filterCategory}>
                <Text style={styles.filterCategoryTitle}>{category.title}</Text>
                <View style={styles.filterOptionsContainer}>
                    {filteredOptions.map((option) => (
                        <View key={option.id}>
                            {renderFilterOption({ item: option })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    React.useEffect(() => {
        if (initialFilters) {
            setFilters(initialFilters);
        }
    }, [initialFilters]);

    return (
        <RBSheet
            ref={bottomSheetRef}
            closeOnDragDown={true}
            closeOnPressMask={true}
            statusBarTranslucent={true}
            statusBarBackgroundColor="transparent"
            customStyles={{
                wrapper: styles.bottomSheetWrapper,
                container: styles.bottomSheetContainer,
                draggableIcon: styles.draggableIcon,
            }}
            customModalProps={{
                statusBarTranslucent: true,
                statusBarBackgroundColor: 'transparent',
            }}
            onClose={handleClose}
            height={filterHeight}
            animationType="slide"
            closeOnPressBack={true}
        >


            <View style={[styles.container,]}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: theme.spacing.md }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={1}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Search filters
                    </Text>

                    <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={clearAllFilters}
                        activeOpacity={1}
                    >
                        <Text style={styles.clearAllText}>CLEAR ALL</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Filter Input */}
                {
                    showSearchBar && <View style={styles.searchContainer}>
                        <View style={styles.searchInputContainer}>
                            <IconAsset.searchIcon width={20} height={20} fill={theme.colors.text.secondary} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search filters"
                                placeholderTextColor={theme.colors.text.secondary}
                                value={searchFilterText}
                                onChangeText={setSearchFilterText}
                            />
                        </View>
                    </View>
                }
                <KeyboardAvoidingView style={{ flex: 1 }}
                    behavior="padding"
                    keyboardVerticalOffset={0}
                >

                    <ScrollView
                        style={styles.filterContent}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="none"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.filterContentContainer}
                    >
                        {hasFilteredCategories ? (
                            filterCategories.map((category) => (
                                <View key={category.id || category.title}>
                                    {renderFilterCategory({ item: category })}
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyStateContainer}>
                                <View style={styles.emptyStateIconContainer}>
                                    <IconAsset.searchIcon width={48} height={48} fill={theme.colors.text.secondary} />
                                </View>
                                <Text style={styles.emptyStateTitle}>
                                    No results found
                                </Text>
                                <Text style={styles.emptyStateText}>
                                    We couldn't find any filters matching "{searchFilterText}"
                                </Text>
                                {searchFilterText.trim() && getSimilarSuggestions.length > 0 ? (
                                    <View style={styles.suggestionsContainer}>
                                        <Text style={styles.suggestionsTitle}>
                                            Did you mean:
                                        </Text>
                                        <View style={styles.suggestionsList}>
                                            {getSimilarSuggestions.map((suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionChip}
                                                    onPress={() => setSearchFilterText(suggestion)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.suggestionText}>
                                                        {suggestion}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : getPopularSuggestions.length > 0 ? (
                                    <View style={styles.suggestionsContainer}>
                                        <Text style={styles.suggestionsTitle}>
                                            Try searching for:
                                        </Text>
                                        <View style={styles.suggestionsList}>
                                            {getPopularSuggestions.map((suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionChip}
                                                    onPress={() => setSearchFilterText(suggestion)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.suggestionText}>
                                                        {suggestion}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        )}
                    </ScrollView>

                    {/* Apply Button */}
                    <View style={styles.applyButtonContainer}>
                        <TouchableOpacity
                            disabled={isLoading || filters.length === 0}
                            style={[
                                styles.applyButton,
                                (isLoading || filters.length === 0) && styles.applyButtonDisabled
                            ]}
                            onPress={handleApplyFilters}
                            activeOpacity={1}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.background.white} />
                            ) : (
                                <Text style={[
                                    styles.applyButtonText,
                                    (filters.length === 0) && styles.applyButtonTextDisabled
                                ]}>Show results</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

            </View>

        </RBSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 1000,
    },
    bottomSheetContainer: {
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.white,
        paddingTop: 0

    },
    draggableIcon: {
        backgroundColor: theme.colors.neutral[300],
        width: 40,
        height: 4,
    },
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.screenPadding,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    closeButton: {
        padding: theme.spacing.sm,
    },
    closeButtonText: {
        fontSize: 20,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    headerTitle: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.semiBold,
        color: theme.colors.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    clearAllButton: {
        padding: theme.spacing.sm,
    },
    clearAllText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.medium,
    },
    searchContainer: {
        paddingHorizontal: theme.spacing.screenPadding,
        paddingVertical: theme.spacing.md,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        paddingHorizontal: theme.spacing.md,
        minHeight: 48,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        marginLeft: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
    },
    filterContent: {
        flex: 1,
        paddingHorizontal: theme.spacing.screenPadding,
    },
    filterContentContainer: {
        paddingTop: theme.spacing.xl,
    },
    filterCategory: {
        marginBottom: theme.spacing.lg,
    },
    filterCategoryTitle: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    filterOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.full,
        padding: 8,
        gap: theme.spacing.xs,
    },
    filterOptionSelected: {
        backgroundColor: theme.colors.background.searchFilter,
        borderColor: theme.colors.background.searchFilter,
    },
    filterOptionText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
    },
    filterOptionTextSelected: {
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.medium,
    },
    applyButtonContainer: {
        paddingHorizontal: theme.spacing.screenPadding,
        paddingVertical: theme.spacing.md,
    },
    applyButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: theme.responsive.buttonHeight('medium'),
    },
    applyButtonDisabled: {
        backgroundColor: theme.colors.neutral[300],
    },
    applyButtonText: {
        ...theme.typography.bodyLarge,
        color: theme.colors.background.white,
        fontWeight: theme.fontWeight.bold,
    },
    applyButtonTextDisabled: {
        color: theme.colors.text.disabled,
    },
    iconText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontWeight: 'bold',
    },
    iconTextSelected: {
        color: theme.colors.background.white,
    },
    filterOptionIcon: {
        width: 30,
        height: 30,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.background.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterOptionSelectedIcon: {
        backgroundColor: theme.colors.tertiary[500],
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xl * 2,
        paddingHorizontal: theme.spacing.screenPadding,
    },
    emptyStateIconContainer: {
        marginBottom: theme.spacing.lg,
        opacity: 0.5,
    },
    emptyStateTitle: {
        ...theme.typography.h4,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    emptyStateText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        lineHeight: 22,
    },
    suggestionsContainer: {
        width: '100%',
        marginTop: theme.spacing.md,
    },
    suggestionsTitle: {
        ...theme.typography.bodyMedium,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    suggestionsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
    suggestionChip: {
        backgroundColor: theme.colors.background.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    suggestionText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
    },
});

export default SearchFilter;
