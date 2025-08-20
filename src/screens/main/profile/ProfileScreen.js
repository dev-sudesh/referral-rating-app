import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Alert,
    Switch,
    Platform,
    FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import IconAsset from '../../../assets/icons/IconAsset';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppImage from '../../../components/common/AppImage';
import ImageAsset from '../../../assets/images/ImageAsset';
import Constants from '../../../constants/data';

const ProfileScreen = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    // Show status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setHidden(false);
            StatusBar.setBarStyle('dark-content');
            return () => { };
        }, [])
    );

    const userProfile = {
        name: 'Thomas Monoghan',
        email: 't.monoghan@gmail.com',
    };

    const menuItems = [
        {
            id: 'personal-info',
            title: 'Personal Information',
            action: 'navigate',
            navigateTo: Constants.Screen.PersonalInfo,
        },
        {
            id: 'favorites-filters',
            title: 'Favorites Filters',
            action: 'navigate',
            navigateTo: Constants.Screen.FavoriteFilters,
        },
        {
            id: 'sign-in-options',
            title: 'Sign in options',
        },
        {
            id: 'notifications-settings',
            title: 'Notifications Settings',
            action: 'navigate',
            navigateTo: Constants.Screen.NotificationSettings,
        },
    ];

    const aboutItems = [
        {
            id: 'faq-contact-us',
            title: 'FAQ / Contact Us',

        },
        {
            id: 'terms-of-service',
            title: 'Terms of Service',
        },
        {
            id: 'privacy-policy',
            title: 'Privacy Policy',
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        // Handle logout logic
                        navigation.replace('Splash');
                    },
                },
            ]
        );
    };

    const renderProfileHeader = () => (
        <View style={styles.profileHeader}>
            <View style={styles.avatarImageContainer}>
                <AppImage source={ImageAsset.profileImage} style={styles.avatarImage} />
            </View>

            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
            </View>
        </View>
    );

    const renderMenuItem = ({ item, isLastItem }) => (
        <View key={item.id}>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    if (item.action === 'navigate') {
                        navigation.navigate(item.navigateTo);
                    }
                }}
                activeOpacity={0.8}
            >
                <View style={styles.menuItemLeft}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>


                <IconAsset.arrowRightIcon width={20} height={20} />

            </TouchableOpacity>
            {!isLastItem && <View style={styles.menuItemSeparator} />}
        </View>

    );

    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{userProfile.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>{userProfile.level}</Text>
                <Text style={styles.statLabel}>Current Level</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statValue}>8</Text>
                <Text style={styles.statLabel}>Referrals</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>


            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>My profile</Text>
                </View>
                <TouchableOpacity style={styles.newProfileButton}>
                    <IconAsset.newProfileIcon width={24} height={24} />
                </TouchableOpacity>
            </View>

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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
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
    newProfileButton: {
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
    avatarContainer: {
        position: 'relative',
    },
    avatarImageContainer: {
        width: theme.responsive.size(110),
        height: theme.responsive.size(110),
        borderRadius: theme.borderRadius.full,
        borderWidth: 2,
        borderColor: theme.colors.primary[500],
        ...theme.shadows.small,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: theme.responsive.size(110) - theme.responsive.size(8),
        height: theme.responsive.size(110) - theme.responsive.size(8),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[100],
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    profileName: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    profileEmail: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    profilePhone: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    memberSince: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
    },
    statsContainer: {
        flexDirection: theme.responsive.isSmall() ? 'column' : 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg,
        gap: theme.responsive.isSmall() ? theme.spacing.sm : 0,
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
        ...theme.shadows.small,
    },
    statValue: {
        ...theme.typography.h4,
        color: theme.colors.primary[500],
        marginBottom: theme.spacing.xs,
    },
    statLabel: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    quickActionsContainer: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
        fontWeight: theme.fontWeight.bold,
    },
    quickActionsGrid: {
        flexDirection: theme.responsive.isSmall() ? 'column' : 'row',
        justifyContent: 'space-between',
        gap: theme.responsive.isSmall() ? theme.spacing.sm : 0,
    },
    quickActionButton: {
        flex: theme.responsive.isSmall() ? 0 : 1,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginHorizontal: theme.responsive.isSmall() ? 0 : theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        minHeight: theme.responsive.height(80),
        ...theme.shadows.small,
    },
    quickActionIcon: {
        fontSize: theme.responsive.iconSize('large'),
        marginBottom: theme.spacing.sm,
    },
    quickActionTitle: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.primary,
        textAlign: 'center',
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
    menuItemIcon: {
        fontSize: theme.responsive.iconSize('large'),
        marginRight: theme.spacing.md,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        fontWeight: theme.fontWeight.semiBold,
    },
    menuItemSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    menuItemArrow: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.tertiary,
    },
    logoutButton: {
        backgroundColor: theme.colors.error[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.small,
    },
    logoutButtonText: {
        ...theme.typography.buttonLarge,
        color: theme.colors.background.primary,
    },
    versionContainer: {
        alignItems: 'center',
    },
    versionText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
    },
});

export default ProfileScreen; 