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
import MapsController from '../../../controllers/maps/MapsController';
import { getPlaceDistance } from '../../../utils/DistanceUtils';
import ApiController from '../../../services/api/ApiController';
import { CommonActions } from '@react-navigation/native';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';

const SearchScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const { userLocation, setPlaces, setSelectedPlace, setShowPlaceFullCard } = MapsController();
    const { radius } = SearchFilterController();
    const [popularSearches, setPopularSearches] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const searchPlacesMutation = ApiController.searchPlaces();

    // Memoize the search function to prevent recreation on every render
    const handleSearch = useCallback(async (searchTerm) => {
        if (!searchTerm.trim() || !userLocation) return;

        const currentRadius = SearchFilterController.getState().radius || 3000;
        setIsSearching(true);
        try {
            const results = await searchPlacesMutation.mutateAsync({
                query: searchTerm,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: currentRadius
            });
            setSearchResults(results);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [userLocation, radius]);

    const handleBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleSearchItemPress = useCallback((keyword) => {
        setSearchText(keyword);
        setHasSearched(true);
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
            setHasSearched(true);
            handleSearch(searchTerm);
        } else {
            setSearchResults([]);
            setHasSearched(false);
        }
    }, [handleSearch]);

    const showPlaceDetails = useCallback((place) => {
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
    const handleShowOnMap = useCallback((results) => {
        setTimeout(() => {
            //map reload
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'MainTabs',
                    params: {
                        screen: 'Map',
                        params: {
                            initialSearch: {
                                category: results[0].category,
                                places: results,
                            },
                        },
                    },
                })
            );
        }, 1000);
    }, [navigation]);

    // Memoize the SearchResultsSection component
    const SearchResultsSection = useCallback(({ results, isLoading, searchText }) => {
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

        // Show message when user is typing but hasn't searched yet
        if (searchText.trim() && !hasSearched) {
            return (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ready to search</Text>
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Click the search button to find places</Text>
                    </View>
                </View>
            );
        }

        if (results.length === 0 && hasSearched) {
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
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Search Results </Text>
                        <TouchableOpacity
                            onPress={() => {
                                handleShowOnMap(results);
                            }}
                            style={styles.showOnMapButton}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.showOnMapButtonText}>Show on Map</Text>
                        </TouchableOpacity>
                    </View>
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
    }, [hasSearched, showPlaceDetails, userLocation]);

    // Re-trigger search when radius changes if there's an active search
    useEffect(() => {
        if (hasSearched && searchText.trim() && userLocation) {
            const currentRadius = SearchFilterController.getState().radius || 3000;
            setIsSearching(true);
            searchPlacesMutation.mutateAsync({
                query: searchText,
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: currentRadius
            }).then((results) => {
                setSearchResults(results);
            }).catch((error) => {
                setSearchResults([]);
            }).finally(() => {
                setIsSearching(false);
            });
        }
    }, [radius, hasSearched, searchText, userLocation]);

    useEffect(() => {
    }, []);

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: 0,
            }}
        >
            <SearchBar
                handleBackPress={handleBackPress}
                searchText={searchText}
                onChangeText={setSearchText}
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
                    //  create a section for enter search message
                    <View style={styles.section}>
                        {/* create a appropriate message for enter search message */}
                        <Text style={styles.sectionTitle}>Start your search</Text>
                        <Text style={styles.sectionMessage}>You can search for places, businesses, and more</Text>
                    </View>
                )}
                <SearchResultsSection
                    results={searchResults}
                    isLoading={isSearching}
                    searchText={searchText}
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
        textTransform: 'capitalize',
    },
    sectionMessage: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        paddingHorizontal: theme.spacing.screenPadding,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    showOnMapButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary[500],
        marginRight: theme.spacing.md
    },
    showOnMapButtonText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.inverse,
    },
});

export default SearchScreen;