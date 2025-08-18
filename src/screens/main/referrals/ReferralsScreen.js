import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    Share,
    Dimensions,
    FlatList,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAsset from '../../../assets/images/ImageAsset';
import AppImage from '../../../components/common/AppImage';
import IconAsset from '../../../assets/icons/IconAsset';

const { width, height } = Dimensions.get('window');

// Filter data for the staggered horizontal list
const filterData = [
    { id: '1', label: 'All (12)', selected: false },
    { id: '2', label: 'Food (2)', selected: true },
    { id: '3', label: 'Parking lots (5)', selected: false },
    { id: '4', label: 'Cinemas (5)', selected: true },
    { id: '5', label: 'Shopping (8)', selected: false },
    { id: '6', label: 'Museums (3)', selected: false },
    { id: '7', label: 'Restaurants (3)', selected: false },
    { id: '8', label: 'Bars (3)', selected: false },
    { id: '9', label: 'Clubs (3)', selected: false },
    { id: '10', label: 'Hotels (3)', selected: false },
    { id: '11', label: 'Shops (3)', selected: false },
    { id: '12', label: 'Other (3)', selected: false },
    { id: '13', label: 'Other (3)', selected: false },
    { id: '14', label: 'Other (3)', selected: false },
    { id: '15', label: 'Other (3)', selected: false },
    { id: '16', label: 'Other (3)', selected: false },
    { id: '17', label: 'Other (3)', selected: false },
    { id: '18', label: 'Other (3)', selected: false },
    { id: '19', label: 'Other (3)', selected: false },
];

// Helper: split array into chunks of given size
function chunkData(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

const referrals = [
    {
        id: 'referral-001',
        tags: [{
            id: 'referral-001-tag-001',
            title: 'No.1',
            style: 'tagStyle1',
        }, {
            id: 'referral-001-tag-002',
            title: 'Food',
            style: 'tagStyle2',
        }],
        title: 'Boucherie Union Square',
        image: ImageAsset.places.place01,
        address: '225 Park Ave, New York, NY 10177',
        validUntil: '2025-03-25',
        status: 'active'
    },
    {
        id: 'referral-002',
        tags: [{
            id: 'referral-002-tag-001',
            title: 'Cinema',
            style: 'tagStyle2',
        }],
        title: 'AMC Empire 25',
        image: ImageAsset.places.place01,
        address: '234 West 42nd St, New York, NY 10036',
        validUntil: '2025-03-25',
        status: 'active'
    },
    {
        id: 'referral-003',
        tags: [{
            id: 'referral-003-tag-001',
            title: 'Food',
            style: 'tagStyle2',
        }],
        title: 'Piccola Cucina Osteria',
        image: ImageAsset.places.place01,
        address: '225 Park Ave, New York, NY 10177',
        validUntil: '2025-03-25',
        status: 'active'
    },
    {
        id: 'referral-004',
        tags: [{
            id: 'referral-004-tag-001',
            title: 'No.3',
            style: 'tagStyle1',
        }, {
            id: 'referral-004-tag-002',
            title: 'Drinks',
            style: 'tagStyle2',
        }],
        title: 'Talk Story Rooftop',
        image: ImageAsset.places.place01,
        address: '160 N 12th Street Brooklyn',
        validUntil: '2024-03-31',
        status: 'active'
    },
    {
        id: 'referral-005',
        tags: [{
            id: 'referral-005-tag-001',
            title: 'Steak House',
            style: 'tagStyle2',
        }],
        title: 'Boucherie Union Square',
        image: ImageAsset.places.place01,
        address: '225 Park Ave, New York, NY 10177',
        validUntil: '2025-03-25',
        status: 'active'
    },
    {
        id: 'referral-006',
        tags: [{
            id: 'referral-006-tag-001',
            title: 'Steak House',
            style: 'tagStyle2',
        }],
        title: 'Boucherie Union Square',
        image: ImageAsset.places.place01,
        address: '225 Park Ave, New York, NY 10177',
        validUntil: '2025-03-25',
        status: 'active'
    },
    {
        id: 'referral-007',
        tags: [{
            id: 'referral-007-tag-001',
            title: 'Steak House',
            style: 'tagStyle2',
        }],
        title: 'Boucherie Union Square',
        image: ImageAsset.places.place01,
        address: '225 Park Ave, New York, NY 10177',
        validUntil: '2025-03-25',
        status: 'active'
    }
];

const ReferralsScreen = ({ navigation }) => {
    const [referralCode, setReferralCode] = useState('RNFRIEND2024');
    const [totalReferrals, setTotalReferrals] = useState(8);
    const [totalEarnings, setTotalEarnings] = useState(240);
    const [selectedFilter, setSelectedFilter] = useState('active');
    const [filteredReferrals, setFilteredReferrals] = useState([]);
    const [filters, setFilters] = useState(filterData);

    // Function to handle filter selection
    const handleFilterPress = (filterId) => {
        setFilters(prevFilters =>
            prevFilters.map(filter =>
                filter.id === filterId
                    ? { ...filter, selected: !filter.selected }
                    : filter
            )
        );
    };

    // Render individual filter chip
    const renderFilterChip = (chip) => {
        return (
            <TouchableOpacity
                style={[
                    styles.filterOption,
                    chip.selected && styles.filterOptionSelected
                ]}
                onPress={() => handleFilterPress(chip.id)}
                activeOpacity={0.7}
            >
                <View style={[
                    styles.filterOptionIcon,
                    chip.selected && styles.filterOptionSelectedIcon
                ]}>
                    {chip.selected ? (
                        <IconAsset.checkIcon width={18} height={18} fill={theme.colors.background.white} />
                    ) : (
                        <IconAsset.plusIcon width={18} height={18} fill={theme.colors.text.primary} />
                    )}
                </View>
                <Text style={[
                    styles.filterOptionText,
                    chip.selected && styles.filterOptionTextSelected
                ]}>
                    {chip.label}
                </Text>
            </TouchableOpacity>
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
                    activeOpacity={0.8}
                    onPress={() => { }}

                >
                    <View style={styles.referralCardHeader}>
                        <View style={styles.referralCardImage}>
                            <AppImage
                                source={referral.image}

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
                            <Text style={styles.referralCardTitle}>{referral.title}</Text>
                            <Text style={styles.referralCardValidText}>{`Valid until ${validUntilDateString}`}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    };

    React.useEffect(() => {
        setFilteredReferrals(referrals.filter(item => item.status == selectedFilter))
    }, [selectedFilter])

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Referrals</Text>
                </View>
            </View>

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
                                {filters.slice(0, Math.ceil(filters.length / 2)).map((item, index) => (
                                    <View key={item.id} style={[
                                        styles.filterColumn,
                                    ]}>
                                        {renderFilterChip(item)}
                                    </View>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                                {filters.slice(Math.ceil(filters.length / 2)).map((item, index) => (
                                    <View key={item.id} style={[
                                        styles.filterColumn,
                                    ]}>
                                        {renderFilterChip(item)}
                                    </View>
                                ))}</View>
                        </View>
                    </ScrollView>
                </View>

                {/* Content */}
                <View style={styles.referralsContainer}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={filteredReferrals}
                        renderItem={({ item }) => renderReferralCard(item)}
                        keyExtractor={(item) => item.id}
                        decelerationRate="fast"

                    />
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
    header: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        height: theme.responsive.headerHeight(),
    },
    headerTitleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.bold,
        textAlign: 'center',
    },
    historyButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: theme.responsive.size(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyButtonText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[500],
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    pointsCard: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        ...theme.shadows.medium,
    },
    pointsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    pointsTitle: {
        ...theme.typography.h4,
        color: theme.colors.background.primary,
    },
    pointsValue: {
        ...theme.typography.h1,
        color: theme.colors.background.primary,
    },
    levelContainer: {
        marginTop: theme.spacing.md,
    },
    levelText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.primary[100],
        marginBottom: theme.spacing.sm,
    },
    progressContainer: {
        marginTop: theme.spacing.sm,
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.primary[300],
        borderRadius: theme.borderRadius.round,
        marginBottom: theme.spacing.xs,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.round,
    },
    progressText: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary[100],
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background.light,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginVertical: theme.spacing.xl,
    },
    tabButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
    },
    activeTabButton: {
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing.md,
        ...theme.shadows.medium,
    },
    tabButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.secondary,
        fontSize: theme.responsive.size(14),
        paddingVertical: theme.spacing.xs,
    },
    activeTabButtonText: {
        color: theme.colors.text.accent,
        fontWeight: theme.fontWeight.bold,
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
        ...theme.typography.h4,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    referralCardValidText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    referralCardBadge: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    referralCardPointsBadgeText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.primary[700],
        fontWeight: theme.fontWeight.semiBold,
    },
    referralCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    referralCardValidUntilText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
    },
    referralCardRedeemButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    referralCardRedeemButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.background.primary,
    },
    referralCardRedeemedCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    referralCardRedeemedCardExpired: {
        opacity: 0.6,
    },
    referralCardRedeemedCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    referralCardRedeemedCardTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
    },
    referralCardRedeemedCardStatusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.round,
    },
    referralCardRedeemedCardActiveBadge: {
        backgroundColor: theme.colors.success[100],
    },
    referralCardRedeemedCardExpiredBadge: {
        backgroundColor: theme.colors.error[100],
    },
    referralCardRedeemedCardStatusBadgeText: {
        ...theme.typography.captionSmall,
        fontWeight: theme.fontWeight.semiBold,
    },
    referralCardRedeemedCardDetails: {
        marginTop: theme.spacing.sm,
    },
    referralCardRedeemedCardDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    referralCardRedeemedCardExpiryDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    achievementsSection: {
        marginTop: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    achievementCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    completedAchievement: {
        borderColor: theme.colors.success[200],
        backgroundColor: theme.colors.success[50],
    },
    achievementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    achievementIcon: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    achievementDescription: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    achievementPoints: {
        backgroundColor: theme.colors.warning[100],
        borderRadius: theme.borderRadius.round,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    achievementPointsText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.warning[700],
        fontWeight: theme.fontWeight.semiBold,
    },
    completedBadge: {
        backgroundColor: theme.colors.success[500],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        alignSelf: 'flex-start',
        marginTop: theme.spacing.sm,
    },
    completedBadgeText: {
        ...theme.typography.captionMedium,
        color: theme.colors.background.primary,
        fontWeight: theme.fontWeight.semiBold,
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
        fontWeight: theme.fontWeight.bold,

    },
    tagStyle1: {
        backgroundColor: theme.colors.background.tagStyle1,
        color: theme.colors.text.tagStyle1,
    },
    tagStyle2: {
        backgroundColor: theme.colors.background.tagStyle2,
        color: theme.colors.text.tagStyle2,
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
        alignItems: 'flex-start', // Align chips to the start
    },
    filterColumnStaggered: {
        marginTop: theme.spacing.md, // Creates staggered effect
    },
    filterChip: {
        backgroundColor: theme.colors.background.light,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        alignSelf: 'flex-start', // Allow chips to size based on content
        minWidth: theme.responsive.size(60), // Minimum width
    },
    filterChipSelected: {
        backgroundColor: theme.colors.primary[500],
        borderColor: theme.colors.primary[500],
    },
    filterChipText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.secondary,
    },
    filterChipTextSelected: {
        color: theme.colors.background.primary,
        fontWeight: theme.fontWeight.bold,
    },


    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.full,
        paddingVertical: 6,
        paddingHorizontal: 4,
        gap: theme.spacing.xs,
    },
    filterOptionSelected: {
        backgroundColor: theme.colors.background.searchFilter,
        borderColor: theme.colors.background.searchFilter,
    },
    filterOptionText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        paddingHorizontal: 4,
    },
    filterOptionTextSelected: {
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.medium,
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
        width: 24,
        height: 24,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.background.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterOptionSelectedIcon: {
        backgroundColor: theme.colors.tertiary[500],
    },
});

export default ReferralsScreen; 