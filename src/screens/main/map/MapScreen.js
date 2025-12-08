import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';
import CurrentLocationMarker from '../../../components/ui/CurrentLocationMarker';
import MapUtils from '../../../utils/MapUtils';
import ListScreen from './ListScreen';
import MapsController from '../../../controllers/maps/MapsController';
import ReferralController from '../../../controllers/referrals/ReferralController';
import PlaceCard from '../../../components/ui/PlaceCard';
import PlaceSelectedCard from '../../../components/ui/PlaceSelectedCard';
import AsyncStoreUtils from '../../../utils/AsyncStoreUtils';
import ConfettiCannon from '../../../components/animated/ConfettiCannon';
import ApiController from '../../../services/api/ApiController';
import LocationUtils from '../../../utils/LocationUtils';

const customMapStyle = [
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.attraction',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.place_of_worship',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.school',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'poi.sports_complex',
        stylers: [{ visibility: 'off' }]
    }
];

// Helper function to ensure location coordinates are numbers
const normalizeLocation = (location) => {
    if (!location) return null;
    return {
        latitude: typeof location.latitude === 'string' ? parseFloat(location.latitude) : Number(location.latitude),
        longitude: typeof location.longitude === 'string' ? parseFloat(location.longitude) : Number(location.longitude),
        latitudeDelta: typeof location.latitudeDelta === 'string' ? parseFloat(location.latitudeDelta) : Number(location.latitudeDelta || 0.01),
        longitudeDelta: typeof location.longitudeDelta === 'string' ? parseFloat(location.longitudeDelta) : Number(location.longitudeDelta || 0.01),
    };
};

const MapScreen = ({ navigation }) => {
    const profileMutation = ApiController.profile();
    const referralsMutation = ApiController.referrals();
    const referPlaceMutation = ApiController.referPlace();
    const nearbyPlacesMutation = ApiController.nearbyPlaces();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const getInitialRegion = () => {
        if (global.userLastLocation) {
            // Ensure coordinates are numbers
            return {
                latitude: typeof global.userLastLocation.latitude === 'string' ? parseFloat(global.userLastLocation.latitude) : Number(global.userLastLocation.latitude),
                longitude: typeof global.userLastLocation.longitude === 'string' ? parseFloat(global.userLastLocation.longitude) : Number(global.userLastLocation.longitude),
                latitudeDelta: typeof global.userLastLocation.latitudeDelta === 'string' ? parseFloat(global.userLastLocation.latitudeDelta) : Number(global.userLastLocation.latitudeDelta || 0.03),
                longitudeDelta: typeof global.userLastLocation.longitudeDelta === 'string' ? parseFloat(global.userLastLocation.longitudeDelta) : Number(global.userLastLocation.longitudeDelta || 0.03),
            };
        }
        return {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        };
    };
    const [region, setRegion] = useState(getInitialRegion());
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const mapRef = useRef(null);
    const setIsSearchFilterVisible = SearchFilterController.getState().setIsSearchFilterVisible;
    const placesListRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const animationTimeoutRef = useRef(null);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const markerPressRef = useRef(false);
    const shouldFetchPlacesRef = useRef(false);

    const placeReferredStatus = ReferralController(state => state.placeReferredStatus);
    const setPlaceReferredStatus = ReferralController(state => state.setPlaceReferredStatus);

    const timeoutRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastProcessedStatusRef = useRef(false);
    const lastProcessedPlaceIdRef = useRef(null);

    // Hide status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setIsScreenFocused(true);
            return () => {
                setIsScreenFocused(false);
            };
        }, [])
    );

    const places = MapsController(state => state.places);

    const selectedViewType = MapsController(state => state.selectedViewType);
    const setSelectedViewType = MapsController.getState().setSelectedViewType;
    const showPlaceFullCard = MapsController(state => state.showPlaceFullCard);
    const setShowPlaceFullCard = MapsController.getState().setShowPlaceFullCard;
    const selectedPlace = MapsController(state => state.selectedPlace);
    const setSelectedPlace = MapsController.getState().setSelectedPlace;
    const setPlaces = MapsController.getState().setPlaces;
    const userLocation = MapsController(state => state.userLocation);
    const setShowPlaceBigCard = MapsController.getState().setShowPlaceBigCard;
    const centerLocation = MapsController(state => state.centerLocation);
    const setCenterLocation = MapsController.getState().setCenterLocation;
    const showConfetti = MapsController(state => state.showConfetti);
    const confettiOrigin = MapsController(state => state.confettiOrigin);
    const setShowConfetti = MapsController.getState().setShowConfetti;


    React.useEffect(() => {
        const filterData = selectedFilter === 'all'
            ? places
            : places.filter(place => place.category === selectedFilter);
        setFilteredPlaces(filterData);
    }, [places, selectedFilter]);

    const handleMapPress = () => {
        // Don't deselect if a marker was just pressed (prevents deselection when clicking markers)
        if (markerPressRef.current) {
            markerPressRef.current = false;
            return;
        }
        // Deselect place when map is tapped to return to dynamic view
        if (selectedPlace) {
            setSelectedPlace(null);
            setShowPlaceBigCard(false);
            setShowPlaceFullCard(false);
        }
    };

    const centerOnLocation = React.useCallback(() => {
        if (!centerLocation || !mapRef.current || !isMapReady || !isScreenFocused) {
            console.warn('Cannot animate map: missing centerLocation, mapRef, map not ready, or screen not focused');
            return;
        }

        // Ensure all coordinates are numbers (may be strings from AsyncStorage)
        const normalizedRegion = normalizeLocation(centerLocation);
        if (!normalizedRegion) {
            console.warn('Invalid centerLocation, cannot normalize');
            return;
        }

        try {
            mapRef.current.animateToRegion(normalizedRegion, 1000);
        } catch (error) {
            console.error('Error animating map region:', error);
            // Fallback to setRegion if animation fails
            try {
                mapRef.current.setRegion(normalizedRegion);
            } catch (fallbackError) {
                console.error('Fallback setRegion also failed:', fallbackError);
            }
        } finally {
            timeoutRef.current = setTimeout(() => {
                setRegion(normalizedRegion);
            }, 1000);
        }
    }, [centerLocation, isMapReady, isScreenFocused]);

    const referPlace = useCallback(async (place) => {
        if (!place || isProcessingRef.current) {
            return;
        }

        isProcessingRef.current = true;

        try {
            referPlaceMutation.mutateAsync({ place: place, placeId: place.id, action: place.isReferred ? 'unrefer' : 'refer' });
            if (place.isReferred) {
                // unrefer place
                const updatedPlaces = places.map(p => p.id === place.id ? { ...p, isReferred: false } : p);
                setPlaces(updatedPlaces);
                setSelectedPlace(prev => prev?.id === place.id ? { ...prev, isReferred: false } : prev);
            } else {
                // refer place
                const updatedPlaces = places.map(p => p.id === place.id ? { ...p, isReferred: true } : p);
                setPlaces(updatedPlaces);
                setSelectedPlace(prev => prev?.id === place.id ? { ...prev, isReferred: true } : prev);
            }
        } finally {
            // Reset the flag after a short delay to allow state updates to complete
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 100);
        }
    }, [places, setPlaces, setSelectedPlace, referPlaceMutation]);

    React.useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (!isScreenFocused) {
            setSelectedPlace(null);
            // Reset processing flag when screen loses focus to prevent stuck state
            isProcessingRef.current = false;
            lastProcessedStatusRef.current = false;
            lastProcessedPlaceIdRef.current = null;
        }
    }, [isScreenFocused, setSelectedPlace]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
            isProcessingRef.current = false;
            lastProcessedStatusRef.current = false;
            lastProcessedPlaceIdRef.current = null;
        };
    }, []);

    const showPlaceCard = ({ place, scroll }) => {
        // Set flag to prevent map's onPress from deselecting when marker is pressed
        markerPressRef.current = true;

        // Find the updated place from places array to get the latest isReferred status
        const updatedPlace = places.find(p => p.id === place.id) || place;

        // If clicking the same marker that's already selected, keep it selected (don't do anything)
        if (selectedPlace?.id === updatedPlace.id) {
            // Reset the flag after a short delay to allow map press to work normally
            setTimeout(() => {
                markerPressRef.current = false;
            }, 100);
            return;
        }

        setSelectedPlace(updatedPlace);
        setShowPlaceBigCard(true);
        // When showing a specific place card, zoom to that place with fixed delta
        const location = normalizeLocation({
            latitude: updatedPlace.latitude,
            longitude: updatedPlace.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        });
        setCenterLocation(location);
        if (scroll && placesListRef.current) {
            // Find the index of the place in filteredPlaces array
            const placeIndex = filteredPlaces.findIndex(p => p.id === updatedPlace.id);
            if (placeIndex !== -1) {
                // Use setTimeout to ensure the FlatList is ready and rendered
                setTimeout(() => {
                    try {
                        placesListRef.current.scrollToIndex({
                            index: placeIndex,
                            viewPosition: 0.5,
                            animated: true
                        });
                    } catch (error) {
                        // Fallback to scrollToOffset if scrollToIndex fails
                        const itemWidth = theme.responsive.screen().width;
                        placesListRef.current.scrollToOffset({
                            offset: placeIndex * itemWidth,
                            animated: true
                        });
                    }
                }, 100);
            }
        }

        // Reset the flag after a short delay to allow map press to work normally
        setTimeout(() => {
            markerPressRef.current = false;
        }, 100);
    };
    const updateUserLastLocation = (userLocation) => {
        if (userLocation) {
            AsyncStoreUtils.setItem(AsyncStoreUtils.Keys.USER_LAST_LOCATION, userLocation);
        }
    }

    React.useEffect(() => {
        if (centerLocation?.latitude && centerLocation?.longitude && isScreenFocused && isMapReady) {
            referralsMutation.mutateAsync({ latitude: centerLocation.latitude, longitude: centerLocation.longitude });
            centerOnLocation();
        }
    }, [centerLocation?.latitude, centerLocation?.longitude, isScreenFocused, isMapReady, centerOnLocation]);

    React.useEffect(() => {
        if (userLocation && places.length === 0) {
            updateUserLastLocation(userLocation);
            const location = normalizeLocation({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            });
            setCenterLocation(location);
        }
    }, [userLocation, places.length]);

    // Fetch places when userLocation changes after button press
    React.useEffect(() => {
        if (userLocation && shouldFetchPlacesRef.current) {
            shouldFetchPlacesRef.current = false;
            nearbyPlacesMutation.mutateAsync({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: 10000
            });
        }
    }, [userLocation]);

    // Update region when filteredPlaces change to fit all places
    React.useEffect(() => {
        if (filteredPlaces.length > 0 && !selectedPlace && isScreenFocused && isMapReady) {
            const calculatedRegion = MapUtils.getRegionForPlaces(filteredPlaces);
            if (calculatedRegion) {
                // Only update if the region is significantly different to avoid unnecessary re-renders
                const normalizedRegion = normalizeLocation(calculatedRegion);
                setCenterLocation(normalizedRegion);
            }
        }
    }, [filteredPlaces, selectedPlace, isScreenFocused, isMapReady]);

    React.useEffect(() => {
        // Reset processed flags if selectedPlace changed to a different place
        if (selectedPlace && lastProcessedPlaceIdRef.current !== null && lastProcessedPlaceIdRef.current !== selectedPlace.id) {
            lastProcessedStatusRef.current = false;
            lastProcessedPlaceIdRef.current = null;
        }

        // Only process if:
        // 1. placeReferredStatus is true
        // 2. We have a selectedPlace
        // 3. We're not already processing
        // 4. We haven't already processed this status for this place
        const shouldProcess = placeReferredStatus &&
            selectedPlace &&
            !isProcessingRef.current &&
            (lastProcessedPlaceIdRef.current !== selectedPlace.id || !lastProcessedStatusRef.current);

        if (shouldProcess) {
            // Mark as processed immediately to prevent re-processing
            lastProcessedStatusRef.current = true;
            lastProcessedPlaceIdRef.current = selectedPlace.id;
            // Reset status BEFORE calling referPlace to prevent re-triggering
            setPlaceReferredStatus(false);
            // Call referPlace
            referPlace(selectedPlace);
        } else if (!placeReferredStatus) {
            // Reset the processed flags when status goes back to false
            lastProcessedStatusRef.current = false;
            lastProcessedPlaceIdRef.current = null;
        }
    }, [placeReferredStatus, selectedPlace, referPlace, setPlaceReferredStatus]);

    // Load stored location from AsyncStorage on mount if not already set
    React.useEffect(() => {
        const loadStoredLocation = async () => {
            if (!userLocation) {
                const storedLocation = await AsyncStoreUtils.getItem(AsyncStoreUtils.Keys.USER_LAST_LOCATION);
                if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
                    MapsController.getState().setUserLocation(storedLocation);
                    const location = normalizeLocation({
                        latitude: storedLocation.latitude,
                        longitude: storedLocation.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                    });
                    setCenterLocation(location);
                }
            }
        };
        loadStoredLocation();
    }, []);

    // Cleanup animation timeout on unmount
    React.useEffect(() => {
        profileMutation.mutateAsync();
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        // Reset confetti after animation completes
        if (showConfetti) {
            const timer = setTimeout(() => {
                setShowConfetti(false, null);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [showConfetti, setShowConfetti]);

    const handleLocationButtonPress = async () => {
        // Always fetch current location when user clicks the button
        shouldFetchPlacesRef.current = true;
        LocationUtils.getCurrentLocation();
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={[]}>
            <View style={styles.container}>

                {/* Interactive Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={MapUtils.Provider}
                        onPress={handleMapPress}
                        region={region}
                        onMapReady={() => setIsMapReady(true)}
                        showsUserLocation={false}
                        showsMyLocationButton={false}
                        showsCompass={false}
                        showsScale={false}
                        showsBuildings={true}
                        showsTraffic={false}
                        showsIndoors={true}
                        mapType="standard"
                        userInterfaceStyle="light"
                        pointsOfInterestEnabled={false}

                        customMapStyle={customMapStyle}
                    >
                        {selectedViewType === 'map' && filteredPlaces.length > 0 && filteredPlaces.map((place, index) => (
                            <Marker
                                key={place.id}
                                coordinate={{
                                    latitude: place.latitude,
                                    longitude: place.longitude,
                                }}
                                onPress={() => showPlaceCard({ place, scroll: true })}
                            >
                                <View style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 25,
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                }}>
                                    <View style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        {place.isReferred ? (
                                            selectedPlace?.id === place.id ? (
                                                <IconAsset.markerIconReferredSelected
                                                    width={50}
                                                    height={50}
                                                />
                                            ) : (
                                                <IconAsset.markerIconReferred
                                                    width={50}
                                                    height={50}
                                                />
                                            )
                                        ) : (
                                            selectedPlace?.id === place.id ? (
                                                <IconAsset.markerIconSvgSelected
                                                    width={50}
                                                    height={50}
                                                />
                                            ) : (
                                                <IconAsset.markerIconSvg
                                                    width={50}
                                                    height={50}
                                                />
                                            )
                                        )}
                                    </View>
                                    <View style={{
                                        height: 35,
                                        width: 35,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            color: 'white',
                                            fontSize: 14,
                                            fontWeight: '900',
                                        }}>
                                            {index + 1}
                                        </Text>
                                    </View>
                                </View>
                            </Marker>
                        ))}

                        {/* User Current Location Marker */}
                        {userLocation && (
                            <Marker
                                coordinate={userLocation}
                                anchor={{ x: 0.5, y: 0.5 }}
                                centerOffset={{ x: 0, y: 0 }}
                            >
                                <CurrentLocationMarker size="medium" />
                            </Marker>
                        )}
                    </MapView>
                    {
                        selectedViewType === 'map'
                            ? <View style={styles.placesContainer}>
                                <View style={styles.viewTypeContainer}>
                                    <Pressable onPress={() => setSelectedViewType('list')} style={[styles.viewTypeIconContainer, selectedViewType === 'list' && styles.viewTypeIconContainerActive]}>
                                        <IconAsset.listViewIcon
                                            width={24}
                                            height={24}
                                        />
                                    </Pressable>
                                    <Pressable onPress={() => setSelectedViewType('map')} style={[styles.viewTypeIconContainer, selectedViewType === 'map' && styles.viewTypeIconContainerActive]}>
                                        <IconAsset.bottomTab.unSelected.mapIcon
                                            width={24}
                                            height={24}
                                        />
                                    </Pressable>
                                </View>
                                <FlatList
                                    ref={placesListRef}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    data={filteredPlaces}
                                    renderItem={({ item, index }) => selectedPlace?.id === item.id ? <PlaceSelectedCard /> : <PlaceCard place={item} />}
                                    keyExtractor={(item) => item.id}
                                    snapToInterval={theme.responsive.screen().width}
                                    decelerationRate="fast"
                                    snapToAlignment="center"
                                    pagingEnabled={true}
                                    scrollEnabled={true}
                                    contentContainerStyle={styles.placeCardContainer}
                                    getItemLayout={(data, index) => ({
                                        length: theme.responsive.screen().width,
                                        offset: theme.responsive.screen().width * index,
                                        index,
                                    })}
                                    onScroll={(event) => {
                                        const contentOffset = event.nativeEvent.contentOffset.x;
                                        const itemWidth = theme.responsive.screen().width;
                                        const focusedIndex = Math.round(contentOffset / itemWidth);
                                    }}
                                    scrollEventThrottle={16}
                                />

                                <View style={{
                                    height: showPlaceFullCard ? theme.responsive.size(60) : 0,
                                }} />
                            </View>
                            : <View style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: '#EFEFEFDC',
                            }} />
                    }
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity activeOpacity={1} style={styles.locationButton} onPress={handleLocationButtonPress}>
                        <IconAsset.locationIcon
                            width={30}
                            height={30}
                        />
                    </TouchableOpacity>
                    {/* Search input */}
                    <TouchableOpacity activeOpacity={1} style={styles.searchContainer} onPress={() => navigation.navigate('Search')}  >
                        {/* Search icon */}
                        <IconAsset.searchIcon
                            width={24}
                            height={24}
                        />
                        {/* Search input */}
                        <View style={styles.searchInput}>
                            <Text style={styles.searchInputText}>Search now...</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={styles.filterButton} onPress={() => setIsSearchFilterVisible({ isSearchFilterVisible: true })}>
                        <IconAsset.filterIcon
                            width={30}
                            height={30}
                        />
                    </TouchableOpacity>
                </View>

                {/* list View */}
                {selectedViewType === 'list' && <ListScreen />}

                <ConfettiCannon
                    visible={showConfetti}
                    origin={confettiOrigin}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.responsive.isSmall() ? theme.spacing.xxl : theme.spacing.xxxl,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    mapContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    map: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: -60
    },
    locationButton: {
        width: theme.responsive.size(55),
        height: theme.responsive.size(55),
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationButtonText: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.primary,
        fontWeight: '700',
    },
    filterButton: {
        width: theme.responsive.size(55),
        height: theme.responsive.size(55),
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    filterButtonActive: {
        backgroundColor: theme.colors.primary[500],
    },
    filterButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.text.secondary,
    },
    filterButtonTextActive: {
        color: theme.colors.background.primary,
    },
    placeCardContainer: {
        alignItems: 'flex-end',
    },
    placesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
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
    // SVG Curved Card Styles
    svgCardContainer: {
    },
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
    placeCardImageFull: {
        width: '100%',
        height: theme.responsive.size(124),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    placeCardImage: {
        width: theme.responsive.size(80),
        height: theme.responsive.size(80),
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
    searchContainer: {
        flex: 1,
        gap: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        paddingHorizontal: theme.spacing.md,
        height: 55,
        ...theme.shadows.large,
    },
    searchInput: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
    },
    searchInputText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
    },
    viewTypeContainer: {
        alignSelf: 'flex-start',
        margin: theme.spacing.lg,
        backgroundColor: theme.colors.background.light,
        padding: theme.spacing.xs,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.small,
    },
    viewTypeIconContainer: {
        width: theme.responsive.size(40),
        height: theme.responsive.size(40),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius.md,
    },
    viewTypeIconContainerActive: {
        backgroundColor: theme.colors.background.white,
        ...theme.shadows.small,
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
});

export default MapScreen; 