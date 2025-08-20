import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    FlatList,
    ImageBackground,
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
import SearchFilter from '../../../components/ui/SearchFilter';
import RBSheet from 'react-native-raw-bottom-sheet';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';
import CurvedCard from '../../../components/ui/CurvedCard';
import CurrentLocationMarker from '../../../components/ui/CurrentLocationMarker';
import ToastUtils from '../../../utils/ToastUtils';
import Animated from 'react-native-reanimated';
import MapUtils from '../../../utils/MapUtils';

const nearbyPlaces = [
    {
        id: '1',
        name: 'Boucherie Union Square',
        address: '225 Park Ave, New York',
        description: 'Boucherie is a traditional French restaurant, celebrating joie de vivre in the heart of West Village.',
        category: 'restaurants',
        website: 'boucherie.nyc',
        openTime: 'Tue - Sun: 08:00 - 23:00',
        distance: '0.2 km',
        rating: 4.5,
        isOpen: true,
        latitude: 37.78725,
        longitude: -122.4314,
        rank: 1,
        image: ImageAsset.places.place01,
        imageFull: ImageAsset.places.placeFull01,
        isReferred: false,
    },
    {
        id: '2',
        name: 'Grocery Store',
        address: '225 Park Ave, New York',
        description: 'Boucherie is a traditional French restaurant, celebrating joie de vivre in the heart of West Village.',
        category: 'shops',
        website: 'grocery.nyc',
        openTime: 'Mon - Sat: 08:00 - 23:00',
        distance: '0.5 km',
        rating: 4.2,
        isOpen: true,
        latitude: 37.77925,
        longitude: -122.4234,
        rank: 2,
        image: ImageAsset.places.place01,
        imageFull: ImageAsset.places.placeFull01,
        isReferred: false,
    },
    {
        id: '3',
        name: 'Bank Branch',
        address: '225 Park Ave, New York',
        description: 'Boucherie is a traditional French restaurant, celebrating joie de vivre in the heart of West Village.',
        category: 'services',
        website: 'bank.nyc',
        openTime: 'Mon - Sat: 08:00 - 23:00',
        distance: '0.8 km',
        rating: 4.0,
        isOpen: false,
        latitude: 37.77725,
        longitude: -122.4214,
        rank: 3,
        image: ImageAsset.places.place01,
        imageFull: ImageAsset.places.placeFull01,
        isReferred: false,
    },
    {
        id: '4',
        name: 'Pizza Place',
        address: '225 Park Ave, New York',
        description: 'Boucherie is a traditional French restaurant, celebrating joie de vivre in the heart of West Village.',
        category: 'restaurants',
        website: 'pizza.nyc',
        openTime: 'Mon - Sat: 08:00 - 23:00',
        distance: '1.1 km',
        rating: 4.7,
        isOpen: true,
        latitude: 37.78025,
        longitude: -122.4204,
        rank: 4,
        image: ImageAsset.places.place01,
        imageFull: ImageAsset.places.placeFull01,
        isReferred: false,
    },
];
const MapScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.032,
        longitudeDelta: 0.032,
    });
    const [places, setPlaces] = useState(nearbyPlaces);
    const [placeUpdated, setPlaceUpdated] = useState(false);
    const [filteredPlaces, setFilteredPlaces] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [centerLocation, setCenterLocation] = useState(null);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const mapRef = useRef(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const bottomSheetRef = useRef(null);
    const { isSearchFilterVisible, setIsSearchFilterVisible } = SearchFilterController();
    const placesListRef = useRef(null);
    const [selectedViewType, setSelectedViewType] = useState('map');
    const [isMapReady, setIsMapReady] = useState(false);
    const animationTimeoutRef = useRef(null);
    const [showPlaceBigCard, setShowPlaceBigCard] = useState(false);
    const [showPlaceFullCard, setShowPlaceFullCard] = useState(false);
    const [isScreenFocused, setIsScreenFocused] = useState(false);
    const isFocused = useIsFocused();

    const timeoutRef = useRef(null);

    useEffect(() => {
        if (isFocused) {
            requestLocationPermission();
        }
    }, [isFocused]);

    // Hide status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            StatusBar.setHidden(true);
            setIsScreenFocused(true);
            return () => {
                StatusBar.setHidden(false);
                setIsScreenFocused(false);
            };
        }, [])
    );

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
            console.log('Location permission error:', error);
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
                const updatedPlaces = places.map(place => ({
                    ...place,
                    latitude: latitude + (Math.random() * 0.03 - 0.015),
                    longitude: longitude + (Math.random() * 0.03 - 0.015),
                }));
                setPlaces(updatedPlaces);
                setPlaceUpdated(true);
            },
            (error) => {
                console.log('Geolocation error:', error);
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
            activeOpacity={0.8}
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
                { text: 'Directions', onPress: () => console.log('Directions to', place.name) },
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

    const referPlace = (place) => {
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
            <Pressable style={[styles.placeCardBig, { opacity: showPlaceFullCard ? 0 : 1 }]} activeOpacity={0.8} onPress={() => {
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
                    width={theme.responsive.width(theme.responsive.screen().width * 0.8)}
                    height={theme.responsive.size(220)}
                    curveDepth={40}
                    cornerRadius={theme.borderRadius.lg}
                    style={styles.svgCardContainer}
                >
                    <View style={styles.placeCardHeader}>
                        <View style={styles.placeCardImageFull}>
                            <AppImage
                                source={selectedPlace?.imageFull}
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

    const renderPlaceCard = (place) => {
        if (selectedPlace?.id === place.id && (showPlaceFullCard || showPlaceBigCard)) {
            return renderSelectedPlaceCard();
        }
        return (
            <>
                <TouchableOpacity

                    key={place.id}
                    style={[styles.placeCard]}
                    activeOpacity={0.8}
                    onPress={() => showPlaceCard({ place, scroll: false })}
                >
                    <View style={styles.placeCardHeader}>
                        <View style={styles.placeCardImage}>
                            <AppImage
                                source={place.image}
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
            console.log('Error scrolling to place:', error);
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
        }
    }, [userLocation]);

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
                    >
                        {filteredPlaces.map((place) => (
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
                                            {place.rank}
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

                    <View style={styles.placesContainer}>
                        <View style={styles.viewTypeContainer}>
                            <Pressable onPress={() => {
                                ToastUtils.info('List view is not available yet', {
                                    title: 'List view',
                                });
                            }} style={[styles.viewTypeIconContainer, selectedViewType === 'list' && styles.viewTypeIconContainerActive]}>
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
                            renderItem={({ item }) => renderPlaceCard(item)}
                            keyExtractor={(item) => item.id}
                            snapToInterval={theme.responsive.width(theme.responsive.screen().width * 0.8) + theme.spacing.lg}
                            decelerationRate="fast"
                            snapToAlignment="center"
                            pagingEnabled={true}
                            scrollEnabled={true}
                            contentContainerStyle={styles.placeCardContainer}
                        />

                    </View>
                </View>


                {/* Header */}
                <View style={styles.header}>
                    {/* Search input */}
                    <TouchableOpacity style={styles.searchContainer} onPress={() => navigation.navigate('Search')}  >
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
                    <TouchableOpacity style={styles.filterButton} onPress={() => setIsSearchFilterVisible(true)}>
                        <IconAsset.filterIcon
                            width={30}
                            height={30}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            {
                showPlaceFullCard && (
                    <View style={[styles.selectedPlaceFullCard, {
                        transform: [{
                            scale: showPlaceFullCard ? 1 : 0,
                        }],
                    }]}>
                        <View style={styles.selectedPlaceFullCardBackground}>
                            <AppImage
                                source={selectedPlace?.imageFull}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: theme.borderRadius.sm,
                                    resizeMode: 'stretch',
                                }}
                            />
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
                                <View style={styles.selectedPlaceFullCardButtonItem}>
                                    <IconAsset.shareIcon
                                        width={24}
                                        height={24}
                                    />
                                </View>
                            </View>
                        </SafeAreaView>

                        <View style={{
                            width: theme.responsive.screen().width,
                            paddingTop: theme.responsive.size(40),
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
                                width={theme.responsive.screen().width}
                                height={theme.responsive.screen().height * 0.5}
                                curveDepth={40}
                                cornerRadius={theme.borderRadius.lg}
                            >
                                <View style={styles.selectedPlaceFullCardInfo}>
                                    <View style={styles.selectedPlaceFullCardInfoItem}>
                                        <Text style={styles.selectedPlaceFullCardInfoItemHeaderText}>
                                            {selectedPlace?.name}
                                        </Text>
                                        <Text style={styles.selectedPlaceFullCardInfoItemSubText}>
                                            {selectedPlace?.address}
                                        </Text>
                                        <View style={styles.selectedPlaceFullCardTagsContainer}>
                                            <View style={styles.selectedPlaceFullCardTagItem}>
                                                <Text style={styles.selectedPlaceFullCardTagItemText}>No. 1</Text>
                                            </View>
                                            <View style={styles.selectedPlaceFullCardTagItem}>
                                                <Text style={styles.selectedPlaceFullCardTagItemText}>Steak house</Text>
                                            </View>
                                            <View style={styles.selectedPlaceFullCardTagItem}>
                                                <Text style={styles.selectedPlaceFullCardTagItemText}>Meat</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.selectedPlaceFullCardInfoItemDescription}>
                                            {selectedPlace?.description}
                                        </Text>
                                        <View style={styles.selectedPlaceFullCardExtraInfoContainer}>
                                            <IconAsset.websiteIcon
                                                width={18}
                                                height={18}
                                            />
                                            <Text style={styles.selectedPlaceFullCardExtraInfoText}>
                                                {selectedPlace?.website}
                                            </Text>
                                        </View>
                                        <View style={styles.selectedPlaceFullCardExtraInfoContainer}>
                                            <IconAsset.clockIcon
                                                width={18}
                                                height={18}
                                            />
                                            <View style={styles.selectedPlaceFullCardExtraInfoOpenContainer}>
                                                <Text style={styles.selectedPlaceFullCardExtraInfoOpenText}>Open</Text>
                                                <Text style={styles.selectedPlaceFullCardExtraInfoOpenSeparator}> ∙ </Text>
                                                <Text style={styles.selectedPlaceFullCardExtraInfoText}>
                                                    {selectedPlace?.openTime}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </CurvedCard>
                            <Pressable style={styles.placeCardFooter} onPress={() => referPlace(selectedPlace)}>
                                <View style={[styles.placeCardFooterContent, selectedPlace?.isReferred && styles.placeCardFooterContentReferred]}>
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
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    searchButton: {
        width: theme.responsive.size(40),
        height: theme.responsive.size(40),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        fontSize: 18,
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
    locationButton: {
        position: 'absolute',
        bottom: theme.spacing.md,
        right: theme.spacing.md,
        width: theme.responsive.size(44),
        height: theme.responsive.size(44),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    locationButtonText: {
        fontSize: 20,
    },
    myLocationButton: {
        position: 'absolute',
        bottom: theme.spacing.xl * 6,
        right: theme.spacing.lg,
        width: theme.responsive.size(56),
        height: theme.responsive.size(56),
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: theme.borderRadius.round,
    },
    loadingText: {
        fontSize: 20,
        color: theme.colors.primary[500],
        fontWeight: 'bold',
    },

    filtersContainer: {
        marginBottom: theme.spacing.lg,
    },
    filtersScroll: {
        paddingHorizontal: theme.spacing.lg,
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
        paddingHorizontal: theme.spacing.lg,
        gap: theme.spacing.md,
        alignItems: 'flex-end',
    },
    placesContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    placesTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    placesScroll: {
        paddingBottom: theme.spacing.xl,
    },
    placeCardBig: {
        width: theme.responsive.width(theme.responsive.screen().width * 0.8),
        marginBottom: theme.spacing.md,
        paddingTop: theme.responsive.size(35),
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        zIndex: 1000,
    },
    // SVG Curved Card Styles
    svgCardContainer: {
    },
    // Curved Bottom Card Design (as shown in your image)
    curvedBottomCard: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.primary,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderBottomWidth: 0, // Remove bottom border since we'll have curved shape
    },
    curvedBottomShape: {
        position: 'absolute',
        bottom: -50,
        left: -10,
        right: -10,
        height: 100,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.responsive.size(50),
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderTopWidth: 0,
        // Create the curved bottom effect
        transform: [{ scaleX: 1.1 }],
    },
    curvedCardContent: {
        flex: 1,
        padding: theme.spacing.md,
        justifyContent: 'space-between',
        zIndex: 2,
        paddingBottom: theme.spacing.xl, // Extra padding for curved bottom
    },

    // Alternative curved designs you can try:

    // Option 2: Double Wave Bottom
    doubleWaveCard: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.primary,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderBottomWidth: 0,
    },
    doubleWaveShape1: {
        position: 'absolute',
        bottom: -30,
        left: -20,
        right: -20,
        height: 80,
        backgroundColor: theme.colors.primary[100],
        borderRadius: theme.responsive.size(40),
        transform: [{ scaleX: 1.2 }],
    },
    doubleWaveShape2: {
        position: 'absolute',
        bottom: -40,
        left: -15,
        right: -15,
        height: 70,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.responsive.size(35),
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderTopWidth: 0,
        transform: [{ scaleX: 1.1 }],
    },

    // Alternative Shape Options (replace simpleCard with any of these):

    // Option 2: Rounded Rectangle with Gradient Effect
    gradientCard: {
        width: '100%',
        height: theme.responsive.size(200),
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        ...theme.shadows.large,
        // Create gradient effect with overlapping colors
        borderWidth: 3,
        borderColor: theme.colors.primary[300],
    },

    // Option 3: Card with Angled Top Corner
    angledCard: {
        width: '100%',
        height: theme.responsive.size(200),
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        borderTopRightRadius: 0, // Remove top-right corner
        padding: theme.spacing.md,
        ...theme.shadows.large,
        borderWidth: 2,
        borderColor: theme.colors.primary[500],
        position: 'relative',
    },

    // Option 4: Pill/Capsule Shape
    pillCard: {
        width: '100%',
        height: theme.responsive.size(200),
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.responsive.size(100), // Half of height for pill effect
        padding: theme.spacing.md,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },

    // Option 5: Minimal Card with Colored Left Border
    borderCard: {
        width: '100%',
        height: theme.responsive.size(200),
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        ...theme.shadows.medium,
        borderLeftWidth: 6,
        borderLeftColor: theme.colors.primary[500],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },

    // Option 6: Card with Notched Corner
    notchedCard: {
        width: '100%',
        height: theme.responsive.size(200),
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.sm,
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        ...theme.shadows.large,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    // Alternative Shape Designs (replace the layers above to use these)

    // Option 1: Curved Wave Shape
    waveShapeContainer: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
    },
    waveLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary[500],
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        borderBottomLeftRadius: theme.borderRadius.xxxl,
        borderBottomRightRadius: theme.borderRadius.sm,
    },
    waveLayer2: {
        position: 'absolute',
        top: 8,
        left: 8,
        right: 8,
        bottom: 8,
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        borderBottomLeftRadius: theme.borderRadius.xxl,
        borderBottomRightRadius: theme.borderRadius.xs,
        ...theme.shadows.medium,
    },

    // Option 2: Diamond/Geometric Shape
    geometricShapeContainer: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
    },
    geometricLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.secondary[500],
        transform: [{ rotate: '45deg' }, { scale: 1.2 }],
        borderRadius: theme.borderRadius.md,
    },
    geometricLayer2: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        bottom: 15,
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.lg,
        ...theme.shadows.large,
    },

    // Option 3: Hexagon-like Shape
    hexagonShapeContainer: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
        borderRadius: theme.borderRadius.lg,
    },
    hexagonLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.secondary[500],
        borderTopLeftRadius: theme.borderRadius.xxl,
        borderTopRightRadius: theme.borderRadius.sm,
        borderBottomLeftRadius: theme.borderRadius.sm,
        borderBottomRightRadius: theme.borderRadius.xxl,
        transform: [{ skewX: '10deg' }],
    },
    hexagonLayer2: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        bottom: 12,
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xs,
        borderBottomLeftRadius: theme.borderRadius.xs,
        borderBottomRightRadius: theme.borderRadius.xl,
        ...theme.shadows.medium,
    },

    // Option 4: Card with Corner Cut
    cutCornerContainer: {
        width: '100%',
        height: theme.responsive.size(200),
        position: 'relative',
        overflow: 'hidden',
    },
    cutCornerLayer1: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.primary[600],
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.sm,
        borderBottomLeftRadius: theme.borderRadius.xl,
        borderBottomRightRadius: theme.borderRadius.xl,
    },
    cutCornerLayer2: {
        position: 'absolute',
        top: 6,
        left: 6,
        right: 6,
        bottom: 6,
        backgroundColor: theme.colors.background.primary,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.xs,
        borderBottomLeftRadius: theme.borderRadius.lg,
        borderBottomRightRadius: theme.borderRadius.lg,
        ...theme.shadows.medium,
    },
    // Alternative Glass Morphism Design
    placeCardGlass: {
        width: '100%',
        height: theme.responsive.size(200),
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        ...theme.shadows.large,
        // Backdrop blur effect (iOS only)
        backdropFilter: 'blur(10px)',
    },
    // Alternative Neumorphism Design
    placeCardNeumorphism: {
        width: '100%',
        height: theme.responsive.size(200),
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.md,
        justifyContent: 'space-between',
        backgroundColor: theme.colors.neutral[50],
        shadowColor: theme.colors.neutral[300],
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        // Inner shadow effect
        borderWidth: 1,
        borderColor: theme.colors.neutral[100],
    },
    // Alternative Neon Glow Design
    placeCardNeon: {
        width: '100%',
        height: theme.responsive.size(200),
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        justifyContent: 'space-between',
        backgroundColor: theme.colors.background.primary,
        borderWidth: 2,
        borderColor: theme.colors.primary[400],
        shadowColor: theme.colors.primary[400],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
    },
    placeCard: {
        width: theme.responsive.width(theme.responsive.screen().width * 0.8),
        height: theme.responsive.size(100),
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.medium,
    },
    placeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: theme.spacing.md,
    },
    placeCardImageFullBg: {
        width: theme.responsive.width(theme.responsive.screen().width * 0.8),
        borderRadius: theme.borderRadius.sm,
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
    placeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: theme.borderRadius.round,
        marginRight: theme.spacing.xs,
    },
    statusOpen: {
        backgroundColor: theme.colors.success[500],
    },
    statusClosed: {
        backgroundColor: theme.colors.error[500],
    },
    statusText: {
        ...theme.typography.captionSmall,
        color: theme.colors.text.secondary,
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        ...theme.typography.bodySmall,
        color: theme.colors.text.secondary,
    },
    directionsButton: {
        backgroundColor: theme.colors.primary[50],
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    directionsButtonText: {
        ...theme.typography.buttonSmall,
        color: theme.colors.primary[500],
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
        left: 0,
        right: 1,
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
        height: theme.responsive.screen().height * 0.37,
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
        color: theme.colors.text.success,
        fontWeight: '700',
    },
});

export default MapScreen; 