import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Dimensions,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';

const { width } = Dimensions.get('window');

const RewardsScreen = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState('available');

    const userStats = {
        totalPoints: 1250,
        level: 'Gold',
        nextLevel: 'Platinum',
        pointsToNextLevel: 250,
    };

    const availableRewards = [
        {
            id: '1',
            title: 'Free Coffee',
            description: 'Redeem at any participating coffee shop',
            points: 100,
            image: '☕',
            validUntil: '2024-12-31',
        },
        {
            id: '2',
            title: 'Movie Ticket',
            description: '50% off on any movie ticket',
            points: 200,
            image: '🎬',
            validUntil: '2024-12-31',
        },
        {
            id: '3',
            title: 'Shopping Discount',
            description: '20% off on your next purchase',
            points: 150,
            image: '🛍️',
            validUntil: '2024-12-31',
        },
    ];

    const redeemedRewards = [
        {
            id: '1',
            title: 'Free Coffee',
            redeemedDate: '2024-01-15',
            expiryDate: '2024-02-15',
            status: 'active',
        },
        {
            id: '2',
            title: 'Movie Ticket',
            redeemedDate: '2024-01-10',
            expiryDate: '2024-02-10',
            status: 'expired',
        },
    ];

    const achievements = [
        {
            id: '1',
            title: 'First Purchase',
            description: 'Complete your first purchase',
            icon: '🎯',
            completed: true,
            points: 50,
        },
        {
            id: '2',
            title: 'Loyal Customer',
            description: 'Make 10 purchases',
            icon: '👑',
            completed: true,
            points: 100,
        },
        {
            id: '3',
            title: 'Social Butterfly',
            description: 'Share with 5 friends',
            icon: '🦋',
            completed: false,
            points: 75,
        },
    ];

    const renderPointsCard = () => (
        <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
                <Text style={styles.pointsTitle}>Your Points</Text>
                <Text style={styles.pointsValue}>{userStats.totalPoints}</Text>
            </View>

            <View style={styles.levelContainer}>
                <Text style={styles.levelText}>Level: {userStats.level}</Text>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${((userStats.totalPoints % 1000) / 1000) * 100}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {userStats.pointsToNextLevel} points to {userStats.nextLevel}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderRewardCard = (reward) => (
        <TouchableOpacity
            key={reward.id}
            style={styles.rewardCard}
            activeOpacity={0.8}
        >
            <View style={styles.rewardHeader}>
                <Text style={styles.rewardIcon}>{reward.image}</Text>
                <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.title}</Text>
                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                </View>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>{reward.points}</Text>
                </View>
            </View>

            <View style={styles.rewardFooter}>
                <Text style={styles.validUntilText}>
                    Valid until: {reward.validUntil}
                </Text>
                <TouchableOpacity style={styles.redeemButton}>
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const renderRedeemedCard = (reward) => (
        <View
            key={reward.id}
            style={[
                styles.redeemedCard,
                reward.status === 'expired' && styles.expiredCard,
            ]}
        >
            <View style={styles.redeemedHeader}>
                <Text style={styles.redeemedTitle}>{reward.title}</Text>
                <View style={[
                    styles.statusBadge,
                    reward.status === 'expired' ? styles.expiredBadge : styles.activeBadge,
                ]}>
                    <Text style={styles.statusBadgeText}>
                        {reward.status === 'expired' ? 'Expired' : 'Active'}
                    </Text>
                </View>
            </View>

            <View style={styles.redeemedDetails}>
                <Text style={styles.redeemedDate}>
                    Redeemed: {reward.redeemedDate}
                </Text>
                <Text style={styles.expiryDate}>
                    Expires: {reward.expiryDate}
                </Text>
            </View>
        </View>
    );

    const renderAchievementCard = (achievement) => (
        <View
            key={achievement.id}
            style={[
                styles.achievementCard,
                achievement.completed && styles.completedAchievement,
            ]}
        >
            <View style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>
                        {achievement.description}
                    </Text>
                </View>
                <View style={styles.achievementPoints}>
                    <Text style={styles.achievementPointsText}>+{achievement.points}</Text>
                </View>
            </View>

            {achievement.completed && (
                <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Completed</Text>
                </View>
            )}
        </View>
    );

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.xxxl,
                paddingBottom: theme.spacing.md,
            }}>
            <Text>Rewards Screen</Text>
        </ScreenContainer>
    )

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background.primary}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Rewards</Text>
                <TouchableOpacity style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Points Card */}
                {renderPointsCard()}

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'available' && styles.activeTabButton,
                        ]}
                        onPress={() => setSelectedTab('available')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'available' && styles.activeTabButtonText,
                        ]}>
                            Available ({availableRewards.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            selectedTab === 'redeemed' && styles.activeTabButton,
                        ]}
                        onPress={() => setSelectedTab('redeemed')}
                    >
                        <Text style={[
                            styles.tabButtonText,
                            selectedTab === 'redeemed' && styles.activeTabButtonText,
                        ]}>
                            Redeemed ({redeemedRewards.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {selectedTab === 'available' && (
                    <View style={styles.content}>
                        {availableRewards.map(renderRewardCard)}
                    </View>
                )}

                {selectedTab === 'redeemed' && (
                    <View style={styles.content}>
                        {redeemedRewards.map(renderRedeemedCard)}
                    </View>
                )}

                {/* Achievements Section */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    {achievements.map(renderAchievementCard)}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.md,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    historyButton: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
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
        ...theme.shadows.ios.medium,
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
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    tabButton: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.borderRadius.sm,
    },
    activeTabButton: {
        backgroundColor: theme.colors.background.primary,
        ...theme.shadows.ios.small,
    },
    tabButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.secondary,
    },
    activeTabButtonText: {
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.semiBold,
    },
    content: {
        marginBottom: theme.spacing.xl,
    },
    rewardCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    rewardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    rewardIcon: {
        fontSize: 32,
        marginRight: theme.spacing.md,
    },
    rewardInfo: {
        flex: 1,
    },
    rewardTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    rewardDescription: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    pointsBadge: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.round,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    pointsBadgeText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.primary[700],
        fontWeight: theme.fontWeight.semiBold,
    },
    rewardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    validUntilText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
    },
    redeemButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    redeemButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.background.primary,
    },
    redeemedCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    expiredCard: {
        opacity: 0.6,
    },
    redeemedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    redeemedTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.round,
    },
    activeBadge: {
        backgroundColor: theme.colors.success[100],
    },
    expiredBadge: {
        backgroundColor: theme.colors.error[100],
    },
    statusBadgeText: {
        ...theme.typography.captionSmall,
        fontWeight: theme.fontWeight.semiBold,
    },
    redeemedDetails: {
        marginTop: theme.spacing.sm,
    },
    redeemedDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    expiryDate: {
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