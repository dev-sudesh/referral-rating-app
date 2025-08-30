import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { theme } from '../../constants/theme';
import { responsiveSize } from '../../utils/responsive/ResponsiveUi';
import IconAsset from '../../assets/icons/IconAsset';

const SearchBar = ({ handleBackPress, setSearchText, onFilterPress, activeFilterCount = 0 }) => {

    const [searchInput, setSearchInput] = useState('');

    const handleClearSearch = () => {
        setSearchText('');
        setSearchInput('');

    };

    //custom debounce function for search input
    const debounceSearch = (searchInput) => {
        setTimeout(() => {
            setSearchText(searchInput);
        }, 500);
    };

    React.useEffect(() => {
        debounceSearch(searchInput);
    }, [searchInput]);

    return (
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    activeOpacity={0.7}
                >
                    <IconAsset.arrowBack width={responsiveSize(14)} height={responsiveSize(14)} fill={theme.colors.text.secondary} />
                </TouchableOpacity>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search now..."
                    placeholderTextColor={theme.colors.text.black}
                    value={searchInput}
                    onChangeText={setSearchInput}
                    returnKeyType="search"
                />

                {searchInput.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearSearch}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
};

export default SearchBar

const styles = StyleSheet.create({

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
        lineHeight: null
    },
    filterButton: {
        padding: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
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
    filterButtonContainer: {
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.round,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background.white,
    },
    filterBadgeText: {
        fontSize: 10,
        color: theme.colors.background.white,
        fontWeight: 'bold',
    },
})