import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native';
import { useSearchSuggestions, useUserFilters } from '../../hooks/useFirebaseStore';

const SearchScreenIntegration = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Use the Firebase Store hooks
    const {
        suggestions,
        loadSuggestions,
        addSearchKeyword,
        loading: searchLoading,
    } = useSearchSuggestions();

    const {
        filters,
        saveFilters,
        loading: filtersLoading,
    } = useUserFilters();

    // Load suggestions when component mounts
    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    // Handle search input changes
    const handleSearchChange = (text) => {
        setSearchQuery(text);
        setShowSuggestions(text.length > 0);

        // Load suggestions based on current input
        if (text.length > 0) {
            loadSuggestions(text.toLowerCase());
        }
    };

    // Handle search submission
    const handleSearch = async () => {
        if (searchQuery.trim()) {
            try {
                // Store the search keyword for future suggestions
                await addSearchKeyword(searchQuery);

                // Perform your actual search here 

                // Hide suggestions after search
                setShowSuggestions(false);

                // You would typically navigate to search results or update results here
                Alert.alert('Search', `Searching for: ${searchQuery}`);
            } catch (error) {
                console.error('Error performing search:', error);
            }
        }
    };

    // Handle suggestion selection
    const handleSuggestionSelect = async (suggestion) => {
        setSearchQuery(suggestion.keyword);
        setShowSuggestions(false);

        try {
            // Increment the search count for this suggestion
            await addSearchKeyword(suggestion.keyword);

            // Perform search with selected suggestion 
            Alert.alert('Search', `Searching for: ${suggestion.keyword}`);
        } catch (error) {
            console.error('Error selecting suggestion:', error);
        }
    };

    // Handle filter changes
    const handleFilterChange = (filterKey, value) => {
        const newFilters = { ...filters, [filterKey]: value };
        saveFilters(newFilters);
    };

    // Render suggestion item
    const renderSuggestion = ({ item }) => (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionSelect(item)}
        >
            <Text style={styles.suggestionText}>{item.keyword}</Text>
            <Text style={styles.suggestionCount}>
                Searched {item.searchCount} times
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
                <Text style={styles.title}>Search Places</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for restaurants, cafes, shops..."
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                />
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.searchButton}
                    onPress={handleSearch}
                    disabled={searchLoading}
                >
                    <Text style={styles.searchButtonText}>
                        {searchLoading ? 'Searching...' : 'Search'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Recent Searches</Text>
                    <FlatList
                        data={suggestions}
                        renderItem={renderSuggestion}
                        keyExtractor={(item) => item.keyword}
                        style={styles.suggestionsList}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}

            {/* Filters Section */}
            <View style={styles.filtersContainer}>
                <Text style={styles.filtersTitle}>Search Filters</Text>

                {/* Category Filter */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Category:</Text>
                    <View style={styles.filterOptions}>
                        {['restaurant', 'cafe', 'shop', 'service'].map((category) => (
                            <TouchableOpacity
                                activeOpacity={1}
                                key={category}
                                style={[
                                    styles.filterOption,
                                    filters.category?.includes(category) && styles.filterOptionSelected,
                                ]}
                                onPress={() => {
                                    const currentCategories = filters.category || [];
                                    const newCategories = currentCategories.includes(category)
                                        ? currentCategories.filter(c => c !== category)
                                        : [...currentCategories, category];
                                    handleFilterChange('category', newCategories);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        filters.category?.includes(category) && styles.filterOptionTextSelected,
                                    ]}
                                >
                                    {category}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Rating Filter */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Minimum Rating:</Text>
                    <View style={styles.filterOptions}>
                        {[3, 3.5, 4, 4.5].map((rating) => (
                            <TouchableOpacity
                                activeOpacity={1}
                                key={rating}
                                style={[
                                    styles.filterOption,
                                    filters.rating === rating && styles.filterOptionSelected,
                                ]}
                                onPress={() => handleFilterChange('rating', rating)}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        filters.rating === rating && styles.filterOptionTextSelected,
                                    ]}
                                >
                                    {rating}+
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Distance Filter */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Distance (km):</Text>
                    <View style={styles.filterOptions}>
                        {[1, 3, 5, 10].map((distance) => (
                            <TouchableOpacity
                                activeOpacity={1}
                                key={distance}
                                style={[
                                    styles.filterOption,
                                    filters.distance === distance && styles.filterOptionSelected,
                                ]}
                                onPress={() => handleFilterChange('distance', distance)}
                            >
                                <Text
                                    style={[
                                        styles.filterOptionText,
                                        filters.distance === distance && styles.filterOptionTextSelected,
                                    ]}
                                >
                                    {distance}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Open Now Filter */}
                <View style={styles.filterRow}>
                    <Text style={styles.filterLabel}>Open Now:</Text>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.filterOption,
                            filters.openNow && styles.filterOptionSelected,
                        ]}
                        onPress={() => handleFilterChange('openNow', !filters.openNow)}
                    >
                        <Text
                            style={[
                                styles.filterOptionText,
                                filters.openNow && styles.filterOptionTextSelected,
                            ]}
                        >
                            {filters.openNow ? 'Yes' : 'No'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading Indicator */}
            {(searchLoading || filtersLoading) && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            {/* Current Filters Display */}
            <View style={styles.currentFiltersContainer}>
                <Text style={styles.currentFiltersTitle}>Current Filters:</Text>
                <Text style={styles.currentFiltersText}>
                    {JSON.stringify(filters, null, 2)}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchHeader: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    suggestionsContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        padding: 16,
        paddingBottom: 8,
    },
    suggestionsList: {
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionText: {
        fontSize: 16,
        color: '#333',
    },
    suggestionCount: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    filtersContainer: {
        backgroundColor: 'white',
        padding: 16,
        marginTop: 8,
    },
    filtersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    filterRow: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    filterOption: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    filterOptionSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    filterOptionText: {
        fontSize: 14,
        color: '#333',
    },
    filterOptionTextSelected: {
        color: 'white',
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    currentFiltersContainer: {
        backgroundColor: 'white',
        padding: 16,
        marginTop: 8,
    },
    currentFiltersTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    currentFiltersText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
});

export default SearchScreenIntegration;
