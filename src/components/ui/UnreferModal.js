import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import theme from '../../constants/theme'
import Button from './Button'
import IconAsset from '../../assets/icons/IconAsset'

const UnreferModal = ({ visible, onCancel, onConfirm, placeName }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable onPress={onCancel} style={styles.modalOverlay}>
                <Pressable onPress={(e) => e.stopPropagation()} style={styles.modalContent}>
                    <View style={styles.modalContentContainer}>
                        <View style={styles.modalIconContainer}>
                            <IconAsset.warningIcon width={36} height={36} />
                        </View>
                        <Text style={styles.modalTitle}>Remove Referrals Place</Text>
                        {placeName && <Text style={styles.modalPlaceName}>{placeName}</Text>}
                        <Text style={styles.modalMessage}>
                            Are you sure you want to remove this place from your Referrals list? It will no longer appear in the "Referrals" tab.
                        </Text>
                        <View style={styles.buttonContainer}>
                            <Button
                                title="Cancel"
                                onPress={onCancel}
                                variant="outline-danger"
                                size="medium"
                                style={[styles.button, styles.cancelButton]}
                            />
                            <Button
                                title="Remove"
                                onPress={onConfirm}
                                variant="warning"
                                size="medium"
                                style={styles.button}
                            />
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default UnreferModal

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: theme.colors.background.referralAlert,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    modalContent: {
        width: '100%',
    },
    modalContentContainer: {
        backgroundColor: theme.colors.background.white,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        gap: theme.spacing.md,
    },
    modalIconContainer: {
        width: theme.responsive.size(60),
        height: theme.responsive.size(60),
        borderRadius: theme.borderRadius.round,
        backgroundColor: '#FFF3E0',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    modalTitle: {
        ...theme.typography.h3,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.warning[800],
        textAlign: 'center',
    },
    modalPlaceName: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    modalMessage: {
        ...theme.typography.bodySmall,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.neutral[600],
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginTop: theme.spacing.sm,
    },
    button: {
        flex: 1,
    },
    cancelButton: {
    },
})
