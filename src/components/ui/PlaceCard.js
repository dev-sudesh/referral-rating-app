import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import theme from '../../constants/theme';
import AppImage from '../common/AppImage';
import MapsController from '../../controllers/maps/MapsController';
import ImageAsset from '../../assets/images/ImageAsset';

const PlaceCard = (props) => {
    const { place } = props;
    const setSelectedPlace = MapsController.getState().setSelectedPlace;
    const setShowPlaceBigCard = MapsController.getState().setShowPlaceBigCard;
    const places = MapsController(state => state.places);
    const showPlaceCard = ({ place, scroll }) => {
        // Find the updated place from places array to get the latest isReferred status
        const updatedPlace = places.find(p => p.id === place.id) || place;
        setSelectedPlace(updatedPlace);
        setShowPlaceBigCard(true);
    };
    return (
        <TouchableOpacity
            key={place.id}
            style={[styles.placeCard,]}
            activeOpacity={1}
            onPress={() => showPlaceCard({ place, scroll: false })}
        >
            <View style={[styles.placeCardInner]}>
                <View style={styles.placeCardImage}>
                    <AppImage
                        source={place.imageFull}
                        placeholderSource={ImageAsset.placesPlaceholderImage}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: theme.borderRadius.sm,
                        }}
                    />
                </View>
                <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCategory}>{place.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default PlaceCard

const styles = StyleSheet.create({

    placeCard: {
        width: theme.responsive.screen().width,
        paddingHorizontal: theme.spacing.lg,
    },
    placeCardInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
        height: theme.responsive.size(100),
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.medium,
    },
    placeCardImage: {
        width: theme.responsive.size(80),
        height: theme.responsive.size(80),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    placeInfo: {
        flex: 1,
        height: theme.responsive.size(80),
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: theme.spacing.xxs,
    },
    placeName: {
        ...theme.typography.bodyLarge,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
    placeCategory: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
        fontWeight: '600',
    },
})