import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    ScrollView,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
    const [selectedFilter, setSelectedFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'restaurants', label: 'Restaurants' },
        { id: 'shops', label: 'Shops' },
        { id: 'services', label: 'Services' },
    ];

    const nearbyPlaces = [
        {
            id: '1',
            name: 'Coffee Shop',
            category: 'restaurants',
            distance: '0.2 km',
            rating: 4.5,
            isOpen: true,
        },
        {
            id: '2',
            name: 'Grocery Store',
            category: 'shops',
            distance: '0.5 km',
            rating: 4.2,
            isOpen: true,
        },
        {
            id: '3',
            name: 'Bank Branch',
            category: 'services',
            distance: '0.8 km',
            rating: 4.0,
            isOpen: false,
        },
        {
            id: '4',
            name: 'Pizza Place',
            category: 'restaurants',
            distance: '1.1 km',
            rating: 4.7,
            isOpen: true,
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

    const renderPlaceCard = (place) => (
        <TouchableOpacity
            key={place.id}
            style={styles.placeCard}
            activeOpacity={0.8}
        >
            <View style={styles.placeCardHeader}>
                <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <Text style={styles.placeCategory}>{place.category}</Text>
                </View>
                <View style={styles.placeStatus}>
                    <View style={[
                        styles.statusIndicator,
                        place.isOpen ? styles.statusOpen : styles.statusClosed,
                    ]} />
                    <Text style={styles.statusText}>
                        {place.isOpen ? 'Open' : 'Closed'}
                    </Text>
                </View>
            </View>

            <View style={styles.placeCardFooter}>
                <View style={styles.placeDetails}>
                    <Text style={styles.placeDistance}>{place.distance}</Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>⭐ {place.rating}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.directionsButton}>
                    <Text style={styles.directionsButtonText}>Directions</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );


    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingHorizontal: theme.spacing.lg,
                paddingTop: theme.spacing.xxxl,
                paddingBottom: theme.spacing.md,
            }}>
            <Text>Map Screen</Text>
        </ScreenContainer>
    )

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={theme.colors.background.primary}
            />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Map</Text>
                <TouchableOpacity style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>🔍</Text>
                </TouchableOpacity>
            </View>

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
                    <Text style={styles.mapPlaceholderTitle}>Interactive Map</Text>
                    <Text style={styles.mapPlaceholderText}>
                        Map integration will be implemented here
                    </Text>
                    <TouchableOpacity style={styles.mapButton}>
                        <Text style={styles.mapButtonText}>Enable Location</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersScroll}
                >
                    {filters.map(renderFilterButton)}
                </ScrollView>
            </View>

            {/* Nearby Places */}
            <View style={styles.placesContainer}>
                <Text style={styles.placesTitle}>Nearby Places</Text>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.placesScroll}
                >
                    {nearbyPlaces.map(renderPlaceCard)}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xxxl,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.text.primary,
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        fontSize: 18,
    },
    mapContainer: {
        height: height * 0.4,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: theme.colors.neutral[100],
        borderRadius: theme.borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.border.light,
        borderStyle: 'dashed',
    },
    mapPlaceholderIcon: {
        fontSize: 64,
        marginBottom: theme.spacing.md,
    },
    mapPlaceholderTitle: {
        ...theme.typography.h3,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
    },
    mapPlaceholderText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    mapButton: {
        backgroundColor: theme.colors.primary[500],
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
    },
    mapButtonText: {
        ...theme.typography.buttonMedium,
        color: theme.colors.background.primary,
    },
    filtersContainer: {
        marginBottom: theme.spacing.lg,
    },
    filtersScroll: {
        paddingHorizontal: theme.spacing.lg,
    },
    filterButton: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.round,
        backgroundColor: theme.colors.neutral[100],
        marginRight: theme.spacing.sm,
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
    placesContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    placesTitle: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    placesScroll: {
        paddingBottom: theme.spacing.xl,
    },
    placeCard: {
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        ...theme.shadows.ios.small,
    },
    placeCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.md,
    },
    placeInfo: {
        flex: 1,
    },
    placeName: {
        ...theme.typography.h5,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    placeCategory: {
        ...theme.typography.captionMedium,
        color: theme.colors.text.secondary,
        textTransform: 'capitalize',
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
});

export default MapScreen; 