import Share from 'react-native-share';
import { Platform } from 'react-native';

const getAppStoreUrl = () => {
    if (Platform.OS === 'ios') {
        return 'https://apps.apple.com/app/referralrating';
    } else if (Platform.OS === 'android') {
        return 'https://play.google.com/store/apps/details?id=com.referralrating';
    }
    return 'https://referralrating.com';
};

const ShareUtils = {
    /**
     * Share the app with friends
     * @param {Object} options - Sharing options
     * @param {string} options.title - Title for the share message
     * @param {string} options.message - Message to share
     * @param {string} options.url - URL to share (app store links)
     * @param {string} options.appName - Name of the app
     */
    async shareApp(options = {}) {
        const {
            title = 'Check out this amazing app!',
            message = 'I found this great app called ReferralRating that helps you discover and rate amazing places!',
            url,
            appName = 'ReferralRating'
        } = options;

        try {
            const finalUrl = url || getAppStoreUrl();
            const shareOptions = {
                title,
                message: `${message}\n\nDownload ${appName}:\n${finalUrl}`,
                url: finalUrl,
                subject: `Check out ${appName}!`,
                showAppsToView: true,
                showAppsToShare: true,
            };

            const result = await Share.open(shareOptions);
            return result;
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing app:', error);
                throw error;
            }
            return null;
        }
    },

    /**
     * Share a specific referral or place
     * @param {Object} options - Sharing options
     * @param {string} options.title - Title of the place/referral
     * @param {string} options.description - Description to share
     * @param {string} options.address - Address of the place
     * @param {string} options.imageUrl - Image URL to share
     * @param {string} options.imagePath - Local image file path to share
     * @param {string} options.latitude - Latitude of the place
     * @param {string} options.longitude - Longitude of the place
     * @param {string} options.appName - Name of the app
     */
    async shareReferral(options = {}) {
        const {
            title,
            description,
            address,
            imageUrl,
            imagePath,
            latitude,
            longitude,
            appName = 'ReferralRating'
        } = options;

        try {
            // Generate map link
            let mapLink = '';
            if (latitude && longitude) {
                if (Platform.OS === 'ios') {
                    mapLink = `\n🗺️ View on Maps: https://maps.apple.com/?q=${latitude},${longitude}`;
                } else {
                    mapLink = `\n🗺️ View on Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
                }
            } else if (address) {
                // Fallback to address-based map link
                const encodedAddress = encodeURIComponent(address);
                if (Platform.OS === 'ios') {
                    mapLink = `\n🗺️ View on Maps: https://maps.apple.com/?q=${encodedAddress}`;
                } else {
                    mapLink = `\n🗺️ View on Maps: https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                }
            }

            // Generate app download link
            const appDownloadLink = `\n📱 Download ${appName}: ${getAppStoreUrl()}`;

            const message = `Check out this amazing place I found on ${appName}!\n\n${title}\n${description}\n\n📍 ${address}${mapLink}${appDownloadLink}\n\nDiscover more great places on ${appName}!`;

            const shareOptions = {
                title: `Check out ${title}!`,
                message,
                subject: `Amazing place: ${title}`,
                showAppsToView: true,
                showAppsToShare: true,
            };

            // If we have a local image path, share the image file
            if (imagePath) {
                shareOptions.url = `file://${imagePath}`;
                shareOptions.type = 'image/jpeg';
            } else if (imageUrl) {
                // Fallback to sharing the URL if no local image
                shareOptions.url = imageUrl;
            }

            const result = await Share.open(shareOptions);
            return result;
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing referral:', error);
                throw error;
            }
            return null;
        }
    },

    /**
     * Share user's profile or achievements
     * @param {Object} options - Sharing options
     * @param {string} options.userName - Name of the user
     * @param {number} options.totalPoints - User's total points
     * @param {number} options.level - User's current level
     * @param {number} options.referrals - Number of referrals
     * @param {string} options.appName - Name of the app
     */
    async shareProfile(options = {}) {
        const {
            userName,
            totalPoints = 0,
            level = 1,
            referrals = 0,
            appName = 'ReferralRating'
        } = options;

        try {
            const message = `Check out my profile on ${appName}!\n\n👤 ${userName}\n🏆 Level ${level}\n⭐ ${totalPoints} Total Points\n📊 ${referrals} Referrals\n\nJoin me on ${appName} and start discovering amazing places!`;

            const shareOptions = {
                title: `My ${appName} Profile`,
                message,
                url: getAppStoreUrl(),
                subject: `My ${appName} Profile`,
                showAppsToView: true,
                showAppsToShare: true,
            };

            const result = await Share.open(shareOptions);
            return result;
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing profile:', error);
                throw error;
            }
            return null;
        }
    },

    /**
     * Get the appropriate app store URL based on platform
     * @returns {string} App store URL
     */
    getAppStoreUrl: getAppStoreUrl,

    /**
     * Share text content
     * @param {Object} options - Sharing options
     * @param {string} options.title - Title for the share
     * @param {string} options.message - Message to share
     * @param {string} options.subject - Subject for the share
     */
    async shareText(options = {}) {
        const {
            title = 'Share',
            message = '',
            subject = ''
        } = options;

        try {
            const shareOptions = {
                title,
                message,
                subject,
                showAppsToView: true,
                showAppsToShare: true,
            };

            const result = await Share.open(shareOptions);
            return result;
        } catch (error) {
            if (error.message !== 'User did not share') {
                console.error('Error sharing text:', error);
                throw error;
            }
            return null;
        }
    },
};

export default ShareUtils;

