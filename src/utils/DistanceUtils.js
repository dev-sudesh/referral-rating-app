/**
 * Utility functions for calculating distances between coordinates
 */

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {Object} coord1 - First coordinate {latitude, longitude}
 * @param {Object} coord2 - Second coordinate {latitude, longitude}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2 ||
        typeof coord1.latitude !== 'number' || typeof coord1.longitude !== 'number' ||
        typeof coord2.latitude !== 'number' || typeof coord2.longitude !== 'number') {
        return null;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coord2.latitude - coord1.latitude);
    const dLon = toRadians(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
        return 'N/A';
    }

    if (distance < 1) {
        // Show in meters for distances less than 1km
        const meters = Math.round(distance * 1000);
        return `${meters}m`;
    } else if (distance < 10) {
        // Show with 1 decimal place for distances less than 10km
        return `${distance.toFixed(1)}km`;
    } else {
        // Show as whole number for distances 10km and above
        return `${Math.round(distance)}km`;
    }
};

/**
 * Calculate and format distance between user location and a place
 * @param {Object} userLocation - User's current location {latitude, longitude}
 * @param {Object} place - Place object with latitude and longitude
 * @returns {string} Formatted distance string
 */
export const getPlaceDistance = (userLocation, place) => {
    if (!userLocation || !place || !place.latitude || !place.longitude) {
        return 'N/A';
    }

    const distance = calculateDistance(userLocation, {
        latitude: place.latitude,
        longitude: place.longitude
    });

    return formatDistance(distance);
};
