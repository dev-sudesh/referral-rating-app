import { Platform } from 'react-native';
import DeviceInfo from './deviceInfo/DeviceInfo';

const MapUtils = {
    Provider: 'google',
    init: function () {
        this.Provider = 'google';
        if (Platform.OS === 'ios') {
            this.Provider = DeviceInfo.isEmulator ? 'apple' : 'google';
        }
    },
    /**
     * Calculate region that fits all places on the map
     * @param {Array} places - Array of places with latitude and longitude
     * @param {Object} options - Optional configuration
     * @param {number} options.padding - Padding factor (default: 1.5)
     * @param {number} options.minDelta - Minimum delta value (default: 0.005)
     * @param {number} options.maxDelta - Maximum delta value (default: 50)
     * @returns {Object|null} Region object with latitude, longitude, latitudeDelta, longitudeDelta
     */
    getRegionForPlaces: function (places, options = {}) {
        if (!places || places.length === 0) {
            return null;
        }

        const { padding = 1.2, minDelta = 0.0001, maxDelta = 50 } = options;

        // Filter places that have valid coordinates
        const validPlaces = places.filter(
            place =>
                place &&
                typeof place.latitude === 'number' &&
                typeof place.longitude === 'number' &&
                !isNaN(place.latitude) &&
                !isNaN(place.longitude)
        );

        if (validPlaces.length === 0) {
            return null;
        }

        // Find min/max latitudes and longitudes
        const latitudes = validPlaces.map(place => place.latitude);
        const longitudes = validPlaces.map(place => place.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        // Calculate center point
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        // Calculate deltas with padding
        let latDelta = (maxLat - minLat) * padding;
        let lngDelta = (maxLng - minLng) * padding;

        // Apply minimum delta if places are very close together
        if (latDelta < minDelta) {
            latDelta = minDelta;
        }
        if (lngDelta < minDelta) {
            lngDelta = minDelta;
        }

        // Apply maximum delta if places are very far apart
        if (latDelta > maxDelta) {
            latDelta = maxDelta;
        }
        if (lngDelta > maxDelta) {
            lngDelta = maxDelta;
        }

        // Ensure longitude delta accounts for screen aspect ratio
        // This helps ensure places fit horizontally as well
        const aspectRatio = 1.0; // Can be adjusted based on screen dimensions if needed
        if (lngDelta < latDelta * aspectRatio) {
            lngDelta = latDelta * aspectRatio;
        }

        return {
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
        };
    }
}

export default MapUtils;