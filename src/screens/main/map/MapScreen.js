import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    Pressable,
    Platform,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import MapView, { Animated as AnimatedMap, AnimatedRegion, Marker, AnimatedMapView } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import AppImage from '../../../components/common/AppImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAsset from '../../../assets/images/ImageAsset';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';
import CurvedCard from '../../../components/ui/CurvedCard';
import CurrentLocationMarker from '../../../components/ui/CurrentLocationMarker';
import ToastUtils from '../../../utils/ToastUtils';
import MapUtils from '../../../utils/MapUtils';
import ListScreen from './ListScreen';
import MapsController from '../../../controllers/maps/MapsController';
import FirebaseStoreService from '../../../services/firebase/FirebaseStoreService';
import ReferralController from '../../../controllers/referrals/ReferralController';

const MapScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.032,
        longitudeDelta: 0.032,
    });
    const [placeUpdated, setPlaceUpdated] = useState(false);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [centerLocation, setCenterLocation] = useState(null);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const mapRef = useRef(null);
    const bottomSheetRef = useRef(null);
    const { isSearchFilterVisible, setIsSearchFilterVisible } = SearchFilterController();
    const placesListRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const animationTimeoutRef = useRef(null);
    const [showPlaceBigCard, setShowPlaceBigCard] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const [focusedPlaceIndex, setFocusedPlaceIndex] = useState(0);
    const isFocused = useIsFocused();

    const { setShowReferralAlert, placeReferredStatus } = ReferralController();

    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isFocused) {
            setTimeout(() => {
                requestLocationPermission();
            }, 1000);

        }
    }, [isFocused]);

    // Hide status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setIsScreenFocused(true);
            return () => {
                setIsScreenFocused(false);
            };
        }, [])
    );

    const { selectedViewType, setSelectedViewType, showPlaceFullCard, setShowPlaceFullCard, selectedPlace, setSelectedPlace, places, setPlaces, userLocation, setUserLocation } = MapsController();

    const requestLocationPermission = async () => {
        try {
            setIsLoadingLocation(true);

            // Determine the correct permission based on platform
            const locationPermission = Platform.OS === 'ios'
                ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

            // Check current permission status
            const permissionStatus = await check(locationPermission);

            if (permissionStatus === RESULTS.GRANTED) {
                setLocationPermissionGranted(true);
                getCurrentLocation();
                return;
            }

            if (permissionStatus === RESULTS.DENIED) {
                // Request permission
                const requestResult = await request(locationPermission);

                if (requestResult === RESULTS.GRANTED) {
                    setLocationPermissionGranted(true);
                    getCurrentLocation();
                } else {
                    handleLocationPermissionDenied();
                }
            } else {
                handleLocationPermissionDenied();
            }
        } catch (error) {
            ToastUtils.error('Failed to request location permission');
            setIsLoadingLocation(false);
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (!isFocused) {
                    setIsLoadingLocation(false);
                    return;
                }
                const { latitude, longitude } = position.coords;
                const newUserLocation = { latitude, longitude };

                setUserLocation(newUserLocation);
                setIsLoadingLocation(false);

                // Center map on user location
                const newRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.032,
                    longitudeDelta: 0.032,
                };
                setCenterLocation(newRegion);

                if (placeUpdated) {
                    return;
                }

                // update places lat and long based on current location create new lat and long randomly within 3000 meters of the current location
                // const updatedPlaces = places.map(place => ({
                //     ...place,
                //     latitude: latitude + (Math.random() * 0.03 - 0.015),
                //     longitude: longitude + (Math.random() * 0.03 - 0.015),
                // }));
                // setPlaces(updatedPlaces); 
            },
            (error) => {
                setIsLoadingLocation(false);

                switch (error.code) {
                    case 1:
                        ToastUtils.error('Location access denied');
                        break;
                    case 2:
                        ToastUtils.error('Location unavailable');
                        break;
                    case 3:
                        ToastUtils.error('Location request timeout');
                        break;
                    default:
                        ToastUtils.error('Failed to get location');
                        break;
                }

                // Fallback to default location
                setUserLocation({
                    latitude: 37.78825,
                    longitude: -122.4324,
                });
            },
            {
                enableHighAccuracy: true,
            }
        );
    };

    const handleLocationPermissionDenied = () => {
        setLocationPermissionGranted(false);
        setIsLoadingLocation(false);

        ToastUtils.warning('Location permission denied. Using default location.', {
            title: 'Location Access',
        });

        // Use default location
        setUserLocation({
            latitude: 37.78825,
            longitude: -122.4324,
        });
    };

    const centerOnUserLocation = () => {
        if (locationPermissionGranted && userLocation) {
            getCurrentLocation();
        } else {
            requestLocationPermission();
        }
    };

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'restaurants', label: 'Restaurants' },
        { id: 'shops', label: 'Shops' },
        { id: 'services', label: 'Services' },
    ];


    const renderFilterButton = (filter) => (
        <TouchableOpacity
            key={filter.id}
            style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter.id)}
            activeOpacity={1}
        >
            <Text
                style={[
                    styles.filterButtonText,
                    selectedFilter === filter.id && styles.filterButtonTextActive,
                ]}
            >
                {filter.label}
            </Text>
        </TouchableOpacity>
    );

    React.useEffect(() => {
        const filterData = selectedFilter === 'all'
            ? places
            : places.filter(place => place.category === selectedFilter);
        setFilteredPlaces(filterData);
    }, [places, selectedFilter]);

    const handleMapPress = () => {
        // Handle map press if needed
    };

    const handleMarkerPress = (place) => {
        Alert.alert(
            place.name,
            `${place.category} • ${place.distance} • ⭐ ${place.rating}`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Directions', onPress: () => { } },
            ]
        );
    };

    const centerOnLocation = React.useCallback(() => {
        if (!centerLocation || !mapRef.current || !isMapReady || !isScreenFocused) {
            console.warn('Cannot animate map: missing centerLocation, mapRef, map not ready, or screen not focused');
            return;
        }

        try {
            mapRef.current.animateToRegion(centerLocation, 1000);
        } catch (error) {
            console.error('Error animating map region:', error);
            // Fallback to setRegion if animation fails
            try {
                mapRef.current.setRegion(centerLocation);
            } catch (fallbackError) {
                console.error('Fallback setRegion also failed:', fallbackError);
            }
        } finally {
            timeoutRef.current = setTimeout(() => {
                setRegion(centerLocation);
            }, 1000);
        }
    }, [centerLocation, isMapReady, isScreenFocused]);

    const referPlace = async (place) => {
        //     if (!place?.isReferred) {
        //         setShowReferralAlert(true);
        //     }
        // };

        // const referPlaceSubmit = async (place) => {
        await FirebaseStoreService.storeReferredPlace(place);
        if (place.isReferred) {
            // unrefer place
            setFilteredPlaces(filteredPlaces.map(p => p.id === place.id ? { ...p, isReferred: false } : p));
            setPlaces(places.map(p => p.id === place.id ? { ...p, isReferred: false } : p));
            setSelectedPlace(prev => prev.id === place.id ? { ...prev, isReferred: false } : prev);
            return;
        }
        setFilteredPlaces(filteredPlaces.map(p => p.id === place.id ? { ...p, isReferred: true } : p));
        setPlaces(places.map(p => p.id === place.id ? { ...p, isReferred: true } : p));
        setSelectedPlace(prev => prev.id === place.id ? { ...prev, isReferred: true } : prev);
    };

    React.useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [isScreenFocused]);

    const renderSelectedPlaceCard = React.useCallback(() => {
        return (
            <Pressable style={[styles.placeCardBig, { opacity: showPlaceFullCard ? 0 : 1 }]} onPress={() => {
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
                                placeholderSource={selectedPlace?.image}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: theme.borderRadius.sm,
                                    resizeMode: 'cover',
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

                <Pressable style={styles.placeCardFooter} onPress={() => referPlace(selectedPlace)}>
                    <View style={[styles.placeCardFooterContent, selectedPlace.isReferred && styles.placeCardFooterContentReferred]}>
                        <AppImage
                            source={ImageAsset.logos.logoSmall}
                            style={styles.placeLogo}
                        />
                    </View>
                </Pressable>
            </Pressable>
        )
    }, [selectedPlace, showPlaceFullCard, showPlaceBigCard]);

    const renderPlaceCard = ({ item, index }) => {
        const place = item;
        if (selectedPlace?.id === place.id && (showPlaceFullCard || showPlaceBigCard)) {
            return renderSelectedPlaceCard();
        }

        // Calculate opacity based on distance from focused index
        const distanceFromFocused = Math.abs(index - focusedPlaceIndex);
        const opacity = distanceFromFocused === 0 ? 1 : Math.max(0.2, 1 - (distanceFromFocused * 0.7));

        return (
            <>
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
                                placeholderSource={place.image}
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
            </>
        )
    }

    const showPlaceCard = ({ place, scroll }) => {
        setSelectedPlace(place);
        setShowPlaceBigCard(true);
        const location = {
            latitude: place.latitude,
            longitude: place.longitude,
            latitudeDelta: 0.032,
            longitudeDelta: 0.032,
        };
        setCenterLocation(location);
        try {
            if (scroll) {
                placesListRef.current.scrollToIndex({ index: place.rank - 1, viewPosition: 0.5 });
            }
        } catch (error) {
        }
    };

    React.useEffect(() => {
        if (centerLocation?.latitude && centerLocation?.longitude && isScreenFocused) {
            centerOnLocation();
        }
    }, [centerLocation?.latitude, centerLocation?.longitude, isScreenFocused]);

    React.useEffect(() => {
        if (userLocation) {
            const location = {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.032,
                longitudeDelta: 0.032,
            };
            setCenterLocation(location);

            FirebaseStoreService.getPlacesOfCurrentLocation(userLocation).then(places => {
                setPlaces(places);
                setPlaceUpdated(true);
            });
        }
    }, [userLocation]);

    React.useEffect(() => {
        if (placeReferredStatus) {
            referPlaceSubmit(selectedPlace);
        }
    }, [placeReferredStatus]);

    // Cleanup animation timeout on unmount
    React.useEffect(() => {
        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, []);

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
                                        {selectedPlace?.id === place.id ? (
                                            <IconAsset.markerIconSvgSelected
                                                width={50}
                                                height={50}
                                            />
                                        ) : (
                                            <IconAsset.markerIconSvg
                                                width={50}
                                                height={50}
                                            />
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
                                    renderItem={renderPlaceCard}
                                    keyExtractor={(item) => item.id}
                                    snapToInterval={theme.responsive.screen().width}
                                    decelerationRate="fast"
                                    snapToAlignment="center"
                                    pagingEnabled={true}
                                    scrollEnabled={true}
                                    contentContainerStyle={styles.placeCardContainer}
                                    onScroll={(event) => {
                                        const contentOffset = event.nativeEvent.contentOffset.x;
                                        const itemWidth = theme.responsive.screen().width;
                                        const focusedIndex = Math.round(contentOffset / itemWidth);
                                        setFocusedPlaceIndex(Math.max(0, Math.min(focusedIndex, filteredPlaces.length - 1)));
                                    }}
                                    scrollEventThrottle={16}
                                />

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
        gap: theme.spacing.md,
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
        position: 'absolute', top: 0, left: 0, right: 0, bottom: -25
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