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
import ScreenHeader from '../../../components/ui/ScreenHeader';

const FavoriteFilters = ({ navigation }) => {

    const [filters, setFilters] = useState({});
    // Filter categories data
    const filterCategories = {
        category: {
            title: 'Category',
            options: [
                { id: 'food', label: 'Food' },
                { id: 'drinks', label: 'Drinks' },
                { id: 'entertainment', label: 'Entertainment' },
                { id: 'cinemas', label: 'Cinemas' },
                { id: 'sport', label: 'Sport' },
                { id: 'parking', label: 'Parking lots' },
            ]
        },
        cuisine: {
            title: 'Cuisine',
            options: [
                { id: 'italian', label: 'Italian' },
                { id: 'german', label: 'German' },
                { id: 'asian', label: 'Asian' },
                { id: 'eastEuropean', label: 'East European' },
                { id: 'spanish', label: 'Spanish' },
            ]
        },
        otherCategory: {
            title: 'Other category',
            options: [
                { id: 'other1', label: 'Other 1' },
                { id: 'other2', label: 'Other 2' },
                { id: 'other3', label: 'Other 3' },
            ]
        }
    };



    // Toggle filter selection
    const toggleFilter = (category, filterId) => {
        setFilters(prev => {
            const currentCategory = prev[category] || [];
            const isSelected = currentCategory.includes(filterId);

            if (isSelected) {
                return {
                    ...prev,
                    [category]: currentCategory.filter(id => id !== filterId)
                };
            } else {
                return {
                    ...prev,
                    [category]: [...currentCategory, filterId]
                };
            }
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters({});
    };


    // Render filter option
    const renderFilterOption = ({ item, category }) => {
        const isSelected = filters[category]?.includes(item.id);

        return (
            <TouchableOpacity
                style={[
                    styles.filterOption,
                    isSelected && styles.filterOptionSelected
                ]}
                onPress={() => toggleFilter(category, item.id)}
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
        const filteredOptions = category.options;

        if (filteredOptions.length === 0) return null;

        return (
            <View style={styles.filterCategory}>
                <Text style={styles.filterCategoryTitle}>{category.title}</Text>
                <View style={styles.filterOptionsContainer}>
                    {filteredOptions.map((option) => (
                        <View key={option.id}>
                            {renderFilterOption({ item: option, category: categoryKey })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: theme.spacing.md,
            }}
        >

            <StatusBar
                barStyle="dark-content"
                translucent={true}
                backgroundColor={'transparent'}
            />
            <ScreenHeader
                title="Favorite Filters"
                showBackButton
                onBackPress={() => navigation.goBack()}
                rightComponent={
                    <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                }
            />

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
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({

    filterContent: {
        flex: 1,
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

export default FavoriteFilters;