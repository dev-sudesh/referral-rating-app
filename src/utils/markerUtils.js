// Utility functions for custom marker icons
import { getMarkerColor } from '../assets/icons/markers/MarkerIcons';

// Convert SVG to base64 image for markers
export const createMarkerImage = (category, isOpen = true) => {
    const color = getMarkerColor(category, isOpen);

    // This is a simplified approach - in a real app, you'd want to:
    // 1. Convert SVG to PNG/JPEG
    // 2. Cache the images
    // 3. Use proper image assets

    // For now, we'll return null to use default pin colors
    return null;
};

// Get marker configuration based on category and status
export const getMarkerConfig = (category, isOpen = true) => {
    const configs = {
        restaurant: {
            open: {
                color: '#FF6B35',
                icon: '🍽️',
                size: 'medium',
            },
            closed: {
                color: '#F44336',
                icon: '🚫',
                size: 'medium',
            },
        },
        shop: {
            open: {
                color: '#4CAF50',
                icon: '🛍️',
                size: 'medium',
            },
            closed: {
                color: '#F44336',
                icon: '🚫',
                size: 'medium',
            },
        },
        service: {
            open: {
                color: '#2196F3',
                icon: '🏢',
                size: 'medium',
            },
            closed: {
                color: '#F44336',
                icon: '🚫',
                size: 'medium',
            },
        },
        default: {
            color: '#4798FF',
            icon: '📍',
            size: 'medium',
        },
    };

    const categoryConfig = configs[category];
    if (!categoryConfig) {
        return configs.default;
    }

    return isOpen ? categoryConfig.open : categoryConfig.closed;
};

// Create custom marker with emoji (alternative approach)
export const createEmojiMarker = (category, isOpen = true) => {
    const config = getMarkerConfig(category, isOpen);
    return {
        emoji: config.icon,
        color: config.color,
        size: config.size,
    };
};

// Marker animation configurations
export const markerAnimations = {
    drop: 'drop',
    bounce: 'bounce',
    none: null,
};

// Get appropriate animation for marker type
export const getMarkerAnimation = (category, isOpen) => {
    if (!isOpen) {
        return markerAnimations.none; // No animation for closed places
    }

    const animations = {
        restaurant: markerAnimations.bounce,
        shop: markerAnimations.drop,
        service: markerAnimations.drop,
        default: markerAnimations.drop,
    };

    return animations[category] || animations.default;
};

export default {
    createMarkerImage,
    getMarkerConfig,
    createEmojiMarker,
    markerAnimations,
    getMarkerAnimation,
}; 