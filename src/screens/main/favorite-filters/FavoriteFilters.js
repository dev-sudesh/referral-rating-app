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
import Constants from '../../../constants/data';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import ToastUtils from '../../../utils/ToastUtils';

const FavoriteFilters = ({ navigation }) => {

    const [filters, setFilters] = useState([]);
    const [filterCategories, setFilterCategories] = useState(Constants.filters);

    // Toggle filter selection
    const toggleFilter = (filter) => {
        // store filter categories wise
        setFilters(prev => {
            const currentCategory = prev || [];
            const isSelected = currentCategory.includes(filter.id);

            if (isSelected) {
                return currentCategory.filter(id => id !== filter.id);
            }
            return [...currentCategory, filter.id];
        });
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilters([]);
    };

    const saveFilters = async () => {

        await FirebaseStoreService.storeUserFilters(filters.filter(filter => filter.length > 0));
        ToastUtils.success('Filters saved successfully');
    };

    const getFilters = async () => {
        const filters = await FirebaseStoreService.getUserFilters();
        setFilters(filters);
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
                onPress={() => toggleFilter(item)}
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
                            {renderFilterOption({ item: option })}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    React.useEffect(() => {
        getFilters();
    }, []);

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
                    <TouchableOpacity style={styles.saveButton} onPress={saveFilters}>
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