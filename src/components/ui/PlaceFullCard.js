import { Pressable, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { useState, useRef } from 'react'
import MapsController from '../../controllers/maps/MapsController'
import AppImage from '../common/AppImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconAsset from '../../assets/icons/IconAsset';
import theme from '../../constants/theme';
import ImageAsset from '../../assets/images/ImageAsset';
import CurvedCard from './CurvedCard';
import MethodUtils from '../../utils/MethodUtils';
import FirebaseStoreService from '../../services/firebase/FirebaseStoreService';
import ReferralController from '../../controllers/referrals/ReferralController';
import { useSharing } from '../../hooks/useSharing';
import ViewShot from 'react-native-view-shot';

const PlaceFullCard = () => {
    const { selectedPlace, setSelectedPlace, setShowPlaceFullCard, setShowPlaceBigCard, showPlaceFullCard, places, setPlaces } = MapsController();
    const [fullSelectedPlace, setFullSelectedPlace] = useState(selectedPlace);
    const { setShowReferralAlert, placeReferredStatus } = ReferralController();
    const { shareReferral } = useSharing();
    const imageRef = useRef(null);
    const referPlace = async (place) => {
        //     if (!place?.isReferred) {
        //         setShowReferralAlert(true);
        //     }
        // };

        // React.useEffect(() => {
        //     if (placeReferredStatus) {
        //         referPlaceSubmit(fullSelectedPlace);
        //     }
        // }, [placeReferredStatus]);

        // const referPlaceSubmit = async (place) => { 

        await FirebaseStoreService.storeReferredPlace(place);
        if (place.isReferred) {
            // unrefer place
            // setFilteredPlaces(filteredPlaces.map(p => p.id === place.id ? { ...p, isReferred: false } : p));
            setPlaces(places.map(p => p.id === place.id ? { ...p, isReferred: false } : p));
            setSelectedPlace(prev => prev.id === place.id ? { ...prev, isReferred: false } : prev);
            return;
        }
        // setFilteredPlaces(filteredPlaces.map(p => p.id === place.id ? { ...p, isReferred: true } : p));
        setPlaces(places.map(p => p.id === place.id ? { ...p, isReferred: true } : p));
        setSelectedPlace(prev => prev.id === place.id ? { ...prev, isReferred: true } : prev);
    };

    React.useEffect(() => {
        setFullSelectedPlace(selectedPlace);
    }, [selectedPlace]);

    React.useEffect(() => {
    }, [fullSelectedPlace?.isReferred]);

    const sharePlace = async () => {
        try {
            let imagePath = null;

            // Take screenshot of the image if imageRef is available
            if (imageRef.current && fullSelectedPlace?.imageFull) {
                try {
                    const uri = await imageRef.current.capture();
                    imagePath = uri;
                } catch (screenshotError) {
                    console.warn('Failed to capture screenshot, falling back to URL:', screenshotError);
                }
            }

            const result = await shareReferral({
                title: fullSelectedPlace?.name,
                description: fullSelectedPlace?.description,
                address: fullSelectedPlace?.address,
                imageUrl: fullSelectedPlace?.imageFull,
                imagePath: imagePath,
                latitude: fullSelectedPlace?.latitude,
                longitude: fullSelectedPlace?.longitude
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

    return (
        <View style={[styles.selectedPlaceFullCard, {
            transform: [{
                scale: showPlaceFullCard ? 1 : 0,
            }],
        }]}>
            <View style={styles.selectedPlaceFullCardBackground}>
                <ViewShot
                    ref={imageRef}
                    options={{
                        format: 'jpg',
                        quality: 0.8,
                    }}
                >
                    <AppImage
                        source={fullSelectedPlace?.imageFull}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: theme.borderRadius.sm,
                            resizeMode: 'stretch',
                        }}
                    />
                </ViewShot>
            </View>
            <SafeAreaView>
                <View style={styles.selectedPlaceFullCardButtons}>
                    <Pressable style={styles.selectedPlaceFullCardButtonItem} onPress={() => {
                        setShowPlaceFullCard(false);
                        setShowPlaceBigCard(false);
                    }}>
                        <IconAsset.closeIcon
                            width={24}
                            height={24}
                        />
                    </Pressable>
                    <TouchableOpacity onPress={sharePlace} style={styles.selectedPlaceFullCardButtonItem}>
                        <IconAsset.shareIcon
                            width={24}
                            height={24}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={{
                width: theme.responsive.screen().width,
                paddingTop: theme.responsive.size(40),
            }}>
                {/* SVG Curved Card */}
                {fullSelectedPlace.isReferred && (
                    <View style={styles.placeCardReferred}>
                        <View style={styles.placeCardReferredContent}>
                            <AppImage
                                source={ImageAsset.logos.logoSmall}
                                style={styles.placeCardReferredLogo}
                            />
                            <Text style={styles.placeCardReferredText}>Referred Location</Text>
                        </View>
                    </View>
                )}
                <CurvedCard
                    width={theme.responsive.screen().width}
                    height={theme.responsive.screen().height * 0.58}
                    curveDepth={40}
                    cornerRadius={theme.borderRadius.lg}
                >
                    <View style={styles.selectedPlaceFullCardInfo}>
                        <View style={styles.selectedPlaceFullCardInfoItem}>
                            <Text style={styles.selectedPlaceFullCardInfoItemHeaderText}>
                                {fullSelectedPlace?.name}
                            </Text>
                            <Text style={styles.selectedPlaceFullCardInfoItemSubText}>
                                {fullSelectedPlace?.address}
                            </Text>
                            <View style={styles.selectedPlaceFullCardTagsContainer}>
                                {fullSelectedPlace?.tags.map((tag, index) => (
                                    <View key={tag.id} style={[styles.referralCardTag, { backgroundColor: styles[tag.style].backgroundColor }]}>
                                        <Text style={[styles.referralCardTagText, { color: styles[tag.style].color }]}>{tag.title}</Text>
                                    </View>
                                ))}

                            </View>
                            <Text style={styles.selectedPlaceFullCardInfoItemDescription}>
                                {fullSelectedPlace?.description}
                            </Text>
                            <View style={styles.selectedPlaceFullCardExtraInfoContainer}>
                                <IconAsset.websiteIcon
                                    width={18}
                                    height={18}
                                />
                                <Text style={styles.selectedPlaceFullCardExtraInfoText}>
                                    {fullSelectedPlace?.website}
                                </Text>
                            </View>
                            <View style={styles.selectedPlaceFullCardExtraInfoContainer}>
                                <IconAsset.clockIcon
                                    width={18}
                                    height={18}
                                />
                                <View style={styles.selectedPlaceFullCardExtraInfoOpenContainer}>
                                    <Text style={[styles.selectedPlaceFullCardExtraInfoOpenText, styles.selectedPlaceFullCardExtraInfoOpenTextOpen]}>Open</Text>
                                    <Text style={styles.selectedPlaceFullCardExtraInfoOpenSeparator}> ∙ </Text>
                                    <Text style={styles.selectedPlaceFullCardExtraInfoText}>
                                        {fullSelectedPlace?.openTime}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.selectedPlaceFullCardExtraInfoOpenContainer}>
                                <Text style={styles.selectedPlaceFullCardExtraInfoOpenTextNormal}>Currently{' '}</Text>
                                <Text style={[styles.selectedPlaceFullCardExtraInfoOpenText, MethodUtils.currentTimeIsBetween(fullSelectedPlace?.openTime) ? styles.selectedPlaceFullCardExtraInfoOpenTextOpen : styles.selectedPlaceFullCardExtraInfoOpenTextClosed]}>
                                    {MethodUtils.currentTimeIsBetween(fullSelectedPlace?.openTime) ? 'Open' : 'Closed'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </CurvedCard>
                <Pressable style={styles.placeCardFooter} onPress={() => referPlace(fullSelectedPlace)}>
                    <View style={[styles.placeCardFooterContent, fullSelectedPlace?.isReferred && styles.placeCardFooterContentReferred]}>
                        <AppImage
                            source={ImageAsset.logos.logoSmall}
                            style={styles.placeLogo}
                        />
                    </View>
                </Pressable>
            </View>

        </View>
    )
}

export default PlaceFullCard

const styles = StyleSheet.create({

    selectedPlaceFullCard: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: theme.responsive.size(15),
        justifyContent: 'space-between',
    },
    selectedPlaceFullCardBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: theme.responsive.screen().width,
        height: theme.responsive.screen().height * 0.4,
        backgroundColor: theme.colors.background.primary,
    },
    selectedPlaceFullCardButtonItem: {
        padding: theme.spacing.sm,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.small,
    },
    selectedPlaceFullCardButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    selectedPlaceFullCardInfo: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    selectedPlaceFullCardInfoItem: {
    },
    selectedPlaceFullCardInfoItemHeaderText: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
    selectedPlaceFullCardInfoItemSubText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    selectedPlaceFullCardTagsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    selectedPlaceFullCardTagItem: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.background.tagStyle3,
        marginTop: theme.spacing.md,
        ...theme.shadows.custom({
            radius: 0.5,
        }),
    },
    selectedPlaceFullCardTagItemText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.tagStyle3,
        fontWeight: '600',
    },
    selectedPlaceFullCardInfoItemDescription: {
        ...theme.typography.bodyMedium,
        marginTop: theme.spacing.md,
    },
    selectedPlaceFullCardExtraInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.md,
    },
    selectedPlaceFullCardExtraInfoOpenContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedPlaceFullCardExtraInfoOpenSeparator: {
        ...theme.typography.bodySmall,
        fontWeight: '800',
    },
    selectedPlaceFullCardExtraInfoText: {
        ...theme.typography.bodySmall,
    },
    selectedPlaceFullCardExtraInfoOpenText: {
        ...theme.typography.bodySmall,
        fontWeight: '700',
    },
    selectedPlaceFullCardExtraInfoOpenTextNormal: {
        ...theme.typography.bodySmall,
    },
    selectedPlaceFullCardExtraInfoOpenTextOpen: {
        color: theme.colors.text.success,
    },
    selectedPlaceFullCardExtraInfoOpenTextClosed: {
        color: theme.colors.text.error,
    },
    placeCardFooter: {
        position: 'absolute',
        bottom: theme.spacing.sm,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.white,
        width: 66,
        height: 66,
        borderRadius: theme.borderRadius.round,
        overflow: 'hidden',
        ...theme.shadows.small,
    },
    placeCardFooterContent: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.primary[500],
    },
    placeCardFooterContentReferred: {
        backgroundColor: theme.colors.neutral[500],
    },
    placeLogo: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.round,
    },
    placeDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    placeDistance: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
        marginRight: theme.spacing.md,
    },


    placeCardReferred: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        height: theme.responsive.size(100),
        backgroundColor: theme.colors.primary[500],
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        ...theme.shadows.small,
    },
    placeCardReferredText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.white,
        fontWeight: '700',
    },
    placeCardReferredContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    placeCardReferredLogo: {
        width: theme.responsive.size(24),
        height: theme.responsive.size(24),
        borderRadius: theme.borderRadius.round,
    },

    referralCardTag: {
        marginTop: theme.spacing.md,
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        ...theme.shadows.custom({
            color: theme.colors.neutral[500],
            offset: { width: 0, height: 1 },
            opacity: 0.05,
            radius: 1,
        }),
    },
    referralCardTagText: {
        fontSize: theme.responsive.size(12),
        color: theme.colors.text.white,
        fontWeight: theme.fontWeight.semiBold,
        textTransform: 'capitalize',
    },
    tagStyle1: {
        backgroundColor: theme.colors.background.tagStyle1,
        color: theme.colors.text.tagStyle1,
    },
    tagStyle2: {
        backgroundColor: theme.colors.background.tagStyle2,
        color: theme.colors.text.tagStyle2,
    },
    tagStyle3: {
        backgroundColor: theme.colors.background.tagStyle3,
        color: theme.colors.text.tagStyle3,
    },
})