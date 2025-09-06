import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import SearchBar from '../../../components/ui/SearchBar';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import MapsController from '../../../controllers/maps/MapsController';
import { getPlaceDistance } from '../../../utils/DistanceUtils';

const SearchScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const { userLocation, setSelectedPlace, setShowPlaceFullCard } = MapsController();
    const [popularSearches, setPopularSearches] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);

    // Memoize the search function to prevent recreation on every render
    const handleSearch = useCallback(async (searchTerm) => {
        if (!searchTerm.trim() || !userLocation) return;

        setIsSearching(true);
        try {
            const results = await FirebaseStoreService.getSearchPlaces(userLocation, searchTerm);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [userLocation]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSearchItemPress = useCallback((keyword) => {
        setSearchText(keyword);
        handleSearch(keyword);
    }, [handleSearch]);

    const handleFilterPress = useCallback(() => {
        setIsFilterVisible(true);
    }, []);

    // Memoize active filter count calculation
    const activeFilterCount = useMemo(() => {
        return Object.values(activeFilters).flat().length;
    }, [activeFilters]);

    // Create a search callback that SearchBar can call directly
    const handleSearchCallback = useCallback((searchTerm) => {
        if (searchTerm.trim()) {
            setSearchText(searchTerm);
            handleSearch(searchTerm);
        } else {
            setSearchText('');
            setSearchResults([]);
        }
    }, [handleSearch]);

    const showPlaceDetails = useCallback((place) => {
        FirebaseStoreService.storeSearchKeyword(place.category);
        initData();
        setSelectedPlace(place);
        setShowPlaceFullCard(true);
    }, [setSelectedPlace, setShowPlaceFullCard]);

    // Memoize the SearchSection component to prevent recreation
    const SearchSection = useCallback(({ title, items, showTime = false }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.searchItem,
                    ]}
                    onPress={() => handleSearchItemPress(item.keyword)}
                    activeOpacity={1}
                >
                    <Text style={styles.searchItemText}>{item.keyword}</Text>
                </TouchableOpacity>
            ))}
        </View>
    ), [handleSearchItemPress]);

    // Memoize the SearchResultsSection component
    const SearchResultsSection = useCallback(({ results, isLoading }) => {
        if (isLoading) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Searching...</Text>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Finding places...</Text>
                    </View>
                </View>
            );
        }

        if (results.length === 0 && searchText.trim()) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>No results found</Text>
                    <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>Try searching with different keywords</Text>
                    </View>
                </View>
            );
        }

        if (results.length > 0) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Search Results: {searchText} </Text>
                    {results.map((place, index) => (
                        <TouchableOpacity
                            key={place.id}
                            style={styles.searchItem}
                            onPress={() => {
                                showPlaceDetails(place);
                            }}
                            activeOpacity={1}
                        >
                            <View style={styles.placeInfo}>
                                <Text style={styles.placeName}>{place.name}</Text>
                                <Text style={styles.placeAddress}>{place.address}</Text>
                                <Text style={styles.placeCategory}>{place.category}</Text>
                            </View>
                            <View style={styles.placeMeta}>
                                <Text style={styles.placeDistance}>
                                    {getPlaceDistance(userLocation, place)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        return null;
    }, [searchText, showPlaceDetails]);

    const loadPopularSearches = useCallback(async () => {
        const popularSearches = await FirebaseStoreService.getPopularSearchKeywords();
        setPopularSearches(popularSearches);
    }, []);

    const loadRecentSearches = useCallback(async () => {
        const recentSearches = await FirebaseStoreService.getSearchSuggestions();
        setRecentSearches(recentSearches);
    }, []);

    const initData = useCallback(async () => {
        await loadRecentSearches();
        await loadPopularSearches();
    }, [loadRecentSearches, loadPopularSearches]);

    useEffect(() => {
        initData();
    }, [initData]);

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: 0,
            }}
        >
            <SearchBar
                handleBackPress={handleBackPress}
                searchText={searchText}
                onSearch={handleSearchCallback}
                onFilterPress={handleFilterPress}
                activeFilterCount={activeFilterCount}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {!searchText.trim() && (
                    <>
                        <SearchSection
                            title="Recent search"
                            items={recentSearches}
                            showTime={true}
                        />

                        <SearchSection
                            title="Popular"
                            items={popularSearches}
                            showTime={false}
                        />
                    </>
                )}
                <SearchResultsSection
                    results={searchResults}
                    isLoading={isSearching}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: theme.spacing.xl,
    },
    section: {
        marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.screenPadding,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        textTransform: 'capitalize',
    },
    searchItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.screenPadding,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    searchItemText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        flex: 1,
    },
    loadingContainer: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.screenPadding,
        alignItems: 'center',
    },
    loadingText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    noResultsContainer: {
        paddingVertical: theme.spacing.lg,
        paddingHorizontal: theme.spacing.screenPadding,
        alignItems: 'center',
    },
    noResultsText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    placeInfo: {
        flex: 1,
    },
    placeName: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    placeAddress: {
        ...theme.typography.body,
        color: theme.colors.text.secondary,
    },
    placeCategory: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.tertiary,
        textTransform: 'capitalize',
    },
    placeMeta: {
        alignItems: 'flex-end',
    },
    placeDistance: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        fontWeight: theme.fontWeight.medium,
    },
});

export default SearchScreen;