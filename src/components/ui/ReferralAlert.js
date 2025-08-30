import { Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import theme from '../../constants/theme'
import TextInputField from './TextInputField'
import Button from './Button'
import IconAsset from '../../assets/icons/IconAsset'
import ReferralController from '../../controllers/referrals/ReferralController'

const ReferralAlert = () => {
    const { showReferralAlert, setShowReferralAlert, setPlaceReferredStatus, placeReferredStatus } = ReferralController()
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [buttonText, setButtonText] = useState('Send Referral')
    const [mailSent, setMailSent] = useState(false)
    const handleSend = () => {
        setIsLoading(true)
        setButtonText('Sending...')
        setTimeout(() => {
            setIsLoading(false)
            setButtonText('Got it!')
            setMailSent(true)
            setPlaceReferredStatus(true)
        }, 1500)
    }

    React.useEffect(() => {
        setMailSent(false)
        setEmail('')
        setButtonText('Send Referral')
        setPlaceReferredStatus(false)
    }, [])

    const handleButtonPress = () => {
        if (mailSent) {
            setShowReferralAlert(false)
            setPlaceReferredStatus(false)
            setMailSent(false)
            setEmail('')
            setButtonText('Send Referral')
        } else {
            handleSend()
        }
    }
    const closeAlert = () => {
        setShowReferralAlert(false)
        setPlaceReferredStatus(false)
    }

    return (
        <Pressable onPress={closeAlert} style={styles.referralAlert}>
            <View style={styles.referralAlertContentContainer}>
                {mailSent ? (
                    <View style={styles.referralAlertContentContainerItem}>
                        <View style={styles.referralAlertContentContainerItemIcon}>
                            <IconAsset.checkSquareIcon width={36} height={36} />
                        </View>
                        <Text style={styles.referralAlertContentContainerItemTitle}>E-mail sent successfully</Text>
                        <View style={styles.referralAlertContentContainerItemDateContainer}>
                            <Text style={styles.referralAlertContentContainerItemText}>
                                The referral will be expired on:
                            </Text>
                            <Text style={styles.referralAlertContentContainerItemDate}>
                                03/25/2021
                            </Text>
                        </View>
                    </View>) : (
                    <View style={styles.referralAlertContentContainerItem}>
                        <Text style={styles.referralAlertContentContainerItemTitle}>Refer this place</Text>
                        <TextInputField
                            label="E-mail address"
                            placeholder="Enter your e-mail address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                )}
                <Button
                    title={buttonText}
                    onPress={handleButtonPress}
                    loading={isLoading}
                    variant="primary"
                    size="medium"
                />
            </View>
        </Pressable>
    )
}

export default ReferralAlert

const styles = StyleSheet.create({
    referralAlert: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background.referralAlert,
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    referralAlertContentContainer: {
        backgroundColor: theme.colors.background.white,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,

        width: '100%',
    },
    referralAlertContentContainerItem: {
        gap: theme.spacing.md,
    },
    referralAlertContentContainerItemTitle: {
        ...theme.typography.h3,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    referralAlertContentContainerItemIcon: {
        width: theme.responsive.size(60),
        height: theme.responsive.size(60),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[500],
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    referralAlertContentContainerItemDateContainer: {
        gap: theme.spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.lg,
    },
    referralAlertContentContainerItemText: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.medium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    referralAlertContentContainerItemDate: {
        ...theme.typography.bodyLarge,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
})