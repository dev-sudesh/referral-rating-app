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
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';
import SearchFilterController from '../../controllers/filters/SearchFilterController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from '../../constants/data';
import FirebaseStoreService from '../../services/firebase/FirebaseStoreService';
import MapsController from '../../controllers/maps/MapsController';

const SearchFilter = ({
    initialFilters = {},
    loading = false
}) => {
    const [filterCategories, setFilterCategories] = useState(Constants.filters);
    const [filters, setFilters] = useState([]);
    const [searchFilterText, setSearchFilterText] = useState('');
    const bottomSheetRef = useRef(null);
    const initialFiltersRef = useRef(JSON.stringify(initialFilters));
    const { isSearchFilterVisible, setIsSearchFilterVisible } = SearchFilterController();
    const { places, setPlaces, userLocation } = MapsController();
    const insets = useSafeAreaInsets();

    // Handle visibility changes
    useEffect(() => {
        if (isSearchFilterVisible) {
            bottomSheetRef.current?.open();
            getFilters();
        } else {
            bottomSheetRef.current?.close();
        }
    }, [isSearchFilterVisible]);

    // Calculate active filter count
    const getActiveFilterCount = () => {
        return Object.values(filters).flat().length;
    };

    // Toggle filter selection
    const toggleFilter = (filterId) => {
        setFilters(prev => {
            const currentCategory = prev || [];
            const isSelected = currentCategory.includes(filterId);

            if (isSelected) {
                return currentCategory.filter(id => id !== filterId);
            }
            return [...currentCategory, filterId];
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters([]);
    };
    const onClose = () => {
        setIsSearchFilterVisible(false);
    };

    // Apply filters and close
    const handleApplyFilters = async () => {
        const places = await FirebaseStoreService.getFilteredPlaces(userLocation, filters);
        setPlaces(places);
        if (onClose) {
            onClose();
        }
    };

    // Handle close
    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // Filter options based on search text
    const getFilteredOptions = (options) => {
        if (!searchFilterText.trim()) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(searchFilterText.toLowerCase())
        );
    };

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
                activeOpacity={0.7}
            >
                <View style={[
                    styles.filterOptionIcon,
                    isSelected && styles.filterOptionSelectedIcon
                ]}>
                    {isSelected ? (
                        <IconAsset.checkIcon width={18} height={18} fill={theme.colors.background.white} />
                    ) : (
                        <IconAsset.plusIcon width={18} height={18} fill={theme.colors.text.primary} />
                    )}
                </View>
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
    const renderFilterCategory = ({ item: categoryKey }) => {
        const category = filterCategories[categoryKey];
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

    const getFilters = async () => {
        const filters = await FirebaseStoreService.getUserFilters();
        // get all filters from filterCategories which is in filters
        const favoriteFilters = Constants.filters.map(filter => filter.options.filter(option => filters.includes(option.id))).flat();
        setFilterCategories([
            {
                id: 'favorite',
                title: 'Favorite',
                options: favoriteFilters,
            },
            ...Constants.filters
        ]);
    };

    React.useEffect(() => {
        getFilters();
    }, []);

    return (
        <RBSheet
            ref={bottomSheetRef}
            closeOnDragDown={true}
            closeOnPressMask={true}
            statusBarTranslucent={true}
            statusBarBackgroundColor="transparent"
            statusBarStyle="dark-content"
            customStyles={{
                wrapper: styles.bottomSheetWrapper,
                container: styles.bottomSheetContainer,
                draggableIcon: styles.draggableIcon,
            }}
            onClose={handleClose}
            height={Dimensions.get('window').height * 0.9}
            animationType="slide"
            closeOnPressBack={true}
            keyboardAvoidingViewEnabled={true}
            keyboardAvoidingViewProps={{
                behavior: Platform.OS === 'ios' ? 'padding' : 'height',
            }}
        >
            <StatusBar
                barStyle="dark-content"
                translucent={true}
                backgroundColor="transparent"
            />
            <View style={styles.container}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: theme.spacing.md }]}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>
                        Search filters ({getActiveFilterCount()})
                    </Text>

                    <TouchableOpacity
                        style={styles.clearAllButton}
                        onPress={clearAllFilters}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearAllText}>CLEAR ALL</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Filter Input */}
                <View style={styles.searchContainer}>
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

                {/* Filter Categories */}
                <ScrollView
                    style={styles.filterContent}
                    showsVerticalScrollIndicator={false}
                >
                    {Object.keys(filterCategories).map((categoryKey) => (
                        <View key={categoryKey}>
                            {renderFilterCategory({ item: categoryKey })}
                        </View>
                    ))}
                </ScrollView>

                {/* Apply Button */}
                <View style={styles.applyButtonContainer}>
                    <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApplyFilters}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.applyButtonText}>Show results</Text>
                    </TouchableOpacity>
                </View>
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
        paddingTop: 0,
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
    filterCategory: {
        marginBottom: theme.spacing.lg,
    },
    filterCategoryTitle: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.semiBold,
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
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
    },
    applyButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        ...theme.typography.bodyLarge,
        color: theme.colors.background.white,
        fontWeight: theme.fontWeight.semiBold,
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
});

export default SearchFilter;
