import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
    FlatList,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import ImageAsset from '../../../assets/images/ImageAsset';

const { width } = Dimensions.get('window');

const rewards = [
    {
        id: 'reward-001',
        type: 'Free Product',
        title: 'Free Coffee Beans',
        image: ImageAsset.places.place01,
        validUntil: '2021-03-25',
        status: 'active'
    },
    {
        id: 'reward-002',
        type: 'Free Product',
        title: 'Free in-store beverage',
        image: ImageAsset.places.place01,
        validUntil: '2021-03-25',
        status: 'active'
    },
    {
        id: 'reward-003',
        type: 'Discount',
        title: 'Birthday rewards',
        image: ImageAsset.places.place01,
        validUntil: '2024-03-31',
        status: 'active'
    },
    {
        id: 'reward-004',
        type: 'Discount',
        title: '10% discount',
        image: ImageAsset.places.place01,
        validUntil: '2024-03-31',
        status: 'active'
    },
    {
        id: 'reward-005',
        type: 'Free Product',
        title: 'Free Coffee Beans',
        image: ImageAsset.places.place01,
        validUntil: '2021-03-25',
        status: 'past'
    },
    {
        id: 'reward-006',
        type: 'Free Product',
        title: 'Free in-store beverage',
        image: ImageAsset.places.place01,
        validUntil: '2021-03-25',
        status: 'past'
    },
    {
        id: 'reward-007',
        type: 'Discount',
        title: 'Birthday rewards',
        image: ImageAsset.places.place01,
        validUntil: '2024-03-31',
        status: 'past'
    },
    {
        id: 'reward-008',
        type: 'Discount',
        title: '10% discount',
        image: ImageAsset.places.place01,
        validUntil: '2024-03-31',
        status: 'past'
    },
];
const RewardsScreen = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState('active');
    const [filteredRewards, setFilteredRewards] = useState(rewards.filter(item => item.status == 'active'))

    const userStats = {
        totalPoints: 1250,
        level: 'Gold',
        nextLevel: 'Platinum',
        pointsToNextLevel: 250,
    };


    const renderRewardCard = (reward) => {
        // date format 03/25/2021
        let validUntil = new Date(reward.validUntil)
        let validUntilDate = validUntil.getDate()
        let validUntilMonth = validUntil.getMonth()
        let validUntilYear = validUntil.getFullYear()
        let validUntilDateString = `${validUntilMonth}/${validUntilDate}/${validUntilYear}`

        return (
            <>
                <TouchableOpacity
                    key={reward.id}
                    style={[styles.rewardCard, { filter: reward.status == 'past' ? 'grayscale(100%) brightness(120%) contrast(70%)' : 'none' }]}
                    activeOpacity={0.8}
                    onPress={() => { }}

                >
                    <View style={styles.rewardCardHeader}>
                        <View style={styles.rewardCardImage}>
                            <AppImage
                                source={reward.image}

                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: theme.borderRadius.sm,
                                }}
                            />
                        </View>
                        <View style={styles.rewardCardInfo}>
                            <View style={styles.rewardCardBadge}>
                                <Text style={styles.rewardCardBadgeText}>{reward.type}</Text>
                            </View>
                            <Text style={styles.rewardCardTitle}>{reward.title}</Text>
                            <Text style={styles.rewardCardValidText}>{`Valid until ${validUntilDateString}`}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    };

    React.useEffect(() => {
        setFilteredRewards(rewards.filter(item => item.status == selectedTab))
    }, [selectedTab])

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Rewards</Text>
                </View>
            </View>

            <View style={styles.innerContainer}>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'active' && styles.activeTabButton,
                        ]}
                        onPress={() => setSelectedTab('active')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'active' && styles.activeTabButtonText,
                        ]}>
                            Active
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'past' && styles.activeTabButton,
                        ]}
                        onPress={() => setSelectedTab('past')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'past' && styles.activeTabButtonText,
                        ]}>
                            Past
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.rewardsContainer}>

                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={filteredRewards}
                        renderItem={({ item }) => renderRewardCard(item)}
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
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.lg,
    },
    tabButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.borderRadius.lg,
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
    rewardsContainer: {
        marginBottom: theme.spacing.xl,
    },
    rewardCard: {
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
    rewardCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
    },
    rewardCardImage: {
        width: theme.responsive.size(90),
        height: theme.responsive.size(90),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    rewardCardInfo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    rewardCardTitle: {
        ...theme.typography.h4,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    rewardCardValidText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    rewardCardBadge: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    rewardCardPointsBadgeText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.primary[700],
        fontWeight: theme.fontWeight.semiBold,
    },
    rewardCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rewardCardValidUntilText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
    },
    rewardCardRedeemButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    rewardCardRedeemButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.background.primary,
    },
    rewardCardRedeemedCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    rewardCardRedeemedCardExpired: {
        opacity: 0.6,
    },
    rewardCardRedeemedCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    rewardCardRedeemedCardTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
    },
    rewardCardRedeemedCardStatusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.round,
    },
    rewardCardRedeemedCardActiveBadge: {
        backgroundColor: theme.colors.success[100],
    },
    rewardCardRedeemedCardExpiredBadge: {
        backgroundColor: theme.colors.error[100],
    },
    rewardCardRedeemedCardStatusBadgeText: {
        ...theme.typography.captionSmall,
        fontWeight: theme.fontWeight.semiBold,
    },
    rewardCardRedeemedCardDetails: {
        marginTop: theme.spacing.sm,
    },
    rewardCardRedeemedCardDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    rewardCardRedeemedCardExpiryDate: {
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
});

export default RewardsScreen; 