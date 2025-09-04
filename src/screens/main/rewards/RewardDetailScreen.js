import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import AppImage from '../../../components/common/AppImage';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import Button from '../../../components/ui/Button';
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
    innerContainer: {
        flex: 1,
        paddingBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.lg,
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