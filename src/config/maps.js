// Google Maps API Configuration
// API key is loaded from environment variables or secret files
import Env from '../config/env';

export const GOOGLE_MAPS_API_KEY = Env.GOOGLE_MAPS_API_KEY;

// Map configuration constants
export const MAP_CONFIG = {
    // Default region (San Francisco)
    defaultRegion: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    },

    // Map features
    features: {
        showsUserLocation: true,
        showsCompass: true,
        showsScale: true,
        showsBuildings: true,
        showsTraffic: false,
        showsIndoors: true,
    },

    // Marker colors
    markerColors: {
        open: '#4CAF50',    // Green for open places
        closed: '#F44336',  // Red for closed places
        user: '#2196F3',    // Blue for user location
    },

    // Map types
    mapTypes: {
        standard: 'standard',
        satellite: 'satellite',
        hybrid: 'hybrid',
        terrain: 'terrain',
    },
};

// API endpoints for location services (if needed)
export const LOCATION_API = {
    geocoding: 'https://maps.googleapis.com/maps/api/geocode/json',
    places: 'https://maps.googleapis.com/maps/api/place',
    directions: 'https://maps.googleapis.com/maps/api/directions/json',
};

export default {
    GOOGLE_MAPS_API_KEY,
    MAP_CONFIG,
    LOCATION_API,
}; 