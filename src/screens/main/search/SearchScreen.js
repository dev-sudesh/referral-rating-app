import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import ScreenContainer from '../../../components/common/ScreenContainer';
import { responsiveSize } from '../../../utils/responsive/ResponsiveUi';
import SearchBar from '../../../components/ui/SearchBar';
import SearchFilter from '../../../components/ui/SearchFilter';

const SearchScreen = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    const [recentSearches] = useState([
        { id: 1, text: 'Meat', time: 'Today' },
        { id: 2, text: 'Vege food', time: 'Yesterday' },
        { id: 3, text: 'Drink bars', time: '2 days ago' },
    ]);

    const [popularSearches] = useState([
        { id: 1, text: 'European cuisine' },
        { id: 2, text: 'Asian cuisine' },
        { id: 3, text: 'Local' },
    ]);

    const handleSearch = (searchTerm) => {
        // setSearchText(searchTerm);
        // TODO: Implement search functionality
        console.log('Searching for:', searchTerm);
    };

    const handleClearSearch = () => {
        // setSearchText('');
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSearchItemPress = (item) => {
        // handleSearch(item.text);
    };

    const handleFilterPress = () => {
        setIsFilterVisible(true);
    };

    const handleFilterClose = () => {
        setIsFilterVisible(false);
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        console.log('Applied filters:', filters);
        // TODO: Implement filter logic
    };

    // Calculate active filter count
    const getActiveFilterCount = () => {
        return Object.values(activeFilters).flat().length;
    };



    const SearchSection = ({ title, items, showTime = false }) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item, index) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        styles.searchItem,
                    ]}
                    onPress={() => handleSearchItemPress(item)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.searchItemText}>{item.text}</Text>
                    {showTime && (
                        <Text style={styles.searchItemTime}>{item.time}</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: 0,
            }}
        >

            <StatusBar
                barStyle="dark-content"
                translucent={true}
                backgroundColor={'transparent'}
            />

            <SearchBar
                handleBackPress={handleBackPress}
                setSearchText={setSearchText}
                onFilterPress={handleFilterPress}
                activeFilterCount={getActiveFilterCount()}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
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
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.white,
    },
    searchBarContainer: {
        paddingHorizontal: theme.spacing.screenPadding,
        paddingVertical: theme.spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        paddingHorizontal: theme.spacing.sm,
        minHeight: 48,
    },
    backButton: {
        padding: theme.spacing.sm,
        marginRight: theme.spacing.xs,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        paddingVertical: theme.spacing.sm,
    },
    clearButton: {
        padding: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
    },
    clearButtonText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        fontWeight: '500',
    },
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
    lastSearchItem: {
        borderBottomWidth: 0,
    },
    searchItemText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        flex: 1,
    },
    searchItemTime: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.secondary,
        marginLeft: theme.spacing.sm,
    },
});

export default SearchScreen;