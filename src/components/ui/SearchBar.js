import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useRef, useEffect, memo } from 'react'
import { theme } from '../../constants/theme';
import { responsiveSize } from '../../utils/responsive/ResponsiveUi';
import IconAsset from '../../assets/icons/IconAsset';

const SearchBar = ({ handleBackPress, searchText = '', onSearch, onChangeText, onFilterPress, activeFilterCount = 0 }) => {

    const timeoutRef = useRef(null);

    // Properly memoized debounce function that calls search callback
    const debouncedSearch = useCallback((value) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            // Call the search callback instead of updating state
            onSearch(value);
        }, 500);
    }, [onSearch]);

    const handleClearSearch = () => {
        // Update parent input immediately and trigger debounced search clear
        onChangeText && onChangeText('');
        onSearch('');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleInputChange = (text) => {
        // Reflect text immediately in parent-controlled state
        onChangeText && onChangeText(text);
        // debouncedSearch(text);
    };

    const handleSearch = () => {
        debouncedSearch(searchText);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBackPress}
                    activeOpacity={1}
                >
                    <IconAsset.arrowBack width={responsiveSize(14)} height={responsiveSize(14)} fill={theme.colors.text.secondary} />
                </TouchableOpacity>

                <TextInput
                    style={styles.searchInput}
                    placeholder="Search now..."
                    placeholderTextColor={theme.colors.text.black}
                    value={searchText}
                    multiline={false}
                    numberOfLines={1}
                    onChangeText={handleInputChange}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    autoComplete="off"
                    importantForAutofill="no"
                />
                {searchText.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearSearch}
                        activeOpacity={1}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
                {searchText.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleSearch}
                        activeOpacity={1}
                    >
                        <IconAsset.searchIcon
                            width={24}
                            height={24}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
};

export default memo(SearchBar)

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
        height: theme.responsive.size(52),
    },
    backButton: {
        padding: theme.spacing.sm,
        marginRight: theme.spacing.xs,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        height: theme.responsive.size(50),
        ...Platform.select({
            android: {
                lineHeight: theme.responsive.size(34),
            },
        }),
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