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
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import ImageAsset from '../../../assets/images/ImageAsset';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import MapsController from '../../../controllers/maps/MapsController';
import Button from '../../../components/ui/Button';
import WebView from 'react-native-webview';
import HtmlWrapper from '../../../constants/data/HtmlWrapper';
import RNRenderHtml from 'react-native-render-html';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import RewardController from '../../../controllers/rewards/RewardController';
import Clipboard from '@react-native-clipboard/clipboard';
import ToastUtils from '../../../utils/ToastUtils';

const { width } = Dimensions.get('window');

const RewardDetailScreen = () => {
    const navigation = useNavigation();
    const { selectedReward: reward, rewards, setRewards } = RewardController();

    const [isRedeemed, setIsRedeemed] = useState(reward.isRedeemed);
    const [isExpired, setIsExpired] = useState(reward.status == 'past' && !reward.isRedeemed);
    const tagsStyles = {
        p: {
            fontSize: theme.responsive.size(16),
        },
        h1: {
            fontSize: theme.responsive.size(24),
        },
        h2: {
            fontSize: theme.responsive.size(20),
        },
        ol: {
            fontSize: theme.responsive.size(16),
            marginBottom: theme.spacing.sm,
            marginTop: theme.spacing.sm,
        },
        ul: {
            marginBottom: theme.spacing.sm,
            marginTop: theme.spacing.md,
            listStyleType: 'square',
            paddingLeft: theme.responsive.size(20),
            fontSize: theme.responsive.size(16),
        },
        li: {
            marginBottom: theme.spacing.sm,
            fontSize: theme.responsive.size(16),
            paddingLeft: theme.responsive.size(10),
        },
    };

    const rewardButtonPress = () => {
        if (isRedeemed) {
            ToastUtils.info('Reward already redeemed');
            return;
        }
        if (isExpired) {
            ToastUtils.error('Reward expired');
            return;
        }
        FirebaseStoreService.storeRewardRedeemed(reward.id);
        setIsRedeemed(true);
        setRewards(rewards.map(reward => reward.id === reward.id ? { ...reward, isRedeemed: true } : reward));
    }

    const getRewardRedeemedStatus = () => {
        FirebaseStoreService.isRewardRedeemed(reward.id).then((isRedeemed) => {
            console.log('isRedeemed', isRedeemed);
            setIsRedeemed(isRedeemed);
        });
    }

    React.useEffect(() => {
        getRewardRedeemedStatus();
    }, []);

    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }}>
            <ScreenHeader
                style={{
                    paddingHorizontal: theme.spacing.lg,
                }}
                titleStyle={{
                    fontWeight: theme.fontWeight.bold,
                }}
                title="Reward Details"
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.innerContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.rewardsContainer}>
                        <View style={styles.rewardCard}>
                            <View style={styles.rewardCardHeader}>
                                <View style={styles.rewardCardImage}>
                                    <AppImage source={reward.image} />
                                </View>
                                <View style={styles.rewardCardInfo}>
                                    <View style={styles.rewardCardBadge}>
                                        <Text style={styles.rewardCardPointsBadgeText}>{reward.type}</Text>
                                    </View>
                                    <Text style={styles.rewardCardTitle}>{reward.title}</Text>
                                    <Text style={styles.rewardCardValidText}>{`Valid until ${reward.validUntilDateString}`}</Text>
                                    {!isRedeemed || reward.status == 'active' && <View style={styles.rewardCardBadgeAvailable}>
                                        <Text style={styles.rewardCardPointsBadgeTextAvailable}>{'Available'}</Text>
                                    </View>}
                                    <Button style={isRedeemed ? styles.rewardCardRedeemedButton : isExpired ? styles.rewardCardRedeemedButtonExpired : styles.rewardCardRedeemButton} textStyle={styles.rewardCardRedeemButtonText} title={isRedeemed ? 'Redeemed' : isExpired ? 'Expired' : 'Redeem Now'} onPress={rewardButtonPress} />
                                    {isRedeemed && <Text onPress={() => Clipboard.setString(reward.redeemCode)} style={styles.rewardCardRedeemedText}>{reward.redeemCode}</Text>}
                                    <View style={styles.howToUseContainer}>
                                        <Text style={styles.howToUseTitle}>{reward.howToUse.title}</Text>
                                        <RNRenderHtml
                                            tagsStyles={tagsStyles}
                                            contentWidth={width}
                                            source={{ html: HtmlWrapper.renderContent(reward.howToUse.content) }}
                                        />
                                    </View>
                                </View>
                            </View>
                        </View>

                    </View>
                </ScrollView>
            </View>
        </ScreenContainer >
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
        paddingHorizontal: theme.spacing.lg,
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
        flex: 1,
        marginBottom: theme.spacing.xl,
    },
    rewardCard: {
        flex: 1,
    },
    rewardCardHeader: {
        flex: 1,
    },
    rewardCardImage: {
        width: '100%',
        height: theme.responsive.size(200),
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    rewardCardInfo: {
        marginTop: theme.spacing.lg,
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.sm,
    },
    rewardCardTitle: {
        ...theme.typography.h2,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
    },
    rewardCardValidText: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
    },
    rewardCardBadge: {
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
    },
    rewardCardPointsBadgeText: {
        ...theme.typography.buttonMedium,
        color: theme.colors.primary[700],
        fontWeight: theme.fontWeight.semiBold,
    },
    rewardCardPointsBadgeTextAvailable: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.bold,
    },
    rewardCardBadgeAvailable: {
        backgroundColor: theme.colors.success[100],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
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
        width: '98%',
        alignSelf: 'center',
        marginTop: theme.spacing.xs,
    },
    rewardCardRedeemedButton: {
        width: '98%',
        alignSelf: 'center',
        marginTop: theme.spacing.xs,
        backgroundColor: theme.colors.neutral[300],
    },
    rewardCardRedeemedButtonExpired: {
        width: '98%',
        alignSelf: 'center',
        marginTop: theme.spacing.xs,
        backgroundColor: theme.colors.error[300],
    },
    rewardCardRedeemButtonText: {
        ...theme.typography.bodyLarge,
        fontSize: theme.responsive.size(22),
        color: theme.colors.background.primary,
        fontWeight: theme.fontWeight.semiBold,
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
    howToUseContainer: {
        flex: 1,
        width: '100%',
        marginTop: theme.spacing.md,
    },
    howToUseTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.lg,
        fontWeight: theme.fontWeight.bold,
    },
    howToUseDescription: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    rewardCardRedeemedText: {
        width: '98%',
        alignSelf: 'center',
        textAlign: 'center',
        ...theme.typography.h3,
        color: theme.colors.primary[500],
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.primary[500],
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.sm,
        borderStyle: 'dashed',
    },
});

export default RewardDetailScreen; 