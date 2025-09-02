import { useState } from 'react';
import ShareUtils from '../utils/ShareUtils';

export const useSharing = () => {
    const [isSharing, setIsSharing] = useState(false);

    const shareProfile = async (userProfile, userPersonalInfo) => {
        try {
            setIsSharing(true);
            const userName = userPersonalInfo?.firstName && userPersonalInfo?.lastName
                ? `${userPersonalInfo.firstName} ${userPersonalInfo.lastName}`
                : 'User';

            await ShareUtils.shareProfile({
                userName,
                totalPoints: userProfile?.totalPoints || 0,
                level: userProfile?.level || 1,
                referrals: userProfile?.referrals || 0,
                appName: 'ReferralRating'
            });
            return { success: true };
        } catch (error) {
            console.error('Error sharing profile:', error);
            return { success: false, error };
        } finally {
            setIsSharing(false);
        }
    };

    const shareApp = async (options = {}) => {
        const { title = 'Check out ReferralRating!', message = 'I found this amazing app called ReferralRating that helps you discover and rate amazing places!' } = options;
        try {
            setIsSharing(true);
            await ShareUtils.shareApp({
                title,
                message,
                appName: 'ReferralRating'
            });
            return { success: true };
        } catch (error) {
            console.error('Error sharing app:', error);
            return { success: false, error };
        } finally {
            setIsSharing(false);
        }
    };

    const shareReferral = async (referralData) => {
        try {
            setIsSharing(true);
            await ShareUtils.shareReferral({
                title: referralData.title || 'Amazing Place',
                description: referralData.description || 'Check out this incredible place!',
                address: referralData.address || '',
                imageUrl: referralData.imageUrl,
                appName: 'ReferralRating'
            });
            return { success: true };
        } catch (error) {
            console.error('Error sharing referral:', error);
            return { success: false, error };
        } finally {
            setIsSharing(false);
        }
    };

    const shareCustomMessage = async (message, title = 'Share ReferralRating') => {
        try {
            setIsSharing(true);
            await ShareUtils.shareText({
                title,
                message,
                subject: title
            });
            return { success: true };
        } catch (error) {
            console.error('Error sharing custom message:', error);
            return { success: false, error };
        } finally {
            setIsSharing(false);
        }
    };

    return {
        isSharing,
        shareProfile,
        shareApp,
        shareReferral,
        shareCustomMessage,
    };
};

