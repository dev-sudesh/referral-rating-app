import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconAsset from '../../assets/icons/IconAsset';
import { theme } from '../../constants/theme';
import { useSharing } from '../../hooks/useSharing';

const ShareModal = ({ visible, onClose, userProfile, userPersonalInfo }) => {
    const { isSharing, shareProfile, shareApp, shareReferral, shareCustomMessage } = useSharing();

    const shareOptions = [
        {
            id: 'profile',
            title: 'Share My Profile',
            subtitle: 'Share your achievements and stats',
            icon: 'profile',
            action: async () => {
                try {
                    const result = await shareProfile(userProfile, userPersonalInfo);
                    if (!result.success) {
                        Alert.alert(
                            'Share Error',
                            'Unable to share your profile. Please try again.',
                            [{ text: 'OK' }]
                        );
                    }
                } catch (error) {
                    console.error('Error sharing profile:', error);
                    Alert.alert(
                        'Share Error',
                        'Unable to share your profile. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        },
        {
            id: 'app',
            title: 'Share App',
            subtitle: 'Invite friends to download the app',
            icon: 'app',
            action: async () => {
                try {
                    const result = await shareApp('I found this amazing app that helps you discover and rate incredible places. You should try it!');
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
        },
        {
            id: 'referral',
            title: 'Share Best Referral',
            subtitle: 'Share your favorite place discovery',
            icon: 'referral',
            action: async () => {
                try {
                    const result = await shareReferral({
                        title: 'Boucherie Union Square',
                        description: 'Amazing restaurant with incredible food and atmosphere!',
                        address: '225 Park Ave, New York, NY 10177'
                    });
                    if (!result.success) {
                        Alert.alert(
                            'Share Error',
                            'Unable to share referral. Please try again.',
                            [{ text: 'OK' }]
                        );
                    }
                } catch (error) {
                    console.error('Error sharing referral:', error);
                    Alert.alert(
                        'Share Error',
                        'Unable to share referral. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        },
        {
            id: 'custom',
            title: 'Custom Message',
            subtitle: 'Write your own message to share',
            icon: 'custom',
            action: async () => {
                try {
                    const result = await shareCustomMessage(
                        'Hey! I wanted to share this awesome app called ReferralRating with you. It helps you discover amazing places and share your experiences with friends. You should definitely check it out!',
                        'Share ReferralRating'
                    );
                    if (!result.success) {
                        Alert.alert(
                            'Share Error',
                            'Unable to share message. Please try again.',
                            [{ text: 'OK' }]
                        );
                    }
                } catch (error) {
                    console.error('Error sharing custom message:', error);
                    Alert.alert(
                        'Share Error',
                        'Unable to share message. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        }
    ];

    const renderShareOption = (option) => (
        <TouchableOpacity
            key={option.id}
            style={styles.shareOption}
            onPress={option.action}
            disabled={isSharing}
            activeOpacity={0.7}
        >
            <View style={styles.shareOptionLeft}>
                <View style={styles.iconContainer}>
                    {option.icon === 'profile' && <IconAsset.bottomTab.unSelected.profileIcon width={24} height={24} />}
                    {option.icon === 'app' && <IconAsset.shareIcon width={24} height={24} />}
                    {option.icon === 'referral' && <IconAsset.markerIconSvg width={24} height={24} />}
                    {option.icon === 'custom' && <IconAsset.editIcon width={24} height={24} />}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
            </View>
            <IconAsset.arrowRightIcon width={20} height={20} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconAsset.closeIcon width={24} height={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Share with Friends</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Text style={styles.description}>
                        Choose how you'd like to share ReferralRating with your friends and family
                    </Text>

                    <View style={styles.optionsContainer}>
                        {shareOptions.map((option, index) => (
                            <View key={option.id}>
                                {renderShareOption(option)}
                                {index < shareOptions.length - 1 && <View style={styles.separator} />}
                            </View>
                        ))}
                    </View>

                    {isSharing && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Preparing to share...</Text>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    closeButton: {
        padding: theme.spacing.sm,
    },
    headerTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.bold,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
    },
    description: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        lineHeight: 22,
    },
    optionsContainer: {
        backgroundColor: theme.colors.background.white,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    shareOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background.white,
    },
    shareOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary[50],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
        fontWeight: theme.fontWeight.semiBold,
        marginBottom: theme.spacing.xs,
    },
    optionSubtitle: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        lineHeight: 18,
    },
    separator: {
        height: 1,
        backgroundColor: theme.colors.border.light,
        marginHorizontal: theme.spacing.lg,
    },
    loadingContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    loadingText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
});

export default ShareModal;
