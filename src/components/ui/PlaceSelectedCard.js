import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import React from 'react'
import MapsController from '../../controllers/maps/MapsController';
import AppImage from '../common/AppImage';
import ImageAsset from '../../assets/images/ImageAsset';
import CurvedCard from './CurvedCard';
import theme from '../../constants/theme';
import ApiController from '../../services/api/ApiController';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PlaceSelectedCard = () => {
    const referPlaceMutation = ApiController.referPlace();
    const selectedPlace = MapsController(state => state.selectedPlace);
    const setSelectedPlace = MapsController.getState().setSelectedPlace;
    const setShowPlaceFullCard = MapsController.getState().setShowPlaceFullCard;
    const setShowPlaceBigCard = MapsController.getState().setShowPlaceBigCard;
    const places = MapsController(state => state.places);
    const setPlaces = MapsController.getState().setPlaces;
    const setShowConfetti = MapsController.getState().setShowConfetti;
    const buttonRef = React.useRef(null);

    const referPlace = async () => {
        referPlaceMutation.mutateAsync({ place: selectedPlace, placeId: selectedPlace.id, action: selectedPlace.isReferred ? 'unrefer' : 'refer' });
        if (selectedPlace.isReferred) {
            // unrefer place
            setPlaces(places.map(p => p.id === selectedPlace.id ? { ...p, isReferred: false } : p));
            setSelectedPlace({ ...selectedPlace, isReferred: false });
            return;
        }
        setPlaces(places.map(p => p.id === selectedPlace.id ? { ...p, isReferred: true } : p));
        setSelectedPlace({ ...selectedPlace, isReferred: true });

        // Measure button position and trigger confetti at screen level
        if (buttonRef.current) {
            buttonRef.current.measureInWindow((x, y, width, height) => {
                setShowConfetti(true, { x: x + width / 2, y: y + height / 2 });
            });
        } else {
            setShowConfetti(true, { x: screenWidth / 2, y: screenHeight - theme.responsive.size(80) });
        }
    };

    return (
        <TouchableOpacity activeOpacity={1} style={[styles.placeCardBig,]} onPress={() => {
            setShowPlaceFullCard(true);
            setShowPlaceBigCard(false);
        }}>
            {/* SVG Curved Card */}
            {selectedPlace.isReferred && (
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
                width={theme.responsive.screen().width - (theme.spacing.lg * 2)}
                height={theme.responsive.size(220)}
                curveDepth={40}
                cornerRadius={theme.borderRadius.lg}
                style={styles.svgCardContainer}
            >
                <View style={styles.placeCardHeader}>
                    <View style={styles.placeCardImageFull}>
                        <AppImage
                            source={selectedPlace?.imageFull}
                            placeholderSource={ImageAsset.placesPlaceholderImage}
                            resizeMode='cover'
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: theme.borderRadius.sm,
                            }}
                        />
                    </View>
                </View>
                <View style={styles.placeCardInfo}>
                    <View style={styles.placeInfoFull}>
                        <Text style={styles.placeNameFull}>
                            {selectedPlace?.name}
                        </Text>
                        <Text style={styles.placeCategory}>
                            {selectedPlace?.address}
                        </Text>
                    </View>
                </View>
            </CurvedCard>

            <TouchableOpacity
                ref={buttonRef}
                activeOpacity={1}
                style={styles.placeCardFooter}
                onPress={() => referPlace()}
            >
                <View style={[styles.placeCardFooterContent, selectedPlace.isReferred && styles.placeCardFooterContentReferred]}>
                    <AppImage
                        source={ImageAsset.logos.logoSmall}
                        style={styles.placeLogo}
                    />
                </View>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}

export default PlaceSelectedCard

const styles = StyleSheet.create({
    placeCardBig: {
        width: theme.responsive.screen().width,
        marginBottom: theme.spacing.md,
        paddingTop: theme.responsive.size(35),
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        alignItems: 'center',
        zIndex: 1000,
    },

    placeCardReferred: {
        position: 'absolute',
        top: 0,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        height: theme.responsive.size(100),
        backgroundColor: theme.colors.primary[500],
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        ...theme.shadows.small,
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
    placeCardReferredText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.white,
        fontWeight: '700',
    },
    svgCardContainer: {
    },
    placeCardImageFull: {
        width: '100%',
        height: theme.responsive.size(124),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    placeCardInfo: {
        height: theme.responsive.size(65),
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.xxs,
        paddingLeft: theme.spacing.sm,
    },
    placeInfoFull: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.xxs,
    },
    placeNameFull: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
    placeCategory: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
        fontWeight: '600',
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
})