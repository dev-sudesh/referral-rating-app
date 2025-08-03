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
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';

const ProfileScreen = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [locationEnabled, setLocationEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    const userProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        avatar: '👤',
        memberSince: 'January 2024',
        totalPoints: 1250,
        level: 'Gold',
    };

    const menuItems = [
        {
            id: 'account',
            title: 'Account Settings',
            subtitle: 'Manage your account information',
            icon: '⚙️',
            action: 'navigate',
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            subtitle: 'Password, 2FA, and privacy settings',
            icon: '🔒',
            action: 'navigate',
        },
        {
            id: 'notifications',
            title: 'Notifications',
            subtitle: 'Push notifications and email preferences',
            icon: '🔔',
            action: 'toggle',
            value: notificationsEnabled,
            onValueChange: setNotificationsEnabled,
        },
        {
            id: 'location',
            title: 'Location Services',
            subtitle: 'Enable location-based features',
            icon: '📍',
            action: 'toggle',
            value: locationEnabled,
            onValueChange: setLocationEnabled,
        },
        {
            id: 'appearance',
            title: 'Appearance',
            subtitle: 'Dark mode and theme settings',
            icon: '🎨',
            action: 'toggle',
            value: darkModeEnabled,
            onValueChange: setDarkModeEnabled,
        },
        {
            id: 'help',
            title: 'Help & Support',
            subtitle: 'FAQ, contact support, and feedback',
            icon: '❓',
            action: 'navigate',
        },
        {
            id: 'about',
            title: 'About',
            subtitle: 'App version and legal information',
            icon: 'ℹ️',
            action: 'navigate',
        },
    ];

    const quickActions = [
        {
            id: 'edit',
            title: 'Edit Profile',
            icon: '✏️',
            action: () => Alert.alert('Edit Profile', 'Edit profile functionality'),
        },
        {
            id: 'share',
            title: 'Share App',
            icon: '📤',
            action: () => Alert.alert('Share App', 'Share app functionality'),
        },
        {
            id: 'rate',
            title: 'Rate App',
            icon: '⭐',
            action: () => Alert.alert('Rate App', 'Rate app functionality'),
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
            <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{userProfile.avatar}</Text>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>{userProfile.level}</Text>
                </View>
            </View>

            <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
                <Text style={styles.profilePhone}>{userProfile.phone}</Text>
                <Text style={styles.memberSince}>Member since {userProfile.memberSince}</Text>
            </View>
        </View>
    );

    const renderQuickActions = () => (
        <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.id}
                        style={styles.quickActionButton}
                        onPress={action.action}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.quickActionIcon}>{action.icon}</Text>
                        <Text style={styles.quickActionTitle}>{action.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
                if (item.action === 'navigate') {
                    Alert.alert(item.title, `${item.title} functionality`);
                }
            }}
            activeOpacity={0.8}
        >
            <View style={styles.menuItemLeft}>
                <Text style={styles.menuItemIcon}>{item.icon}</Text>
                <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
            </View>

            {item.action === 'toggle' ? (
                <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{
                        false: theme.colors.neutral[300],
                        true: theme.colors.primary[300],
                    }}
                    thumbColor={
                        item.value ? theme.colors.primary[500] : theme.colors.neutral[400]
                    }
                />
            ) : (
                <Text style={styles.menuItemArrow}>›</Text>
            )}
        </TouchableOpacity>
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
        <ScreenContainer{...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.xxxl,
                paddingBottom: theme.spacing.md,
            }}>
            <Text>Profile Screen</Text>
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
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.settingsButton}>
                    <Text style={styles.settingsButtonText}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Header */}
                {renderProfileHeader()}

                {/* Stats */}
                {renderStats()}

                {/* Quick Actions */}
                {renderQuickActions()}

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    {menuItems.map(renderMenuItem)}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>RNFramework v1.0.0</Text>
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
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsButtonText: {
        fontSize: 18,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: theme.spacing.lg,
    },
    avatar: {
        fontSize: 64,
        width: 80,
        height: 80,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[100],
        textAlign: 'center',
        lineHeight: 80,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: theme.colors.warning[500],
        borderRadius: theme.borderRadius.round,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    levelBadgeText: {
        ...theme.typography.captionSmall,
        color: theme.colors.background.primary,
        fontWeight: theme.fontWeight.semiBold,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    profileEmail: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    profilePhone: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    memberSince: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.tertiary,
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
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginHorizontal: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    quickActionIcon: {
        fontSize: 24,
        marginBottom: theme.spacing.sm,
    },
    quickActionTitle: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    menuContainer: {
        marginBottom: theme.spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemIcon: {
        fontSize: 20,
        marginRight: theme.spacing.md,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    menuItemSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    menuItemArrow: {
        ...theme.typography.h4,
        color: theme.colors.text.tertiary,
    },
    logoutButton: {
        backgroundColor: theme.colors.error[500],
        borderRadius: theme.borderRadius.md,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        ...theme.shadows.ios.small,
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