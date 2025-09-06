import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import IconAsset from '../../../assets/icons/IconAsset';
import MapsController from '../../../controllers/maps/MapsController';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';
import NoDataAnimation from '../../../components/common/NoDataAnimation';
import Constants from '../../../constants/data';

const { width } = Dimensions.get('window');


const ReferralsScreen = ({ navigation }) => {

    const [referrals, setReferrals] = useState([]);
    const [filteredReferrals, setFilteredReferrals] = useState([]);
    const [filters, setFilters] = useState([{ id: 'all', label: 'All', selected: false }, { id: 'more', label: 'More Filters', selected: false }]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [filterToShow, setFilterToShow] = useState({
        line1: [],
        line2: [],
    });
    const [otherSelectedFilters, setOtherSelectedFilters] = useState([]);

    const { places, setSelectedPlace, setShowPlaceFullCard } = MapsController();
    const { isSearchFilterVisible, setIsSearchFilterVisible } = SearchFilterController();

    // Show status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setSelectedPlace(null);
            setShowPlaceFullCard(false);
            getReferredPlaces()
            return () => { };
        }, [])
    );

    const handleFilterCallback = (filters) => {
        setOtherSelectedFilters([])
        filters.map(filter => {
            if (!filterToShow.line1.find(item => filter.id == item.id) && !filterToShow.line2.find(item => filter.id == item.id)) {
                setOtherSelectedFilters(prev => [...prev, filter.id])
            }

        })
        setSelectedFilters(filters)
    }

    // Function to handle filter selection
    const handleFilterPress = (filterId) => {
        if (filterId == 'more') {
            setIsSearchFilterVisible({
                isSearchFilterVisible: true,
                filterHeight: Dimensions.get('window').height * 0.7,
                showSearchBar: false,
                initialFilters: selectedFilters,
                handleFilterCallback: handleFilterCallback
            });
            return;
        }
        if (filterId == 'all') {
            // select only all key and unselected all the other keys
            setOtherSelectedFilters([])
            setFilters(prevFilters =>
                prevFilters.map(filter =>
                    filter.id == filterId
                        ? { ...filter, selected: true }
                        : { ...filter, selected: false }
                )
            )
            return;
        }

        setFilters(prevFilters =>
            prevFilters.map(filter =>
                filter.id == filterId
                    ? { ...filter, selected: !filter.selected }
                    : filter.id == 'all'
                        ? { ...filter, selected: false }
                        : filter
            )
        )
        return;
    };

    // Render individual filter chip
    const renderFilterChip = (chip, count = null) => {
        return (
            <View style={styles.filterChipContainer} >
                <TouchableOpacity
                    style={[
                        styles.filterOption,
                        (chip.selected || count > 0) && styles.filterOptionSelected
                    ]}
                    onPress={() => handleFilterPress(chip.id)}
                    activeOpacity={1}
                >
                    {
                        chip.id != 'all' && (
                            <View style={[
                                styles.filterOptionIcon,
                                chip.selected && styles.filterOptionSelectedIcon
                            ]}>
                                {
                                    chip.id === 'more' ? (
                                        <IconAsset.moreIcon width={18} height={18} fill={theme.colors.text.primary} />
                                    ) : (
                                        chip.selected ? (
                                            <IconAsset.checkIcon width={18} height={18} fill={theme.colors.background.white} />
                                        ) : (
                                            <IconAsset.plusIcon width={18} height={18} fill={theme.colors.text.primary} />
                                        ))
                                }
                            </View>
                        )}
                    <Text style={[
                        styles.filterOptionText,
                        chip.selected && styles.filterOptionTextSelected,
                    ]}>
                        {chip.label}
                        {count > 0 && <Text style={styles.filterOptionTextCount}> ({count})</Text>}
                    </Text>
                </TouchableOpacity>
            </View>

        );
    };

    const renderReferralCard = (referral) => {
        // date format 03/25/2021
        let validUntil = new Date(referral.validUntil)
        let validUntilDate = validUntil.getDate()
        let validUntilMonth = validUntil.getMonth()
        let validUntilYear = validUntil.getFullYear()
        let validUntilDateString = `${validUntilMonth}/${validUntilDate}/${validUntilYear}`

        return (
            <>
                <TouchableOpacity
                    key={referral.id}
                    style={[styles.referralCard, { filter: referral.status == 'past' ? 'grayscale(100%) brightness(120%) contrast(70%)' : 'none' }]}
                    activeOpacity={1}
                    onPress={() => {
                        setSelectedPlace(referral);
                        setShowPlaceFullCard(true);
                    }}

                >
                    <View style={styles.referralCardHeader}>
                        <View style={styles.referralCardImage}>
                            <AppImage
                                source={referral.imageFull}
                                placeholderSource={referral.image}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: theme.borderRadius.sm,
                                }}
                            />
                        </View>
                        <View style={styles.referralCardInfo}>
                            <View style={styles.referralCardTags}>
                                {referral.tags.map((tag, index) => (
                                    <View key={tag.id} style={[styles.referralCardTag, { backgroundColor: styles[tag.style].backgroundColor }]}>
                                        <Text style={[styles.referralCardTagText, { color: styles[tag.style].color }]}>{tag.title}</Text>
                                    </View>
                                ))}
                            </View>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.referralCardTitle}>{referral.name}</Text>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.referralCardValidText}>{referral.address}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    };

    const getReferredPlaces = async () => {
        const referredPlaces = await FirebaseStoreService.getReferredPlaces()
        setReferrals(referredPlaces)
        setFilteredReferrals(referredPlaces)

    }

    React.useEffect(() => {
        getReferredPlaces()
    }, [places])

    React.useEffect(() => {
        setFilterToShow({
            line1: filters.slice(0, Math.ceil(filters.length / 2)),
            line2: filters.slice(Math.ceil(filters.length / 2)),
        });
        let updatedFilters = [...filters,]
        setSelectedFilters(updatedFilters.filter(filter => filter.selected).map(filter => filter.id))
    }, [filters])

    React.useEffect(() => {
        if (selectedFilters.length == 0 || selectedFilters.includes('all')) {
            setFilteredReferrals(referrals)
            return;
        }
        setFilteredReferrals(referrals.filter(referral => selectedFilters.includes(referral.category) || selectedFilters.includes('all')))
    }, [selectedFilters])

    React.useEffect(() => {
        // get 2 filters from all categories of Constants.filters
        const filtersData = Constants.filters.map(filter => {
            return filter.options.slice(0, 3).map(option => {
                return {
                    id: option.id,
                    label: option.label,
                    selected: false
                }
            })
        }).flat()
        setFilters([{ id: 'all', label: 'All', selected: false }, ...filtersData, { id: 'more', label: 'More Filters', selected: false }])

    }, [])

    return (
        <SafeAreaView style={styles.container}>

            <ScreenHeader
                style={{
                    paddingHorizontal: theme.spacing.lg,
                }}
                titleStyle={{
                    fontWeight: theme.fontWeight.bold,
                }}
                title="Referrals"
                showBackButton={false}
            />

            <View style={styles.innerContainer}>

                {/* Tab Navigation */}
                <View style={styles.filterContainer}>
                    {/* Staggered horizontal list with 2 rows */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={[styles.filterListContainer, { paddingHorizontal: theme.spacing.lg }]}
                    >
                        <View style={{ flexDirection: 'column', gap: theme.spacing.sm }}>
                            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>

                                {filterToShow.line1.map((item, index) => (
                                    <View key={item.id} style={[
                                        styles.filterColumn,
                                    ]}>
                                        {renderFilterChip(item)}
                                    </View>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                                {filterToShow.line2.map((item, index) => {
                                    let count = null;
                                    if (item.id == 'more') {
                                        count = otherSelectedFilters.length;
                                    }
                                    return (
                                        <View key={item.id} style={[
                                            styles.filterColumn,
                                        ]}>
                                            {renderFilterChip(item, count)}
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Content */}
                <View style={styles.referralsContainer}>
                    {filteredReferrals.length === 0 ? (
                        <NoDataAnimation
                            message="No referrals available"
                            subtitle="Try adjusting your filters or check back later"
                            icon={IconAsset.emptyStateIcon}
                            size="large"
                        />
                    ) : (
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={filteredReferrals}
                            renderItem={({ item }) => renderReferralCard(item)}
                            keyExtractor={(item) => item.id}
                            decelerationRate="fast"
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    innerContainer: {
        flex: 1,
        paddingBottom: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    referralsContainer: {
        marginBottom: theme.spacing.xl,
    },
    referralCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        marginHorizontal: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.custom({
            color: theme.colors.neutral[500],
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 0.4,
        }),
    },
    referralCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
    },
    referralCardImage: {
        width: theme.responsive.size(90),
        height: theme.responsive.size(90),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    referralCardInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    referralCardTitle: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    referralCardValidText: {
        ...theme.typography.custom({
            fontSize: theme.fontSize.caption.medium,
        }),
        color: theme.colors.text.secondary,
    },
    referralCardTags: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    referralCardTag: {
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        ...theme.shadows.custom({
            color: theme.colors.neutral[500],
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 1,
        }),
    },
    referralCardTagText: {
        fontSize: theme.responsive.size(12),
        color: theme.colors.text.white,
        fontWeight: theme.fontWeight.semiBold,
        textTransform: 'capitalize',
    },
    tagStyle1: {
        backgroundColor: theme.colors.background.tagStyle1,
        color: theme.colors.text.tagStyle1,
    },
    tagStyle2: {
        backgroundColor: theme.colors.background.tagStyle2,
        color: theme.colors.text.tagStyle2,
    },
    tagStyle3: {
        backgroundColor: theme.colors.background.tagStyle3,
        color: theme.colors.text.tagStyle3,
    },
    filterContainer: {
        marginBottom: theme.spacing.lg,
    },
    filterListContainer: {
        paddingHorizontal: theme.spacing.sm,
    },
    filterColumn: {
        flexDirection: 'column',
        gap: theme.spacing.sm,
        alignItems: 'flex-start',
    },
    filterChipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.custom({
            color: theme.colors.neutral[500],
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 0.5,
        }),
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.background.white,
        borderWidth: 0.5,
        borderColor: theme.colors.border.white,
        margin: theme.spacing.xxs,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: theme.colors.border.white,
        borderRadius: theme.borderRadius.full,
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    filterOptionSelected: {
        backgroundColor: theme.colors.background.searchFilter,
        borderColor: theme.colors.background.searchFilter,
    },
    filterOptionText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        paddingHorizontal: 8,
    },
    filterOptionTextSelected: {
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.medium,
    },
    filterOptionTextCount: {
        ...theme.typography.buttonSmall,
        color: theme.colors.primary[500],
        fontWeight: theme.fontWeight.bold,
    },
    filterOptionIcon: {
        width: 24,
        height: 24,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterOptionSelectedIcon: {
        backgroundColor: theme.colors.tertiary[500],
    },
});

export default ReferralsScreen; 