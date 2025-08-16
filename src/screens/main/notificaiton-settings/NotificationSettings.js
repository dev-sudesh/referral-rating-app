import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import ToggleSwitch from '../../../components/ui/ToggleSwitch';

const notificationSettingsData = [
    {
        label: 'Enable all notifications',
        settingKey: 'enableAllNotifications',
        value: true,
    },
    {
        label: 'Notification #1',
        settingKey: 'notification1',
        value: false,
    },
    {
        label: 'Notification #2',
        settingKey: 'notification2',
        value: true,
    },
    {
        label: 'Notification #3',
        settingKey: 'notification3',
        value: false,
    },
    {
        label: 'Notification #4',
        settingKey: 'notification4',
        value: true,
    },
];

const NotificationSettings = ({ navigation }) => {
    // State for notification settings
    const [notificationSettings, setNotificationSettings] = useState(notificationSettingsData);

    // Handle toggle change
    const handleToggleChange = (settingKey, value) => {
        setNotificationSettings(prev => {
            const newSettings = [...prev];
            const index = newSettings.findIndex(setting => setting.settingKey === settingKey);
            if (index !== -1) {
                newSettings[index].value = value;
            }
            return newSettings;
        });
    };

    // Notification setting item component
    const NotificationItem = ({ label, settingKey, value, style }) => (
        <View style={[styles.notificationItem, style]}>
            <Text style={styles.notificationLabel}>{label}</Text>
            <ToggleSwitch
                value={value}
                onValueChange={(newValue) => handleToggleChange(settingKey, newValue)}
                activeColor={theme.colors.tertiary[500]}
            />
        </View>
    );

    return (
        <ScreenContainer
            {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: 0,
            }}
        >
            <ScreenHeader
                title="Notifications settings"
                showBackButton
                onBackPress={() => navigation.goBack()}
                titleStyle={styles.headerTitle}
                style={styles.header}
            />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <NotificationItem
                    label="Enable all notifications"
                    settingKey="enableAllNotifications"
                    value={notificationSettings.enableAllNotifications}
                    style={styles.notificationItemEnableAll}
                />

                <NotificationItem
                    label="Notification #1"
                    settingKey="notification1"
                    value={notificationSettings.notification1}
                />

                <NotificationItem
                    label="Notification #2"
                    settingKey="notification2"
                    value={notificationSettings.notification2}
                />

                <NotificationItem
                    label="Notification #3"
                    settingKey="notification3"
                    value={notificationSettings.notification3}
                />

                <NotificationItem
                    label="Notification #4"
                    settingKey="notification4"
                    value={notificationSettings.notification4}
                />
            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        paddingHorizontal: theme.spacing.md,
    },
    headerTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.medium,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: theme.spacing.md,
    },
    notificationItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background.white,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.small,
    },
    notificationLabel: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        flex: 1,
        fontWeight: theme.fontWeight.regular,
    },
    notificationItemEnableAll: {
        marginBottom: theme.spacing.xl,
    },
});

export default NotificationSettings;