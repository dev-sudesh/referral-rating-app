// Custom Marker Icons for React Native Maps
// These icons are designed to work with react-native-maps Marker component

export const MarkerIcons = {
    // Default marker
    default: require('./marker-icon.svg'),

    // Restaurant markers
    restaurant: {
        open: require('./restaurant-marker.svg'),
        closed: require('./restaurant-marker-closed.svg'),
    },

    // Shop markers
    shop: {
        open: require('./shop-marker.svg'),
        closed: require('./shop-marker-closed.svg'),
    },

    // Service markers
    service: {
        open: require('./service-marker.svg'),
        closed: require('./service-marker-closed.svg'),
    },

    // User location marker
    user: require('./marker-icon.svg'), // Using default for user location
};

// Helper function to get marker icon based on category and status
export const getMarkerIcon = (category, isOpen = true) => {
    const categoryIcons = MarkerIcons[category];

    if (!categoryIcons) {
        return MarkerIcons.default;
    }

    if (typeof categoryIcons === 'string') {
        return categoryIcons;
    }

    return isOpen ? categoryIcons.open : categoryIcons.closed;
};

// Helper function to get marker color based on category and status
export const getMarkerColor = (category = 'default', isOpen = true) => {
    const colors = {
        restaurants: {
            open: '#FF6B35',    // Orange for open restaurants
            closed: '#F44336',  // Red for closed restaurants
        },
        shops: {
            open: '#4CAF50',    // Green for open shops
            closed: '#F44336',  // Red for closed shops
        },
        services: {
            open: '#2196F3',    // Blue for open services
            closed: '#F44336',  // Red for closed services
        },
        default: {
            open: '#4798FF',
            closed: '#F44336',
        }
    };

    const categoryColors = colors[category] || colors.default;

    return isOpen ? categoryColors.open : categoryColors.closed;
};

// Marker icon sizes
export const MarkerSizes = {
    small: { width: 30, height: 33 },
    medium: { width: 40, height: 44 },
    large: { width: 50, height: 55 },
};

export default MarkerIcons; 