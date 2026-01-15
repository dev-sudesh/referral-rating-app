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
import Geolocation from '@react-native-community/geolocation';
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
import ToastUtils from '../../../utils/ToastUtils';

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

const hasValidCoordinates = (place) => {
    if (!place) {
        return false;
    }
    const toNumber = (value) => (typeof value === 'string' ? parseFloat(value) : Number(value));
    const lat = toNumber(place.latitude);
    const lng = toNumber(place.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
};

const normalizePlaceCoordinates = (place) => ({
    ...place,
    latitude: typeof place.latitude === 'string' ? parseFloat(place.latitude) : Number(place.latitude),
    longitude: typeof place.longitude === 'string' ? parseFloat(place.longitude) : Number(place.longitude),
});

const MapScreen = ({ navigation, route }) => {
    const { params } = route;
    const { initialSearch } = params || {};
    const profileMutation = ApiController.profile();
    const referralsMutation = ApiController.referrals();
    const referPlaceMutation = ApiController.referPlace();
    const nearbyPlacesMutation = ApiController.nearbyPlaces();
    const [selectedFilter, setSelectedFilter] = useState('all');
    const selectedFilterCategoryRef = useRef(null); // Store the selected filter category for API calls
    const getInitialRegion = () => {
        if (global.userLastLocation) {
            // Ensure coordinates are numbers
            const region = {
                latitude: typeof global.userLastLocation.latitude === 'string' ? parseFloat(global.userLastLocation.latitude) : Number(global.userLastLocation.latitude),
                longitude: typeof global.userLastLocation.longitude === 'string' ? parseFloat(global.userLastLocation.longitude) : Number(global.userLastLocation.longitude),
                latitudeDelta: typeof global.userLastLocation.latitudeDelta === 'string' ? parseFloat(global.userLastLocation.latitudeDelta) : Number(global.userLastLocation.latitudeDelta || 0.03),
                longitudeDelta: typeof global.userLastLocation.longitudeDelta === 'string' ? parseFloat(global.userLastLocation.longitudeDelta) : Number(global.userLastLocation.longitudeDelta || 0.03),
            };
            return region;
        }
        const defaultRegion = {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
        };
        return defaultRegion;
    };
    const initialRegion = React.useMemo(() => getInitialRegion(), []);
    const [region, setRegion] = useState(initialRegion);
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
    const referredPlaces = ReferralController(state => state.referredPlaces);

    const timeoutRef = useRef(null);
    const isProcessingRef = useRef(false);
    const lastProcessedStatusRef = useRef(false);
    const lastProcessedPlaceIdRef = useRef(null);
    const lastSyncedReferralsRef = useRef(null);
    const lastCenterLocationRef = useRef(null);
    const isCenteringRef = useRef(false);
    const lastFetchedReferralsLocationRef = useRef(null);
    const shouldForceSyncRef = useRef(false);
    const previousMarkerKeysRef = useRef([]);
    const processedInitialSearchRef = useRef(null);
    const markersLayoutingRef = useRef(new Set()); // Track markers currently being laid out
    const mapReadyRef = useRef(false); // Track map ready state to prevent unnecessary resets
    const setPlacesCleanupTimeoutsRef = useRef([]); // Track cleanup timeouts for setPlaces
    const lastAutoZoomedPlaceIdsRef = useRef(null); // Track place IDs we last auto-zoomed to

    const sanitizePlaces = useCallback((placesList = []) =>
        placesList
            .filter(hasValidCoordinates)
            .map(normalizePlaceCoordinates),
        [],
    );

    // Hide status bar when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            setIsScreenFocused(true);
            // Don't reset map ready state when screen gains focus on iOS
            // The MapView persists when navigating away and stays ready
            // Only reset if map is not already ready (initial mount)
            // This prevents markers from disappearing when navigating back

            // Reset sync ref to ensure we sync when returning to screen
            lastSyncedReferralsRef.current = null;
            // Reset referral fetch tracking so referrals are fetched again when returning
            lastFetchedReferralsLocationRef.current = null;
            // Set flag to force sync when screen regains focus
            shouldForceSyncRef.current = true;
            // Reset centering flag
            isCenteringRef.current = false;
            // Reset auto-zoom tracking so we can zoom again when places change
            lastAutoZoomedPlaceIdsRef.current = null;
            return () => {
                setIsScreenFocused(false);
                // Don't reset map ready state when screen loses focus
                // The MapView persists and stays mounted on iOS
                // This prevents issues with markers not showing when navigating back

                // Reset centering flag
                isCenteringRef.current = false;
                // Clear any pending cleanup timeouts
                if (setPlacesCleanupTimeoutsRef.current) {
                    setPlacesCleanupTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
                    setPlacesCleanupTimeoutsRef.current = [];
                }
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
    const setPlacesOriginal = MapsController.getState().setPlaces;

    // Wrapper to log all setPlaces calls and prevent null reference errors
    const setPlaces = React.useCallback((newPlaces) => {
        const currentPlaces = MapsController.getState().places || [];
        const currentPlaceIds = new Set(currentPlaces.map(p => p.id));
        const newPlaceIds = new Set(newPlaces.map(p => p.id));

        const added = newPlaces.filter(p => !currentPlaceIds.has(p.id));
        const removed = currentPlaces.filter(p => !newPlaceIds.has(p.id));
        const kept = newPlaces.filter(p => currentPlaceIds.has(p.id));

        const markersLayouting = markersLayoutingRef.current;
        const removedPlaceIds = new Set(removed.map(p => p.id));
        const removedBeingLaidOut = Array.from(markersLayouting).filter(id => removedPlaceIds.has(id));


        // CRITICAL FIX: If we're trying to remove places that are being laid out,
        // merge them with the new places to prevent null reference errors
        let placesToSet = newPlaces;
        if (removedBeingLaidOut.length > 0 && isMapReady) {
            // Prevent null reference - places being removed while markers are being laid out

            // Keep the places that are being laid out and merge with new places
            const placesBeingLaidOut = currentPlaces.filter(p => removedBeingLaidOut.includes(p.id));
            const newPlaceIdsSet = new Set(newPlaces.map(p => p.id));
            const mergedPlaces = [
                ...newPlaces, // New places take precedence
                ...placesBeingLaidOut.filter(p => !newPlaceIdsSet.has(p.id)) // Keep places being laid out that aren't in new places
            ];

            placesToSet = mergedPlaces;

            // Schedule a cleanup to remove these places after layout completes
            const cleanupTimeout = setTimeout(() => {
                const stillLayouting = Array.from(markersLayoutingRef.current).filter(id => removedBeingLaidOut.includes(id));
                if (stillLayouting.length === 0) {
                    // All markers have finished layout, safe to remove these places now
                    const currentPlacesAfterDelay = MapsController.getState().places || [];
                    const currentPlaceIdsAfterDelay = new Set(currentPlacesAfterDelay.map(p => p.id));
                    const finalPlaces = currentPlacesAfterDelay.filter(p => {
                        // Keep if it's in new places or if it's not one of the places we were trying to remove
                        return newPlaceIds.has(p.id) || !removedPlaceIds.has(p.id);
                    });

                    if (finalPlaces.length !== currentPlacesAfterDelay.length) {
                        setPlacesOriginal(finalPlaces);
                    }
                } else {
                    // Retry after another delay
                    setTimeout(() => {
                        const stillLayoutingRetry = Array.from(markersLayoutingRef.current).filter(id => removedBeingLaidOut.includes(id));
                        if (stillLayoutingRetry.length === 0) {
                            const currentPlacesRetry = MapsController.getState().places || [];
                            const finalPlacesRetry = currentPlacesRetry.filter(p => {
                                return newPlaceIds.has(p.id) || !removedPlaceIds.has(p.id);
                            });
                            if (finalPlacesRetry.length !== currentPlacesRetry.length) {
                                setPlacesOriginal(finalPlacesRetry);
                            }
                        }
                    }, 500);
                }
            }, 1000); // Wait 1 second for layout to complete

            // Store cleanup timeout to clear if component unmounts
            if (!setPlacesCleanupTimeoutsRef.current) {
                setPlacesCleanupTimeoutsRef.current = [];
            }
            setPlacesCleanupTimeoutsRef.current.push(cleanupTimeout);
        }

        setPlacesOriginal(placesToSet);
    }, [isMapReady, setPlacesOriginal]);

    const userLocation = MapsController(state => state.userLocation);
    const setShowPlaceBigCard = MapsController.getState().setShowPlaceBigCard;
    const centerLocation = MapsController(state => state.centerLocation);
    const setCenterLocation = MapsController.getState().setCenterLocation;
    const showConfetti = MapsController(state => state.showConfetti);
    const confettiOrigin = MapsController(state => state.confettiOrigin);
    const setShowConfetti = MapsController.getState().setShowConfetti;

    React.useEffect(() => {
        // When a filter is selected, the API already filtered by category
        // So we should show all places returned from the API without additional filtering
        // Only filter locally if we're showing 'all' (no filter applied)
        let filterData;
        if (selectedFilter === 'all') {
            // Show all places when no filter is selected
            filterData = places;
        } else {
            // When a filter is selected, the API already filtered by category
            // Show all places returned - they should all match the selected filter
            // Don't filter again locally as the API already did the filtering
            filterData = places;
        }
        const sanitized = sanitizePlaces(filterData);
        setFilteredPlaces(sanitized);
    }, [places, selectedFilter, sanitizePlaces]);

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
            // Reset auto-zoom tracking so it will zoom to all places again
            lastAutoZoomedPlaceIdsRef.current = null;
        }
    };

    const centerOnLocation = React.useCallback(() => {
        if (!centerLocation || !mapRef.current || !isMapReady || !isScreenFocused) {
            return;
        }

        // Prevent multiple simultaneous centering operations
        if (isCenteringRef.current) {
            return;
        }

        // Ensure all coordinates are numbers (may be strings from AsyncStorage)
        const normalizedRegion = normalizeLocation(centerLocation);
        if (!normalizedRegion) {
            return;
        }

        // Check if we're already at this location (within a small threshold)
        const currentLocation = lastCenterLocationRef.current;
        if (currentLocation) {
            const latDiff = Math.abs(currentLocation.latitude - normalizedRegion.latitude);
            const lngDiff = Math.abs(currentLocation.longitude - normalizedRegion.longitude);
            const latDeltaDiff = Math.abs(currentLocation.latitudeDelta - normalizedRegion.latitudeDelta);
            const lngDeltaDiff = Math.abs(currentLocation.longitudeDelta - normalizedRegion.longitudeDelta);

            // If the difference is very small, skip the animation
            if (latDiff < 0.0001 && lngDiff < 0.0001 && latDeltaDiff < 0.0001 && lngDeltaDiff < 0.0001) {
                return;
            }
        }

        // Mark as centering
        isCenteringRef.current = true;
        lastCenterLocationRef.current = normalizedRegion;

        try {
            mapRef.current.animateToRegion(normalizedRegion, 1000);
        } catch (error) {
            // Fallback to setRegion if animation fails
            try {
                mapRef.current.setRegion(normalizedRegion);
            } catch (fallbackError) {
                // Error handled silently
            }
        } finally {
            timeoutRef.current = setTimeout(() => {
                setRegion(normalizedRegion);
                // Reset centering flag after animation completes
                isCenteringRef.current = false;
            }, 1100); // Slightly longer than animation duration
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
                const referredCount = updatedPlaces.filter(p => p.isReferred).length;
                setPlaces(updatedPlaces);
                setSelectedPlace(prev => prev?.id === place.id ? { ...prev, isReferred: false } : prev);
            } else {
                // refer place
                const updatedPlaces = places.map(p => p.id === place.id ? { ...p, isReferred: true } : p);
                const referredCount = updatedPlaces.filter(p => p.isReferred).length;
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

    // Track places state changes to debug isReferred flipping
    const previousPlacesRef = React.useRef([]);
    React.useEffect(() => {
        const referredPlaces = places.filter(p => p.isReferred);
        const previousPlaces = previousPlacesRef.current;
        const previousPlaceIds = new Set(previousPlaces.map(p => p.id));
        const currentPlaceIds = new Set(places.map(p => p.id));

        // Find added and removed places
        const addedPlaces = places.filter(p => !previousPlaceIds.has(p.id));
        const removedPlaces = previousPlaces.filter(p => !currentPlaceIds.has(p.id));

        // Check if any removed places have markers currently being laid out
        const removedPlaceIds = new Set(removedPlaces.map(p => p.id));
        const markersLayouting = markersLayoutingRef.current;
        const removedPlacesBeingLaidOut = Array.from(markersLayouting).filter(id => removedPlaceIds.has(id));


        if (removedPlacesBeingLaidOut.length > 0 && isMapReady) {
            // Prevent null reference - places being removed while markers are being laid out
        }

        previousPlacesRef.current = places;
    }, [places]);

    // Track map ready state changes with detailed logging
    const previousMapReadyRef = React.useRef(false);
    React.useEffect(() => {
        const wasReady = previousMapReadyRef.current;
        const isReady = isMapReady;

        if (wasReady !== isReady) {
            const currentPlaces = MapsController.getState().places || [];
            const markersLayouting = markersLayoutingRef.current.size;
            const layoutingIds = Array.from(markersLayoutingRef.current);

            if (isReady === false && wasReady === true && markersLayouting > 0) {
                // Map ready state changed while markers are being laid out
            }
        }

        previousMapReadyRef.current = isReady;
    }, [isMapReady, filteredPlaces.length, isScreenFocused]);

    // Track initialSearch to prevent duplicate processing
    // NOTE: We do NOT clear places here anymore - we just set new places directly
    // This prevents null reference errors when markers are being laid out
    React.useEffect(() => {
        if (initialSearch) {
            // Create a unique key for this initialSearch to track if we've processed it
            const initialSearchKey = JSON.stringify({
                placesCount: initialSearch?.places?.length || 0,
                category: initialSearch?.category,
                // Use first place ID as part of key to detect different searches
                firstPlaceId: initialSearch?.places?.[0]?.id
            });

            // Only process if this is a new initialSearch
            if (processedInitialSearchRef.current !== initialSearchKey) {
                const currentPlaces = MapsController.getState().places || [];

                // Mark this initialSearch as processed
                processedInitialSearchRef.current = initialSearchKey;

                // CRITICAL: Do NOT clear places - just set new ones directly
                // React with stable keys will handle the update properly
                // Clearing causes null reference errors when markers are being laid out
                // The places will be set in the effect below when map is ready
            } else {
            }
        } else {
            // Reset processed ref when initialSearch is cleared
            if (processedInitialSearchRef.current !== null) {
                processedInitialSearchRef.current = null;
            }
        }
    }, [initialSearch]); // Removed setPlaces and isMapReady from deps

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
            isCenteringRef.current = false;
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
        if (!centerLocation?.latitude || !centerLocation?.longitude || !isScreenFocused || !isMapReady) {
            return;
        }

        // Check if we've already processed this centerLocation
        const normalizedRegion = normalizeLocation(centerLocation);
        if (!normalizedRegion) {
            return;
        }

        // Create a stable key for this location to compare
        const locationKey = `${normalizedRegion.latitude.toFixed(6)}_${normalizedRegion.longitude.toFixed(6)}`;
        const lastLocationKey = lastFetchedReferralsLocationRef.current?.key;

        // Check if we've already fetched referrals for this exact location
        if (lastLocationKey === locationKey) {
            return;
        }

        // Check if we need to animate to this location
        if (lastCenterLocationRef.current) {
            const currentLocation = lastCenterLocationRef.current;
            const latDiff = Math.abs(currentLocation.latitude - normalizedRegion.latitude);
            const lngDiff = Math.abs(currentLocation.longitude - normalizedRegion.longitude);
            const latDeltaDiff = Math.abs(currentLocation.latitudeDelta - normalizedRegion.latitudeDelta);
            const lngDeltaDiff = Math.abs(currentLocation.longitudeDelta - normalizedRegion.longitudeDelta);

            // If the difference is very small, skip the animation but still fetch referrals if needed
            if (latDiff < 0.0001 && lngDiff < 0.0001 && latDeltaDiff < 0.0001 && lngDeltaDiff < 0.0001) {
                // Mark that we've fetched for this location
                lastFetchedReferralsLocationRef.current = {
                    key: locationKey,
                    latitude: normalizedRegion.latitude,
                    longitude: normalizedRegion.longitude
                };
                referralsMutation.mutateAsync({ latitude: centerLocation.latitude, longitude: centerLocation.longitude })
                    .then(() => {
                        lastSyncedReferralsRef.current = null;
                        shouldForceSyncRef.current = true;
                    })
                    .catch((error) => {
                        // Error handled silently
                    });
                return;
            }
        }

        // Mark that we're fetching for this location
        lastFetchedReferralsLocationRef.current = {
            key: locationKey,
            latitude: normalizedRegion.latitude,
            longitude: normalizedRegion.longitude
        };

        // Fetch referrals and sync places after completion
        referralsMutation.mutateAsync({ latitude: centerLocation.latitude, longitude: centerLocation.longitude })
            .then(() => {
                // Force sync after referrals are fetched
                lastSyncedReferralsRef.current = null;
                shouldForceSyncRef.current = true;
            })
            .catch((error) => {
                // Error handled silently
            });
        centerOnLocation();
    }, [centerLocation?.latitude, centerLocation?.longitude, isScreenFocused, isMapReady, centerOnLocation]);

    // Sync places with latest referredPlaces when screen is focused or referredPlaces changes
    React.useEffect(() => {
        // Always sync when screen is focused and places are loaded, even if referredPlaces is empty
        // (it might be empty initially and will be populated after referrals are fetched)

        if (places.length > 0 && isScreenFocused && Array.isArray(referredPlaces)) {
            // Log referredPlaces structure for debugging

            // Create a Set of referred place IDs for quick lookup
            // Handle both cases: referredPlaces might have 'id' or 'place_id' property
            const referredPlaceIds = new Set(
                referredPlaces
                    .filter(ref => ref && (ref.id || ref.place_id)) // Filter out invalid entries
                    .map(ref => ref.id || ref.place_id) // Use id or place_id
            );


            // Create a string representation of referred place IDs to detect changes
            const currentReferralsKey = Array.from(referredPlaceIds).sort().join(',');

            // Always sync if:
            // 1. Screen just gained focus (ref was reset or force sync flag is set)
            // 2. referredPlaces changed
            const shouldSync = shouldForceSyncRef.current ||
                lastSyncedReferralsRef.current === null ||
                lastSyncedReferralsRef.current !== currentReferralsKey;

            if (shouldSync) {

                // Get current places and selectedPlace from MapsController to ensure we have latest values
                const currentPlaces = MapsController.getState().places;
                const currentSelectedPlace = MapsController.getState().selectedPlace;

                if (currentPlaces && currentPlaces.length > 0) {
                    // Always update all places to ensure isReferred is correctly set
                    // This is especially important when screen regains focus
                    // CRITICAL: Every place that exists in referredPlaceIds MUST have isReferred: true
                    let hasChanges = false;
                    const updatedPlaces = currentPlaces.map(place => {
                        if (!place || !place.id) return place;
                        const isReferred = referredPlaceIds.has(place.id);
                        // Check if status changed
                        if (place.isReferred !== isReferred) {
                            hasChanges = true;
                        }
                        // Always return a new object to ensure React detects the update
                        // This is important when force syncing to ensure UI reflects correct state
                        // CRITICAL: Set isReferred based on whether place.id exists in referredPlaceIds
                        return {
                            ...place,
                            isReferred: isReferred // This MUST be true if place.id is in referredPlaceIds
                        };
                    });

                    // Log details about places for debugging
                    const placesStatus = currentPlaces.map(p => ({
                        id: p.id,
                        name: p.name,
                        currentIsReferred: p.isReferred,
                        shouldBeReferred: referredPlaceIds.has(p.id),
                        isInReferredSet: referredPlaceIds.has(p.id)
                    }));

                    // Check for ID mismatches
                    const placeIds = new Set(currentPlaces.map(p => p.id));
                    const matchingIds = Array.from(referredPlaceIds).filter(id => placeIds.has(id));
                    const missingIds = Array.from(referredPlaceIds).filter(id => !placeIds.has(id));

                    // Capture force sync flag before resetting it
                    const wasForceSync = shouldForceSyncRef.current;

                    // Validate that all referred places are correctly marked
                    // This should never find errors if mapping is correct, but serves as a safety check
                    const validationErrors = [];
                    const shouldBeReferredList = [];
                    const incorrectlyMarkedList = [];
                    const placesNeedingFix = new Set();

                    updatedPlaces.forEach(place => {
                        if (!place || !place.id) return;
                        const shouldBeReferred = referredPlaceIds.has(place.id);

                        if (shouldBeReferred) {
                            shouldBeReferredList.push({ id: place.id, name: place.name });
                            if (!place.isReferred) {
                                // Fix incorrect isReferred status
                                validationErrors.push({
                                    id: place.id,
                                    name: place.name,
                                    expected: true,
                                    actual: place.isReferred
                                });
                                placesNeedingFix.add(place.id);
                            }
                        }

                        if (!shouldBeReferred && place.isReferred) {
                            incorrectlyMarkedList.push({ id: place.id, name: place.name });
                            validationErrors.push({
                                id: place.id,
                                name: place.name,
                                expected: false,
                                actual: place.isReferred
                            });
                            placesNeedingFix.add(place.id);
                        }
                    });

                    // Fix any validation errors by re-mapping the places
                    let finalUpdatedPlaces = updatedPlaces;
                    if (placesNeedingFix.size > 0) {
                        finalUpdatedPlaces = updatedPlaces.map(place => {
                            if (!place || !place.id) return place;
                            if (placesNeedingFix.has(place.id)) {
                                const shouldBeReferred = referredPlaceIds.has(place.id);
                                return { ...place, isReferred: shouldBeReferred };
                            }
                            return place;
                        });
                    }

                    if (validationErrors.length > 0) {
                        // Validation errors detected and fixed
                    }

                    // Always update places when force syncing (e.g., on screen focus)
                    // This ensures all referred places show isReferred: true
                    // Also update if there are validation errors to fix them
                    if (wasForceSync || hasChanges || validationErrors.length > 0) {
                        const placesWithStatusChanges = finalUpdatedPlaces
                            .filter((p, i) => p.isReferred !== currentPlaces[i]?.isReferred)
                            .map(p => ({ id: p.id, name: p.name, isReferred: p.isReferred }));

                        const allReferredPlaces = finalUpdatedPlaces.filter(p => p.isReferred).map(p => ({ id: p.id, name: p.name }));

                        // Always update places when force syncing to ensure UI reflects correct state
                        // Get the latest places one more time to avoid race conditions
                        const latestPlaces = MapsController.getState().places;
                        const latestPlaceIds = new Set(latestPlaces?.map(p => p.id) || []);
                        const currentPlaceIds = new Set(currentPlaces.map(p => p.id));

                        // If places have changed since we started (different IDs or count), merge our updates
                        const placesChanged = latestPlaces?.length !== currentPlaces.length ||
                            Array.from(latestPlaceIds).some(id => !currentPlaceIds.has(id)) ||
                            Array.from(currentPlaceIds).some(id => !latestPlaceIds.has(id));

                        if (latestPlaces && latestPlaces.length > 0 && placesChanged) {
                            // Create a map of our updates
                            const updatesMap = new Map(finalUpdatedPlaces.map(p => [p.id, p]));

                            // Merge: use our updated places if they exist, otherwise update the latest with referral status
                            const mergedPlaces = latestPlaces.map(place => {
                                const updatedPlace = updatesMap.get(place.id);
                                if (updatedPlace) {
                                    return updatedPlace; // Use our updated version
                                }
                                // For places not in our update, check if they should be referred
                                const isReferred = referredPlaceIds.has(place.id);
                                if (place.isReferred !== isReferred) {
                                    return { ...place, isReferred };
                                }
                                return place;
                            });

                            // Also add any new places that should be referred
                            finalUpdatedPlaces.forEach(updatedPlace => {
                                if (!latestPlaceIds.has(updatedPlace.id)) {
                                    mergedPlaces.push(updatedPlace);
                                }
                            });

                            // Log referred places before setting
                            const referredBeforeSet = mergedPlaces.filter(p => p.isReferred);
                            const currentReferred = MapsController.getState().places?.filter(p => p.isReferred) || [];
                            setPlaces(mergedPlaces);

                            // Verify immediately after setting
                            setTimeout(() => {
                                const verifyAfterSet = MapsController.getState().places?.filter(p => p.isReferred) || [];
                            }, 50);
                        } else {
                            // Log referred places before setting
                            const referredBeforeSet = finalUpdatedPlaces.filter(p => p.isReferred);
                            const currentReferred = MapsController.getState().places?.filter(p => p.isReferred) || [];
                            setPlaces(finalUpdatedPlaces);

                            // Verify immediately after setting
                            setTimeout(() => {
                                const verifyAfterSet = MapsController.getState().places?.filter(p => p.isReferred) || [];
                            }, 50);
                        }

                        // Verify the update immediately after setting
                        // Use setTimeout to ensure state has updated
                        setTimeout(() => {
                            const verifyPlaces = MapsController.getState().places;
                            const verifyPlaceIds = new Set(verifyPlaces?.map(p => p.id) || []);

                            // Only check places that are actually in the current places array
                            // Some referred places might not be loaded yet (outside visible area)
                            const referredPlaceIdsInCurrentPlaces = Array.from(referredPlaceIds).filter(id => verifyPlaceIds.has(id));

                            const verifiedReferred = verifyPlaces?.filter(p => p.isReferred) || [];
                            const verifiedReferredIds = new Set(verifiedReferred.map(p => p.id));

                            // Only check for missing referred places that are in the current places array
                            const missingReferred = referredPlaceIdsInCurrentPlaces.filter(id => !verifiedReferredIds.has(id));

                            const notLoadedReferred = Array.from(referredPlaceIds).filter(id => !verifyPlaceIds.has(id));

                            if (missingReferred.length > 0) {
                                // Try to fix by updating again
                                const placesToFix = verifyPlaces.map(place => {
                                    if (missingReferred.includes(place.id)) {
                                        return { ...place, isReferred: true };
                                    }
                                    return place;
                                });
                                const fixedReferred = placesToFix.filter(p => p.isReferred);
                                setPlaces(placesToFix);

                                // Verify the fix
                                setTimeout(() => {
                                    const verifyAfterFix = MapsController.getState().places?.filter(p => p.isReferred) || [];
                                }, 50);
                            }
                        }, 100);

                        // Update the ref to track what we've synced
                        lastSyncedReferralsRef.current = currentReferralsKey;
                        // Reset force sync flag after syncing
                        shouldForceSyncRef.current = false;
                    } else {
                        // Still update the ref to track what we've synced (even if no changes)
                        lastSyncedReferralsRef.current = currentReferralsKey;
                        // Reset force sync flag
                        shouldForceSyncRef.current = false;
                    }

                    // Also update selectedPlace if it exists
                    // Always update when force syncing to ensure correct state
                    if (currentSelectedPlace && currentSelectedPlace.id) {
                        const isReferred = referredPlaceIds.has(currentSelectedPlace.id);
                        // Always update if force syncing or if status changed
                        if (wasForceSync || currentSelectedPlace.isReferred !== isReferred) {
                            const updatedSelectedPlace = {
                                ...currentSelectedPlace,
                                isReferred: isReferred
                            };
                            setSelectedPlace(updatedSelectedPlace);
                        }
                    }
                }
            }
        }
    }, [referredPlaces, referredPlaces?.length, isScreenFocused, places.length, setPlaces, setSelectedPlace]);

    // Fetch referrals when screen regains focus to ensure referred places are synced
    React.useEffect(() => {
        if (isScreenFocused && isMapReady && centerLocation?.latitude && centerLocation?.longitude) {
            // Always fetch referrals when screen regains focus to get the latest data
            // This ensures we have the most up-to-date referral status after user actions on other screens
            const normalizedRegion = normalizeLocation(centerLocation);
            if (!normalizedRegion) {
                return;
            }

            const locationKey = `${normalizedRegion.latitude.toFixed(6)}_${normalizedRegion.longitude.toFixed(6)}`;
            const lastFetched = lastFetchedReferralsLocationRef.current;

            // Always fetch referrals when screen regains focus, even if we've fetched before
            // This ensures we get the latest referrals after user actions on other screens
            // We reset lastFetchedReferralsLocationRef in the focus effect, so this will always fetch
            if (!lastFetched || lastFetched.key !== locationKey) {
                lastFetchedReferralsLocationRef.current = {
                    key: locationKey,
                    latitude: normalizedRegion.latitude,
                    longitude: normalizedRegion.longitude
                };
                referralsMutation.mutateAsync({
                    latitude: centerLocation.latitude,
                    longitude: centerLocation.longitude
                })
                    .then(() => {
                        // Force sync after referrals are fetched
                        lastSyncedReferralsRef.current = null;
                        shouldForceSyncRef.current = true;
                    })
                    .catch((error) => {
                        // Error handled silently
                    });
            } else {
                // If we've already fetched for this exact location in this session,
                // still force a sync to ensure places are updated
                shouldForceSyncRef.current = true;
            }
        }
    }, [isScreenFocused, isMapReady, centerLocation?.latitude, centerLocation?.longitude]);

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
            // Use selected filter category if available and not 'all', otherwise use initialSearch category or undefined
            let categoryToUse = undefined;
            if (selectedFilterCategoryRef.current && selectedFilterCategoryRef.current !== 'all') {
                categoryToUse = selectedFilterCategoryRef.current;
            } else if (initialSearch?.category) {
                categoryToUse = initialSearch.category;
            }
            const currentRadius = SearchFilterController.getState().radius || 3000;
            nearbyPlacesMutation.mutateAsync({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                radius: currentRadius,
                category: categoryToUse
            });
        } else {
            // Set places from initialSearch after map is ready
            // CRITICAL: Always replace places directly (no clearing) to prevent null reference errors
            // The setPlaces wrapper will protect against removing markers that are being laid out
            if (initialSearch?.places?.length > 0 && isMapReady) {
                const initialSearchKey = JSON.stringify({
                    placesCount: initialSearch?.places?.length || 0,
                    category: initialSearch?.category,
                    firstPlaceId: initialSearch?.places?.[0]?.id
                });

                // Only set if this is the processed initialSearch (to prevent duplicate setting)
                if (processedInitialSearchRef.current === initialSearchKey) {
                    const currentPlaces = MapsController.getState().places || [];
                    const currentPlacesIds = new Set(currentPlaces.map(p => p.id));
                    const initialSearchPlaceIds = new Set(initialSearch.places.map(p => p.id));

                    // Check if places match exactly (same count and all IDs match)
                    const placesMatchExactly = currentPlaces.length === initialSearch.places.length &&
                        initialSearch.places.every(p => currentPlacesIds.has(p.id)) &&
                        currentPlaces.every(p => initialSearchPlaceIds.has(p.id));

                    if (!placesMatchExactly) {
                        const sanitized = sanitizePlaces(initialSearch.places);
                        const referredInSanitized = sanitized.filter(p => p.isReferred);
                        const currentReferred = MapsController.getState().places?.filter(p => p.isReferred) || [];
                        const markersLayouting = markersLayoutingRef.current;

                        // Direct replacement - setPlaces wrapper will handle merging if markers are being laid out
                        setPlaces(sanitized);

                        // Verify after setting
                        setTimeout(() => {
                            const verifyAfterSet = MapsController.getState().places?.filter(p => p.isReferred) || [];
                            const verifyAllPlaces = MapsController.getState().places || [];
                        }, 100);
                    } else {
                    }
                } else {
                }
            }
        }
    }, [userLocation, initialSearch?.category, initialSearch?.places, sanitizePlaces, isMapReady]);

    // Auto-zoom to fit all places when filteredPlaces change
    React.useEffect(() => {
        if (filteredPlaces.length > 0 && !selectedPlace && isScreenFocused && isMapReady && mapRef.current) {
            // Create a string identifier for current places to check if they've changed
            const currentPlaceIds = filteredPlaces
                .map(place => place.id)
                .sort()
                .join(',');

            // Only zoom if places have actually changed
            if (lastAutoZoomedPlaceIdsRef.current === currentPlaceIds) {
                return;
            }

            // Get valid coordinates from filtered places
            const coordinates = filteredPlaces
                .filter(place =>
                    place &&
                    typeof place.latitude === 'number' &&
                    typeof place.longitude === 'number' &&
                    !isNaN(place.latitude) &&
                    !isNaN(place.longitude)
                )
                .map(place => ({
                    latitude: place.latitude,
                    longitude: place.longitude,
                }));

            if (coordinates.length > 0) {
                try {
                    // Use fitToCoordinates to automatically zoom to fit all places
                    mapRef.current.fitToCoordinates(coordinates, {
                        edgePadding: {
                            top: 100,
                            right: 50,
                            bottom: 200,
                            left: 50,
                        },
                        animated: true,
                    });
                    // Track that we've zoomed to these places
                    lastAutoZoomedPlaceIdsRef.current = currentPlaceIds;
                } catch (error) {
                    // Fallback to using MapUtils if fitToCoordinates fails
                    const calculatedRegion = MapUtils.getRegionForPlaces(filteredPlaces);
                    if (calculatedRegion) {
                        const normalizedRegion = normalizeLocation(calculatedRegion);
                        setCenterLocation(normalizedRegion);
                        lastAutoZoomedPlaceIdsRef.current = currentPlaceIds;
                    }
                }
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
        console.log('handleLocationButtonPress');
        // Always fetch current location when user clicks the button
        shouldFetchPlacesRef.current = true;

        // If we already have a user location, center on it immediately for instant feedback
        const currentUserLocation = MapsController.getState().userLocation;
        if (currentUserLocation && mapRef.current) {
            const immediateRegion = normalizeLocation({
                latitude: currentUserLocation.latitude,
                longitude: currentUserLocation.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            });

            try {
                mapRef.current.animateToRegion(immediateRegion, 500);
                setRegion(immediateRegion);
            } catch (error) {
                console.error('Error animating to cached location:', error);
            }
        }

        // Then fetch fresh location in the background and update if different
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newUserLocation = { latitude, longitude };

                // Update user location in state
                MapsController.getState().setUserLocation(newUserLocation);
                AsyncStoreUtils.setItem(AsyncStoreUtils.Keys.USER_LAST_LOCATION, newUserLocation);

                // Only animate again if the location is significantly different from cached location
                const shouldUpdateMap = !currentUserLocation ||
                    Math.abs(currentUserLocation.latitude - latitude) > 0.0001 ||
                    Math.abs(currentUserLocation.longitude - longitude) > 0.0001;

                if (shouldUpdateMap && mapRef.current) {
                    // Center map on fresh user location with animation
                    const newRegion = normalizeLocation({
                        latitude,
                        longitude,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.001,
                    });

                    try {
                        mapRef.current.animateToRegion(newRegion, 1000);
                        setRegion(newRegion);
                    } catch (error) {
                        console.error('Error animating to fresh location:', error);
                    }
                }

                // Update center location for consistency
                const newRegion = normalizeLocation({
                    latitude,
                    longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                });
                setCenterLocation(newRegion);
            },
            (error) => {
                console.error('Error getting location:', error);
                // Only show error if we didn't have a cached location to fall back to
                if (!currentUserLocation) {
                    ToastUtils.error('Failed to get current location');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000, // Reduced timeout for faster response
                maximumAge: 1000, // Allow 1 second old location for faster response
            }
        );
    }

    // Set up filter callback to handle filter selection from SearchFilter
    const handleFilterCallback = React.useCallback(async (filters) => {
        const currentUserLocation = MapsController.getState().userLocation;
        const currentRadius = SearchFilterController.getState().radius || 3000;

        if (!currentUserLocation) {
            return; // Return early - modal will still close after loading completes
        }

        if (filters && filters.length > 0) {
            // Store the selected filter category for API calls
            selectedFilterCategoryRef.current = filters[0];
            // Update local filter state BEFORE fetching places so filtering works correctly
            setSelectedFilter(filters[0]);

            try {
                // Fetch places with the selected filter
                const places = await nearbyPlacesMutation.mutateAsync({
                    latitude: currentUserLocation.latitude,
                    longitude: currentUserLocation.longitude,
                    radius: currentRadius,
                    category: filters[0]
                });

                // processedNearbyPlaces already sets places via MapsController.setPlaces,
                // but we also call setPlaces to ensure consistency and trigger proper updates
                if (places && Array.isArray(places)) {
                    // Always set places, even if empty, to clear previous results
                    setPlaces(places);
                }
            } catch (error) {
                // Error handled silently
            }
        } else {
            // Clear filter if no filters selected
            selectedFilterCategoryRef.current = null;
            // Update local filter state BEFORE fetching places
            setSelectedFilter('all');

            try {
                // Fetch all places
                const currentRadius = SearchFilterController.getState().radius || 3000;
                const places = await nearbyPlacesMutation.mutateAsync({
                    latitude: currentUserLocation.latitude,
                    longitude: currentUserLocation.longitude,
                    radius: currentRadius,
                    category: undefined
                });

                if (places && Array.isArray(places) && places.length > 0) {
                    setPlaces(places);
                }
            } catch (error) {
                // Error handled silently
            }
        }
    }, [nearbyPlacesMutation, setPlaces]);

    // Set the callback when component mounts and ensure it's available
    React.useEffect(() => {
        // Set the callback without changing visibility
        SearchFilterController.getState().setHandleFilterCallback(handleFilterCallback);

        return () => {
            // Clear callback on unmount
            SearchFilterController.getState().setHandleFilterCallback(null);
        };
    }, [handleFilterCallback]);

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
                        initialRegion={initialRegion}
                        region={region}
                        onMapReady={() => {
                            // Add a small delay to ensure map is fully initialized before allowing markers
                            setTimeout(() => {
                                setIsMapReady(true);
                                mapReadyRef.current = true; // Track that map is ready
                            }, 100);
                        }}
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
                        showsPointsOfInterests={false}
                        customMapStyle={customMapStyle}
                    >
                        {(() => {
                            // Don't render markers if they're being laid out and we're trying to remove them
                            // This prevents null reference errors when markers are removed during layout
                            const hasMarkersLayouting = markersLayoutingRef.current.size > 0;
                            const shouldRenderMarkers = selectedViewType === 'map' &&
                                isMapReady &&
                                filteredPlaces.length > 0;

                            if (hasMarkersLayouting && !shouldRenderMarkers) {
                                // Markers are being laid out but shouldRenderMarkers is false
                            }

                            // Log referred places status for debugging
                            const referredPlacesInFiltered = filteredPlaces.filter(p => p.isReferred);

                            // Track marker keys (using stable place.id keys) to detect add/remove changes
                            // Note: isReferred changes won't cause key changes anymore, preventing unmount/remount
                            const markerKeys = filteredPlaces.map(p => p.id);
                            const previousKeys = previousMarkerKeysRef.current;
                            const previousKeysSet = new Set(previousKeys);
                            const currentKeysSet = new Set(markerKeys);

                            // Find keys that changed (added or removed only - no "modified" since key is stable)
                            const addedKeys = markerKeys.filter(k => !previousKeysSet.has(k));
                            const removedKeys = previousKeys.filter(k => !currentKeysSet.has(k));

                            // Track isReferred status changes for logging (but these won't cause key changes)
                            const isReferredChanged = filteredPlaces.filter((place, index) => {
                                const prevIndex = previousKeys.indexOf(place.id);
                                if (prevIndex === -1) return false; // New place
                                const prevPlace = filteredPlaces[prevIndex];
                                return prevPlace && prevPlace.isReferred !== place.isReferred;
                            }).map(p => p.id);

                            if (addedKeys.length > 0 || removedKeys.length > 0 || isReferredChanged.length > 0) {
                            }

                            previousMarkerKeysRef.current = markerKeys;

                            // Log what's being returned
                            const markersToRender = shouldRenderMarkers ? filteredPlaces.length : 0;
                            const markersLayouting = markersLayoutingRef.current.size;

                            return shouldRenderMarkers && filteredPlaces.map((place, index) => {
                                // Log each marker's isReferred status for debugging
                                if (index < 5) { // Log first 5 markers to avoid spam
                                }

                                // Use stable key (just place.id) to prevent unmounting/remounting when isReferred changes
                                // This prevents null reference errors when the native marker is updated
                                const markerKey = place.id;

                                // Validate place data before rendering marker
                                if (!place.id || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
                                    return null;
                                }

                                // Creating marker for place

                                try {
                                    // Log marker creation with full context

                                    return (
                                        <Marker
                                            key={markerKey}
                                            coordinate={{
                                                latitude: place.latitude,
                                                longitude: place.longitude,
                                            }}
                                            onPress={() => {
                                                try {
                                                    showPlaceCard({ place, scroll: true });
                                                } catch (error) {
                                                    // Error handled silently
                                                }
                                            }}
                                            onLayout={(event) => {
                                                try {
                                                    // Track that this marker is being laid out
                                                    markersLayoutingRef.current.add(place.id);

                                                    const layoutData = event.nativeEvent?.layout || {};

                                                    // Remove from layouting set after a delay
                                                    // This gives the native side time to complete the layout
                                                    setTimeout(() => {
                                                        const stillLayouting = markersLayoutingRef.current.has(place.id);
                                                        markersLayoutingRef.current.delete(place.id);
                                                        const currentPlaces = MapsController.getState().places || [];
                                                        const placeStillExists = currentPlaces.some(p => p.id === place.id);


                                                        if (!placeStillExists) {
                                                            // Marker layout completed but place no longer exists
                                                        }
                                                    }, 300); // Increased delay to give native side more time
                                                } catch (error) {
                                                    markersLayoutingRef.current.delete(place.id);
                                                    // Error handled silently
                                                }
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
                                    );
                                } catch (error) {
                                    // Error handled silently
                                    return null; // Return null to prevent rendering invalid marker
                                }
                            })
                        })()}

                        {/* User Current Location Marker */}
                        {(() => {
                            const shouldRenderUserLocation = isMapReady && userLocation;
                            return shouldRenderUserLocation && (
                                <Marker
                                    coordinate={userLocation}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                    centerOffset={{ x: 0, y: 0 }}
                                >
                                    <CurrentLocationMarker size="medium" />
                                </Marker>
                            );
                        })()}
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
                    <TouchableOpacity activeOpacity={1} style={styles.filterButton} onPress={() => {
                        // Pass current selected filter as initialFilters if not 'all'
                        const currentFilter = selectedFilterCategoryRef.current && selectedFilterCategoryRef.current !== 'all'
                            ? [selectedFilterCategoryRef.current]
                            : null;
                        setIsSearchFilterVisible({
                            isSearchFilterVisible: true,
                            initialFilters: currentFilter,
                            handleFilterCallback: handleFilterCallback
                        });
                    }}>
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    locationButton: {
        width: theme.responsive.size(55),
        height: theme.responsive.size(55),
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.large,
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