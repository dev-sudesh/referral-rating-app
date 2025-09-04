import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    FlatList,
} from 'react-native';
import { theme } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Constants from '../../../constants/data';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import RewardController from '../../../controllers/rewards/RewardController';

const { width } = Dimensions.get('window');

const RewardsScreen = ({ navigation }) => {
    const [selectedTab, setSelectedTab] = useState('active');
    const { rewards, setRewards, selectedReward, setSelectedReward } = RewardController();
    const [filteredRewards, setFilteredRewards] = useState(rewards?.filter(item => item.status == 'active'))

    const selectedRewardPress = async (reward) => {
        let selectedReward = reward;
        selectedReward.isRedeemed = await getRewardRedeemedStatus(reward);
        console.log('selectedReward', selectedReward)
        setSelectedReward(selectedReward)
        navigation.navigate(Constants.Screen.RewardDetail)
    }
    const renderRewardCard = (reward) => {

        return (
            <>
                <TouchableOpacity
                    key={reward.id}
                    style={[styles.rewardCard, { filter: reward.status == 'past' ? 'grayscale(100%) brightness(120%) contrast(70%)' : 'none' }]}
                    activeOpacity={1}
                    onPress={() => selectedRewardPress(reward)}

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
                            <Text style={styles.rewardCardValidText}>{`Valid until ${reward.validUntilDateString}`}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </>
        )
    };

    const getRewardRedeemedStatus = async (reward) => {
        return await FirebaseStoreService.isRewardRedeemed(reward.id)
    }

    const getRewards = React.useCallback(async () => {
        const rewards = await FirebaseStoreService.getRewards(selectedTab)
        rewards.forEach(async (reward) => {
            reward.validUntil = new Date(reward.validUntil)
            reward.validUntilDate = reward.validUntil.getDate()
            reward.validUntilMonth = reward.validUntil.getMonth()
            reward.validUntilYear = reward.validUntil.getFullYear()
            reward.validUntilDateString = `${reward.validUntilMonth}/${reward.validUntilDate}/${reward.validUntilYear}`
            reward.isRedeemed = await getRewardRedeemedStatus(reward)
            return reward
        })
        setRewards(rewards)
        setFilteredRewards(rewards)
    }, [selectedTab])

    React.useEffect(() => {
        getRewards()
    }, [selectedTab])

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader
                style={{
                    paddingHorizontal: theme.spacing.lg,
                }}
                titleStyle={{
                    fontWeight: theme.fontWeight.bold,
                }}
                title="Rewards"
                showBackButton={false}
            />

            <View style={styles.innerContainer}>

                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        activeOpacity={1}
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
                        activeOpacity={1}
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background.light,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xs,
        marginHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.sm,
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
});

export default RewardsScreen; 