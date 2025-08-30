import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import ScreenContainer from '../../../components/common/ScreenContainer';
import { responsiveSize } from '../../../utils/responsive/ResponsiveUi';

// Import Firebase Store hooks
import { useDataRecovery } from '../../../hooks/useDataRecovery';
import { useFirebaseStore } from '../../../hooks/useFirebaseStore';

const ProfileScreen = ({ navigation }) => {
    const [userStats, setUserStats] = useState(null);

    // Data recovery hook
    const { wasRecovered, forceRecovery } = useDataRecovery();

    // Firebase store hook
    const { clearUserData, getUserStats, loading } = useFirebaseStore();

    // Load user stats
    useEffect(() => {
        const loadStats = async () => {
            const stats = await getUserStats();
            setUserStats(stats);
        };
        loadStats();
    }, [getUserStats]);

    const handleDataRecovery = async () => {
        Alert.alert(
            'Recover Data',
            'This will attempt to recover your data from the server. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Recover',
                    onPress: async () => {
                        const recovered = await forceRecovery();
                        if (recovered) {
                            Alert.alert('Success', 'Data recovered successfully!');
                        } else {
                            Alert.alert('No Data Found', 'No previous data was found to recover.');
                        }
                    },
                },
            ]
        );
    };

    const handleClearData = async () => {
        Alert.alert(
            'Clear All Data',
            'This will permanently delete all your data including device mappings. This action cannot be undone. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearUserData();
                            Alert.alert('Success', 'All data has been cleared.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data.');
                        }
                    },
                },
            ]
        );
    };

    const ProfileMenuItem = ({ icon, title, subtitle, onPress, showBadge = false, badgeText = '' }) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                    {icon === 'edit-icon' && <IconAsset.editIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'filter-icon' && <IconAsset.filterIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'clock-icon' && <IconAsset.clockIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'share-icon' && <IconAsset.shareIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'close-icon' && <IconAsset.closeIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'website-icon' && <IconAsset.websiteIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'check-icon' && <IconAsset.checkIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                    {icon === 'new-profile-icon' && <IconAsset.newProfileIcon width={24} height={24} fill={theme.colors.primary[500]} />}
                </View>
                <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <View style={styles.menuItemRight}>
                {showBadge && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badgeText}</Text>
                    </View>
                )}
                <IconAsset.arrowRightIcon width={20} height={20} fill={theme.colors.text.secondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer {...ScreenContainer.presets.full}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background.primary} />

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* User Info Section */}
                    <View style={styles.section}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <IconAsset.newProfileIcon width={40} height={40} fill={theme.colors.primary[500]} />
                            </View>
                            <View style={styles.userDetails}>
                                <Text style={styles.userName}>Anonymous User</Text>
                                <Text style={styles.userStatus}>
                                    {wasRecovered ? 'Data recovered from previous session' : 'New user'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* User Stats */}
                    {userStats && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Activity</Text>
                            <View style={styles.statsGrid}>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userStats.searchCount}</Text>
                                    <Text style={styles.statLabel}>Searches</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userStats.referredPlacesCount}</Text>
                                    <Text style={styles.statLabel}>Referred Places</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statNumber}>{userStats.visitedPlacesCount}</Text>
                                    <Text style={styles.statLabel}>Visited</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Settings Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Settings</Text>

                        <ProfileMenuItem
                            icon="edit-icon"
                            title="Personal Information"
                            subtitle="Update your profile details"
                            onPress={() => navigation.navigate('PersonalInfo')}
                        />

                        <ProfileMenuItem
                            icon="filter-icon"
                            title="Favorite Filters"
                            subtitle="Manage your search preferences"
                            onPress={() => navigation.navigate('FavoriteFilters')}
                        />

                        <ProfileMenuItem
                            icon="clock-icon"
                            title="Notification Settings"
                            subtitle="Configure push notifications"
                            onPress={() => navigation.navigate('NotificationSettings')}
                        />
                    </View>

                    {/* Data Management Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Data Management</Text>

                        <ProfileMenuItem
                            icon="share-icon"
                            title="Recover Data"
                            subtitle="Restore your previous data"
                            onPress={handleDataRecovery}
                            showBadge={wasRecovered}
                            badgeText="✓"
                        />

                        <ProfileMenuItem
                            icon="close-icon"
                            title="Clear All Data"
                            subtitle="Permanently delete all your data"
                            onPress={handleClearData}
                        />
                    </View>

                    {/* App Info Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>App Information</Text>

                        <ProfileMenuItem
                            icon="website-icon"
                            title="Version"
                            subtitle="1.0.0"
                            onPress={() => { }}
                        />

                        <ProfileMenuItem
                            icon="check-icon"
                            title="Privacy Policy"
                            subtitle="Read our privacy policy"
                            onPress={() => { }}
                        />

                        <ProfileMenuItem
                            icon="check-icon"
                            title="Terms of Service"
                            subtitle="Read our terms of service"
                            onPress={() => { }}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        paddingHorizontal: responsiveSize(16),
        paddingVertical: responsiveSize(16),
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    headerTitle: {
        fontSize: responsiveSize(24),
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: responsiveSize(24),
    },
    sectionTitle: {
        fontSize: responsiveSize(18),
        fontWeight: '600',
        color: theme.colors.text.primary,
        paddingHorizontal: responsiveSize(16),
        paddingVertical: responsiveSize(12),
        backgroundColor: theme.colors.background.secondary,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: responsiveSize(16),
        paddingVertical: responsiveSize(20),
        backgroundColor: theme.colors.background.secondary,
    },
    avatar: {
        width: responsiveSize(60),
        height: responsiveSize(60),
        borderRadius: responsiveSize(30),
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: responsiveSize(16),
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: responsiveSize(18),
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: responsiveSize(4),
    },
    userStatus: {
        fontSize: responsiveSize(14),
        color: theme.colors.text.secondary,
    },
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: responsiveSize(16),
        paddingVertical: responsiveSize(16),
        backgroundColor: theme.colors.background.secondary,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: responsiveSize(24),
        fontWeight: 'bold',
        color: theme.colors.primary[500],
        marginBottom: responsiveSize(4),
    },
    statLabel: {
        fontSize: responsiveSize(12),
        color: theme.colors.text.secondary,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: responsiveSize(16),
        paddingVertical: responsiveSize(16),
        backgroundColor: theme.colors.background.secondary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuIcon: {
        width: responsiveSize(40),
        height: responsiveSize(40),
        borderRadius: responsiveSize(20),
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: responsiveSize(12),
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        fontSize: responsiveSize(16),
        fontWeight: '500',
        color: theme.colors.text.primary,
        marginBottom: responsiveSize(2),
    },
    menuSubtitle: {
        fontSize: responsiveSize(14),
        color: theme.colors.text.secondary,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: theme.colors.success[500],
        borderRadius: responsiveSize(10),
        paddingHorizontal: responsiveSize(8),
        paddingVertical: responsiveSize(4),
        marginRight: responsiveSize(8),
    },
    badgeText: {
        color: theme.colors.text.white,
        fontSize: responsiveSize(12),
        fontWeight: '600',
    },
});

export default ProfileScreen; 