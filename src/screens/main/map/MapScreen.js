import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Alert,
    FlatList,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { theme } from '../../../constants/theme';
import IconAsset from '../../../assets/icons/IconAsset';
import AppImage from '../../../components/common/AppImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAsset from '../../../assets/images/ImageAsset';
import SearchFilter from '../../../components/ui/SearchFilter';
import RBSheet from 'react-native-raw-bottom-sheet';
import SearchFilterController from '../../../controllers/filters/SearchFilterController';

const MapScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.032,
        longitudeDelta: 0.032,
    });
    const [userLocation, setUserLocation] = useState(null);
    const mapRef = useRef(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const bottomSheetRef = useRef(null);
    const { isSearchFilterVisible, setIsSearchFilterVisible } = SearchFilterController();

    useEffect(() => {
        // Request location permissions and get user location
        const requestLocationPermission = async () => {
            try {
                // For now, we'll use a default location
                // In a real app, you'd use react-native-permissions to request location access
                setUserLocation({
                    latitude: 37.78825,
                    longitude: -122.4324,
                });
            } catch (error) {
                console.log('Location permission error:', error);
            }
        };

        requestLocationPermission();
    }, []);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'restaurants', label: 'Restaurants' },
        { id: 'shops', label: 'Shops' },
        { id: 'services', label: 'Services' },
    ];

    const nearbyPlaces = [
        {
            id: '1',
            name: 'Boucherie Union Square',
            address: '225 Park Ave, New York',
            category: 'restaurants',
            distance: '0.2 km',
            rating: 4.5,
            isOpen: true,
            latitude: 37.78725,
            longitude: -122.4314,
            rank: 1,
            image: ImageAsset.places.place01,
        },
        {
            id: '2',
            name: 'Grocery Store',
            address: '225 Park Ave, New York',
            category: 'shops',
            distance: '0.5 km',
            rating: 4.2,
            isOpen: true,
            latitude: 37.77925,
            longitude: -122.4234,
            rank: 2,
            image: ImageAsset.places.place01,
        },
        {
            id: '3',
            name: 'Bank Branch',
            address: '225 Park Ave, New York',
            category: 'services',
            distance: '0.8 km',
            rating: 4.0,
            isOpen: false,
            latitude: 37.77725,
            longitude: -122.4214,
            rank: 3,
            image: ImageAsset.places.place01,
        },
        {
            id: '4',
            name: 'Pizza Place',
            address: '225 Park Ave, New York',
            category: 'restaurants',
            distance: '1.1 km',
            rating: 4.7,
            isOpen: true,
            latitude: 37.78025,
            longitude: -122.4204,
            rank: 4,
            image: ImageAsset.places.place01,
        },
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

    // Filter places based on selected filter
    const filteredPlaces = selectedFilter === 'all'
        ? nearbyPlaces
        : nearbyPlaces.filter(place => place.category === selectedFilter);

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

    const centerOnUserLocation = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.05,
            }, 1000);
        }
    };

    const renderSelectedPlaceCard = React.useCallback(() => (
        <TouchableOpacity style={styles.placeCardBig} activeOpacity={0.8} onPress={() => setSelectedPlace(null)}>
            <View style={styles.placeCardHeader}>
                <View style={styles.placeCardImage}>
                    <AppImage
                        source={selectedPlace?.image}
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: theme.borderRadius.sm,
                        }}
                    />
                </View>
            </View>
            <View style={styles.placeCardInfo}>
                <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{selectedPlace?.name}</Text>
                    <Text style={styles.placeCategory}>{selectedPlace?.address}</Text>
                </View>
                <View style={styles.placeInfo}>
                    <Text style={styles.placeCategory}>{selectedPlace?.address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    ), []);

    const renderPlaceCard = (place) => (
        <>
            {selectedPlace?.id === place.id ? renderSelectedPlaceCard() : (

                <TouchableOpacity
                    key={place.id}
                    style={styles.placeCard}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPlace(place)}
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
                </TouchableOpacity>)}
        </>
    );


    return (
        <SafeAreaView style={{ flex: 1 }} edges={[]}>
            <View style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    translucent={true}
                    backgroundColor={'transparent'}
                />


                {/* Interactive Map */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        region={region}
                        onRegionChangeComplete={setRegion}
                        onPress={handleMapPress}
                        showsUserLocation={true}
                        showsMyLocationButton={false}
                        showsCompass={true}
                        showsScale={true}
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
                                        <IconAsset.markerIconSvg
                                            width={50}
                                            height={50}
                                        />
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
                    </MapView>

                    <View style={styles.placesContainer}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={filteredPlaces}
                            renderItem={({ item }) => renderPlaceCard(item)}
                            keyExtractor={(item) => item.id}
                            snapToInterval={theme.responsive.width(theme.responsive.screen().width * 0.8)}
                            decelerationRate="fast"
                            snapToAlignment="start"
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
        flex: 1,
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
        zIndex: 1000,
        backgroundColor: 'red',
    },
    placeCard: {
        width: theme.responsive.width(theme.responsive.screen().width * 0.8),
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
    placeCardImage: {
        width: theme.responsive.size(80),
        height: theme.responsive.size(80),
        borderRadius: theme.borderRadius.sm,
        overflow: 'hidden',
    },
    placeCardInfo: {
        flex: 1,
        height: theme.responsive.size(80),
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
});

export default MapScreen; 