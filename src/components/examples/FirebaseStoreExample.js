import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StyleSheet,
} from 'react-native';
import { useFirebaseStore, useUserFilters, useSearchSuggestions, useReferredPlaces } from '../../hooks/useFirebaseStore';

const FirebaseStoreExample = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [placeData, setPlaceData] = useState({
        placeId: '',
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        category: '',
    });

    const {
        initializeAnonymousUser,
        updateLastLogin,
        storeLastLocation,
        getLastLocation,
        getUserStats,
        clearUserData,
        loading: mainLoading,
        error: mainError,
    } = useFirebaseStore();

    const {
        filters,
        saveFilters,
        loading: filtersLoading,
    } = useUserFilters();

    const {
        suggestions,
        loadSuggestions,
        addSearchKeyword,
        loading: searchLoading,
    } = useSearchSuggestions();

    const {
        places,
        addPlace,
        markVisited,
        deletePlace,
        loading: placesLoading,
    } = useReferredPlaces();

    // Initialize anonymous user on component mount
    useEffect(() => {
        const initUser = async () => {
            try {
                await initializeAnonymousUser({
                    appVersion: '1.0.0',
                    platform: 'react-native',
                });
                await updateLastLogin();
            } catch (error) {
                console.error('Error initializing user:', error);
            }
        };
        initUser();
    }, [initializeAnonymousUser, updateLastLogin]);

    // Load search suggestions on mount
    useEffect(() => {
        loadSuggestions();
    }, [loadSuggestions]);

    const handleSaveFilters = () => {
        const newFilters = {
            category: ['restaurant', 'cafe'],
            rating: 4.0,
            distance: 5,
            priceRange: 'medium',
            openNow: true,
        };
        saveFilters(newFilters);
    };

    const handleSearch = async () => {
        if (searchKeyword.trim()) {
            await addSearchKeyword(searchKeyword);
            setSearchKeyword('');
            Alert.alert('Success', 'Search keyword saved!');
        }
    };

    const handleSaveLocation = async () => {
        const location = {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 10,
            address: locationInput || 'San Francisco, CA',
        };

        try {
            await storeLastLocation(location);
            setLocationInput('');
            Alert.alert('Success', 'Location saved!');
        } catch (error) {
            Alert.alert('Error', 'Failed to save location');
        }
    };

    const handleAddPlace = async () => {
        if (!placeData.placeId || !placeData.name) {
            Alert.alert('Error', 'Please fill in place ID and name');
            return;
        }

        const place = {
            ...placeData,
            latitude: parseFloat(placeData.latitude) || 0,
            longitude: parseFloat(placeData.longitude) || 0,
            rating: 4.5,
        };

        try {
            await addPlace(place);
            setPlaceData({
                placeId: '',
                name: '',
                address: '',
                latitude: '',
                longitude: '',
                category: '',
            });
            Alert.alert('Success', 'Place added to referrals!');
        } catch (error) {
            Alert.alert('Error', 'Failed to add place');
        }
    };

    const handleMarkVisited = async (placeId) => {
        try {
            await markVisited(placeId);
            Alert.alert('Success', 'Place marked as visited!');
        } catch (error) {
            Alert.alert('Error', 'Failed to mark place as visited');
        }
    };

    const handleDeletePlace = async (placeId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this place?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deletePlace(placeId);
                            Alert.alert('Success', 'Place deleted!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete place');
                        }
                    },
                },
            ]
        );
    };

    const handleClearData = async () => {
        Alert.alert(
            'Confirm Clear Data',
            'This will delete all your data. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearUserData();
                            Alert.alert('Success', 'All data cleared!');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Firebase Store Service Example</Text>

            {/* Error Display */}
            {mainError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {mainError}</Text>
                </View>
            )}

            {/* Loading Indicator */}
            {(mainLoading || filtersLoading || searchLoading || placesLoading) && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            )}

            {/* User Filters Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Filters</Text>
                <Text style={styles.sectionText}>
                    Current filters: {JSON.stringify(filters, null, 2)}
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleSaveFilters}>
                    <Text style={styles.buttonText}>Save Sample Filters</Text>
                </TouchableOpacity>
            </View>

            {/* Search History Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Search History</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter search keyword"
                        value={searchKeyword}
                        onChangeText={setSearchKeyword}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSearch}>
                        <Text style={styles.buttonText}>Save Search</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionText}>Recent searches:</Text>
                {suggestions.map((suggestion, index) => (
                    <Text key={index} style={styles.suggestionText}>
                        {suggestion.keyword} (searched {suggestion.searchCount} times)
                    </Text>
                ))}
            </View>

            {/* Location Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter location address"
                        value={locationInput}
                        onChangeText={setLocationInput}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSaveLocation}>
                        <Text style={styles.buttonText}>Save Location</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Referred Places Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Add Referred Place</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Place ID"
                    value={placeData.placeId}
                    onChangeText={(text) => setPlaceData({ ...placeData, placeId: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Place Name"
                    value={placeData.name}
                    onChangeText={(text) => setPlaceData({ ...placeData, name: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Address"
                    value={placeData.address}
                    onChangeText={(text) => setPlaceData({ ...placeData, address: text })}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Latitude"
                    value={placeData.latitude}
                    onChangeText={(text) => setPlaceData({ ...placeData, latitude: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Longitude"
                    value={placeData.longitude}
                    onChangeText={(text) => setPlaceData({ ...placeData, longitude: text })}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={placeData.category}
                    onChangeText={(text) => setPlaceData({ ...placeData, category: text })}
                />
                <TouchableOpacity style={styles.button} onPress={handleAddPlace}>
                    <Text style={styles.buttonText}>Add Place</Text>
                </TouchableOpacity>
            </View>

            {/* Referred Places List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Referred Places ({places.length})</Text>
                {places.map((place) => (
                    <View key={place.id} style={styles.placeItem}>
                        <Text style={styles.placeName}>{place.name}</Text>
                        <Text style={styles.placeAddress}>{place.address}</Text>
                        <Text style={styles.placeCategory}>{place.category}</Text>
                        <Text style={styles.placeStatus}>
                            Status: {place.isVisited ? 'Visited' : 'Not Visited'}
                        </Text>
                        <View style={styles.placeActions}>
                            {!place.isVisited && (
                                <TouchableOpacity
                                    style={[styles.button, styles.smallButton]}
                                    onPress={() => handleMarkVisited(place.placeId)}
                                >
                                    <Text style={styles.buttonText}>Mark Visited</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[styles.button, styles.smallButton, styles.deleteButton]}
                                onPress={() => handleDeletePlace(place.placeId)}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            {/* Clear Data Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
                    <Text style={styles.buttonText}>Clear All Data</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    sectionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 8,
        marginRight: 8,
        fontSize: 14,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginVertical: 4,
    },
    smallButton: {
        padding: 8,
        marginRight: 8,
    },
    dangerButton: {
        backgroundColor: '#FF3B30',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    suggestionText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        paddingLeft: 8,
    },
    placeItem: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    placeAddress: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    placeCategory: {
        fontSize: 12,
        color: '#007AFF',
        marginTop: 2,
    },
    placeStatus: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    placeActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    errorContainer: {
        backgroundColor: '#FFE5E5',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
    },
    loadingContainer: {
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 6,
        marginBottom: 16,
    },
    loadingText: {
        color: '#1976D2',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default FirebaseStoreExample;
