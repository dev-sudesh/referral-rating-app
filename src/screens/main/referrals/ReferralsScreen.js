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
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';

const { width, height } = Dimensions.get('window');

const ReferralsScreen = ({ navigation }) => {
    const [referralCode, setReferralCode] = useState('RNFRIEND2024');
    const [totalReferrals, setTotalReferrals] = useState(8);
    const [totalEarnings, setTotalEarnings] = useState(240);

    const referralHistory = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            date: '2024-01-15',
            status: 'completed',
            earnings: 30,
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            date: '2024-01-12',
            status: 'pending',
            earnings: 30,
        },
        {
            id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            date: '2024-01-10',
            status: 'completed',
            earnings: 30,
        },
    ];

    const referralRewards = [
        {
            id: '1',
            title: 'First Referral',
            description: 'Get $10 when your friend makes their first purchase',
            icon: '🎉',
            completed: true,
        },
        {
            id: '2',
            title: '5 Referrals',
            description: 'Earn $50 bonus when you reach 5 successful referrals',
            icon: '🏆',
            completed: false,
        },
        {
            id: '3',
            title: '10 Referrals',
            description: 'Unlock VIP status and exclusive rewards',
            icon: '👑',
            completed: false,
        },
    ];

    const handleShareReferral = async () => {
        try {
            const shareMessage = `Hey! I'm using RNFramework and I think you'd love it too. Use my referral code ${referralCode} to get $10 off your first purchase! Download the app here: https://rnframework.app`;

            await Share.share({
                message: shareMessage,
                title: 'Join RNFramework with my referral code!',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share referral code');
        }
    };

    const handleCopyCode = () => {
        // In a real app, you would use Clipboard API
        Alert.alert('Copied!', 'Referral code copied to clipboard');
    };

    const renderReferralStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{totalReferrals}</Text>
                <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>${totalEarnings}</Text>
                <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>$30</Text>
                <Text style={styles.statLabel}>Per Referral</Text>
            </View>
        </View>
    );

    const renderReferralCode = () => (
        <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
            <View style={styles.codeContainer}>
                <Text style={styles.referralCode}>{referralCode}</Text>
                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyCode}
                >
                    <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareReferral}
                activeOpacity={0.8}
            >
                <Text style={styles.shareButtonText}>Share Referral Code</Text>
            </TouchableOpacity>
        </View>
    );

    const renderReferralHistory = () => (
        <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Referral History</Text>
            {referralHistory.map((referral) => (
                <View key={referral.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                        <View style={styles.historyInfo}>
                            <Text style={styles.historyName}>{referral.name}</Text>
                            <Text style={styles.historyEmail}>{referral.email}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            referral.status === 'completed' ? styles.completedBadge : styles.pendingBadge,
                        ]}>
                            <Text style={styles.statusText}>
                                {referral.status === 'completed' ? 'Completed' : 'Pending'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.historyFooter}>
                        <Text style={styles.historyDate}>{referral.date}</Text>
                        <Text style={styles.historyEarnings}>+${referral.earnings}</Text>
                    </View>
                </View>
            ))}
        </View>
    );

    const renderRewards = () => (
        <View style={styles.rewardsContainer}>
            <Text style={styles.sectionTitle}>Referral Rewards</Text>
            {referralRewards.map((reward) => (
                <View
                    key={reward.id}
                    style={[
                        styles.rewardCard,
                        reward.completed && styles.completedReward,
                    ]}
                >
                    <View style={styles.rewardHeader}>
                        <Text style={styles.rewardIcon}>{reward.icon}</Text>
                        <View style={styles.rewardInfo}>
                            <Text style={styles.rewardTitle}>{reward.title}</Text>
                            <Text style={styles.rewardDescription}>{reward.description}</Text>
                        </View>
                        {reward.completed && (
                            <View style={styles.completedCheck}>
                                <Text style={styles.completedCheckText}>✓</Text>
                            </View>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.xxxl,
                paddingBottom: theme.spacing.md,
            }}>
            <Text>Referrals Screen</Text>
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
                <Text style={styles.headerTitle}>Referrals</Text>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>?</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Stats */}
                {renderReferralStats()}

                {/* Referral Code */}
                {renderReferralCode()}

                {/* Referral History */}
                {renderReferralHistory()}

                {/* Rewards */}
                {renderRewards()}

                {/* How it Works */}
                <View style={styles.howItWorksContainer}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.stepContainer}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Share Your Code</Text>
                            <Text style={styles.stepDescription}>
                                Share your unique referral code with friends and family
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepContainer}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>They Sign Up</Text>
                            <Text style={styles.stepDescription}>
                                Your friend uses your code when they create their account
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepContainer}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Both Get Rewarded</Text>
                            <Text style={styles.stepDescription}>
                                You both get $10 when they make their first purchase
                            </Text>
                        </View>
                    </View>
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
    helpButton: {
        width: 32,
        height: 32,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpButtonText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.semiBold,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    statValue: {
        ...theme.typography.h3,
        color: theme.colors.primary[500],
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    referralCodeContainer: {
        backgroundColor: theme.colors.primary[50],
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.primary[200],
    },
    referralCodeTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    referralCode: {
        flex: 1,
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        textAlign: 'center',
        fontFamily: theme.fontFamily.mono.medium,
    },
    copyButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    copyButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.background.primary,
    },
    shareButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.ios.small,
    },
    shareButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    historyContainer: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    historyCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    historyInfo: {
        flex: 1,
    },
    historyName: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    historyEmail: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.round,
    },
    completedBadge: {
        backgroundColor: theme.colors.success[100],
    },
    pendingBadge: {
        backgroundColor: theme.colors.warning[100],
    },
    statusText: {
        ...theme.typography.captionSmall,
        fontWeight: theme.fontWeight.semiBold,
    },
    historyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyDate: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    historyEarnings: {
        ...theme.typography.bodyMedium,
        color: theme.colors.success[600],
        fontWeight: theme.fontWeight.semiBold,
    },
    rewardsContainer: {
        marginBottom: theme.spacing.xl,
    },
    rewardCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    completedReward: {
        borderColor: theme.colors.success[200],
        backgroundColor: theme.colors.success[50],
    },
    rewardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardIcon: {
        fontSize: 24,
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
    completedCheck: {
        backgroundColor: theme.colors.success[500],
        borderRadius: theme.borderRadius.round,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedCheckText: {
        color: theme.colors.background.primary,
        fontSize: 12,
        fontWeight: theme.fontWeight.bold,
    },
    howItWorksContainer: {
        marginBottom: theme.spacing.xl,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.lg,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
        marginTop: 2,
    },
    stepNumberText: {
        ...theme.typography.buttonMedium,
        color: theme.colors.background.primary,
        fontWeight: theme.fontWeight.semiBold,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    stepDescription: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        lineHeight: 20,
    },
});

export default ReferralsScreen; 