import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import ImageAsset from '../../../assets/images/ImageAsset';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import Constants from '../../../constants/data';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import WebViewController from '../../../controllers/webview/WebViewController';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ShareModal from '../../../components/common/ShareModal';
import { useSharing } from '../../../hooks/useSharing';
import HtmlWrapper from '../../../constants/data/HtmlWrapper';

const ProfileScreen = ({ navigation }) => {
    const [shareModalVisible, setShareModalVisible] = useState(false);

    const { shareApp } = useSharing();

    const [userPersonalInfo, setUserPersonalInfo] = useState({
        firstName: 'Thomas',
        lastName: 'Monoghan',
        email: 't.monoghan@gmail.com',
    });

    const getUserPersonalInfo = async () => {
        const personalInfo = await FirebaseStoreService.getUserPersonalInfo();
        if (personalInfo) {
            setUserPersonalInfo(personalInfo);
        }
    };

    // Show status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            getUserPersonalInfo();
        }, [])
    );

    const userProfile = {
        name: 'Thomas Monoghan',
        email: 't.monoghan@gmail.com',
    };

    const menuItems = [
        // {
        //     id: 'personal-info',
        //     title: 'Personal Information',
        //     action: 'navigate',
        //     navigateTo: Constants.Screen.PersonalInfo,
        // },
        {
            id: 'favorites-filters',
            title: 'Favorites Filters',
            action: 'navigate',
            navigateTo: Constants.Screen.FavoriteFilters,
        },
        // {
        //     id: 'sign-in-options',
        //     title: 'Sign in options',
        // },
        // {
        //     id: 'notifications-settings',
        //     title: 'Notifications Settings',
        //     action: 'navigate',
        //     navigateTo: Constants.Screen.NotificationSettings,
        // },
    ];

    const aboutItems = [
        {
            id: 'faq-contact-us',
            title: 'FAQ / Contact Us',
            action: 'navigate',
            type: 'webview',
            options: {
                pageTitle: 'FAQ / Contact Us',
                content: 'faqs',
                webViewUrl: 'https://www.google.com',
            },
            navigateTo: Constants.Screen.WebView,
        },
        {
            id: 'terms-of-service',
            title: 'Terms of Service',
            action: 'navigate',
            type: 'webview',
            options: {
                pageTitle: 'Terms of Service',
                content: 'terms',
                webViewUrl: 'https://www.google.com',
            },
            navigateTo: Constants.Screen.WebView,
        },
        {
            id: 'privacy-policy',
            title: 'Privacy Policy',
            action: 'navigate',
            type: 'webview',
            options: {
                pageTitle: 'Privacy Policy',
                content: 'privacy',
                webViewUrl: 'https://www.google.com',
            },
            navigateTo: Constants.Screen.WebView,
        },
    ];

    const renderProfileHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.avatarImageContainer}>
                <AppImage source={ImageAsset.logos.logoFull} style={styles.avatarImage} />
            </View>

            <View style={styles.profileInfo}>
                {/* <Text style={styles.profileName}>{userPersonalInfo.firstName} {userPersonalInfo.lastName}</Text>
                <Text style={styles.profileEmail}>{userPersonalInfo.email}</Text> */}
            </View>
        </View>
    );

    const renderMenuItem = ({ item, isLastItem }) => (
        <View key={item.id}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    if (item.action === 'navigate') {
                        if (item.type === 'webview') {
                            WebViewController.getState().setPageTitle(item.options.pageTitle);
                            // WebViewController.getState().setWebViewUrl(item.options.webViewUrl);
                            WebViewController.getState().setWebViewHtml(HtmlWrapper.getContent(item.options.content));
                        }
                        navigation.navigate(item.navigateTo);

                    }
                }}
                activeOpacity={1}
            >
                <View style={styles.menuItemLeft}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>


                <IconAsset.arrowRightIcon width={20} height={20} />

            </TouchableOpacity>
            {!isLastItem && <View style={styles.menuItemSeparator} />}
        </View>

    );


    const shareWithFriends = async () => {
        // setShareModalVisible(true); 
        try {
            const result = await shareApp({
                title: 'Invite Friends',
                message: 'I found this amazing app that helps you discover and rate incredible places. You should try it!',
            });
            if (!result.success) {
                Alert.alert(
                    'Share Error',
                    'Unable to share the app. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error sharing app:', error);
            Alert.alert(
                'Share Error',
                'Unable to share the app. Please try again.',
                [{ text: 'OK' }]
            );
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScreenHeader
                style={{
                    paddingHorizontal: theme.spacing.lg,
                }}
                titleStyle={{
                    fontWeight: theme.fontWeight.bold,
                }}
                title="My profile"
                showBackButton={false}
                rightComponent={<TouchableOpacity onPress={shareWithFriends} activeOpacity={1} style={styles.shareButton}>
                    <IconAsset.shareIcon width={24} height={24} />
                </TouchableOpacity>}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                {renderProfileHeader()}

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    {menuItems.map((item, index) => {
                        let isLastItem = index === menuItems.length - 1;
                        return renderMenuItem({ item, isLastItem })
                    })}
                </View>

                {/* About Items */}
                <View style={styles.menuContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    {aboutItems.map((item, index) => {
                        let isLastItem = index === aboutItems.length - 1;
                        return renderMenuItem({ item, isLastItem })
                    })}
                </View>
            </ScrollView>

            <ShareModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                userProfile={userProfile}
                userPersonalInfo={userPersonalInfo}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    shareButton: {
        width: theme.responsive.size(50),
        height: theme.responsive.size(50),
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.large,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    profileHeader: {
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.sm,
    },
    avatarImageContainer: {
        width: theme.responsive.size(140),
        height: theme.responsive.size(140),
        borderWidth: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: theme.responsive.size(140) - theme.responsive.size(8),
        height: theme.responsive.size(140) - theme.responsive.size(8),
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontWeight: theme.fontWeight.bold,
    },
    menuContainer: {
        backgroundColor: theme.colors.background.white,
        borderRadius: theme.borderRadius.md,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        ...theme.shadows.small,
    },
    menuItemSeparator: {
        height: 1,
        backgroundColor: theme.colors.background.tertiary,
        marginVertical: theme.spacing.xs,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: theme.colors.border.light,
        paddingVertical: theme.spacing.md,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemTitle: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeight.semiBold,
    },
});

export default ProfileScreen; 