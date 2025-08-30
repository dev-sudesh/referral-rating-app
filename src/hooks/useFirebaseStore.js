import { useState, useEffect, useCallback } from 'react';
import FirebaseStoreService from '../services/firebase/FirebaseStoreService';
import FirebaseInitializer from '../utils/FirebaseInitializer';
import FirebaseController from '../controllers/firebase/FirebaseController';

export const useFirebaseStore = () => {
    const { setIsLoading, isFirebaseReady, setIsFirebaseReady } = FirebaseController();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper function to ensure Firebase is ready before operations
    const ensureFirebaseReady = useCallback(async () => {
        try {
            await FirebaseInitializer.waitForFirebase(5, 100);
            setIsFirebaseReady(true);
            return true;
        } catch (error) {
            console.warn('Firebase not ready, but continuing:', error.message);
            return false;
        }
    }, []);

    // Anonymous user management
    const initializeAnonymousUser = useCallback(async (userData = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            // Wait for Firebase to be ready before initializing user
            await ensureFirebaseReady();
            const userId = await FirebaseStoreService.storeAnonymousUser(userData);
            return userId;
        } catch (err) {
            console.warn('Failed to initialize anonymous user:', err.message);
            setError(err.message);
            // Don't throw error, just return null to allow app to continue
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const updateLastLogin = useCallback(async () => {
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.updateLastLogin();
        } catch (err) {
            console.warn('Error updating last login:', err.message);
            // Don't throw error, just log warning
        }
    }, [ensureFirebaseReady]);

    // User filters management
    const storeUserFilters = useCallback(async (filters) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.storeUserFilters(filters);
        } catch (err) {
            console.warn('Error storing user filters:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const getUserFilters = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            const filters = await FirebaseStoreService.getUserFilters();
            return filters;
        } catch (err) {
            console.warn('Error getting user filters:', err.message);
            setError(err.message);
            return {};
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    // Search history management
    const storeSearchKeyword = useCallback(async (keyword) => {
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.storeSearchKeyword(keyword);
        } catch (err) {
            console.warn('Error storing search keyword:', err.message);
            // Don't throw error, just log warning
        }
    }, [ensureFirebaseReady]);

    const getSearchSuggestions = useCallback(async (limit = 10) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            const suggestions = await FirebaseStoreService.getSearchSuggestions(limit);
            return suggestions;
        } catch (err) {
            console.warn('Error getting search suggestions:', err.message);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    // Location management
    const storeLastLocation = useCallback(async (location) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.storeLastLocation(location);
        } catch (err) {
            console.warn('Error storing last location:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const getLastLocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            const location = await FirebaseStoreService.getLastLocation();
            return location;
        } catch (err) {
            console.warn('Error getting last location:', err.message);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    // Referred places management
    const storeReferredPlace = useCallback(async (placeData) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.storeReferredPlace(placeData);
        } catch (err) {
            console.warn('Error storing referred place:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const getReferredPlaces = useCallback(async (limit = 50) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            const places = await FirebaseStoreService.getReferredPlaces(limit);
            return places;
        } catch (err) {
            console.warn('Error getting referred places:', err.message);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const markPlaceAsVisited = useCallback(async (placeId) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.markPlaceAsVisited(placeId);
        } catch (err) {
            console.warn('Error marking place as visited:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    const deleteReferredPlace = useCallback(async (placeId) => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.deleteReferredPlace(placeId);
        } catch (err) {
            console.warn('Error deleting referred place:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    // User statistics
    const getUserStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            const stats = await FirebaseStoreService.getUserStats();
            return stats;
        } catch (err) {
            console.warn('Error getting user stats:', err.message);
            setError(err.message);
            return {
                hasFilters: false,
                searchCount: 0,
                hasLocation: false,
                referredPlacesCount: 0,
                visitedPlacesCount: 0,
            };
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    // Data cleanup
    const clearUserData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await ensureFirebaseReady();
            await FirebaseStoreService.clearUserData();
        } catch (err) {
            console.warn('Error clearing user data:', err.message);
            setError(err.message);
            // Don't throw error, just log warning
        } finally {
            setLoading(false);
        }
    }, [ensureFirebaseReady]);

    return {
        loading,
        error,
        // Anonymous user
        initializeAnonymousUser,
        updateLastLogin,
        // Filters
        storeUserFilters,
        getUserFilters,
        // Search
        storeSearchKeyword,
        getSearchSuggestions,
        // Location
        storeLastLocation,
        getLastLocation,
        // Referred places
        storeReferredPlace,
        getReferredPlaces,
        markPlaceAsVisited,
        deleteReferredPlace,
        // Statistics
        getUserStats,
        // Cleanup
        clearUserData,
    };
};

// Hook for managing user filters with local state
export const useUserFilters = () => {
    const [filters, setFilters] = useState({});
    const { storeUserFilters, getUserFilters, loading, error } = useFirebaseStore();

    const loadFilters = useCallback(async () => {
        const savedFilters = await getUserFilters();
        setFilters(savedFilters);
    }, [getUserFilters]);

    const saveFilters = useCallback(async (newFilters) => {
        setFilters(newFilters);
        await storeUserFilters(newFilters);
    }, [storeUserFilters]);

    useEffect(() => {
        loadFilters();
    }, [loadFilters]);

    return {
        filters,
        saveFilters,
        loadFilters,
        loading,
        error,
    };
};

// Hook for managing search suggestions
export const useSearchSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const { getSearchSuggestions, storeSearchKeyword, loading, error } = useFirebaseStore();

    const loadSuggestions = useCallback(async () => {
        const searchSuggestions = await getSearchSuggestions();
        setSuggestions(searchSuggestions);
    }, [getSearchSuggestions]);

    const addSearchKeyword = useCallback(async (keyword) => {
        await storeSearchKeyword(keyword);
        // Reload suggestions after adding new keyword
        await loadSuggestions();
    }, [storeSearchKeyword, loadSuggestions]);

    return {
        suggestions,
        loadSuggestions,
        addSearchKeyword,
        loading,
        error,
    };
};

// Hook for managing referred places
export const useReferredPlaces = () => {
    const [places, setPlaces] = useState([]);
    const {
        getReferredPlaces,
        storeReferredPlace,
        markPlaceAsVisited,
        deleteReferredPlace,
        loading,
        error
    } = useFirebaseStore();

    const loadPlaces = useCallback(async () => {
        const referredPlaces = await getReferredPlaces();
        setPlaces(referredPlaces);
    }, [getReferredPlaces]);

    const addPlace = useCallback(async (placeData) => {
        await storeReferredPlace(placeData);
        await loadPlaces(); // Reload places after adding
    }, [storeReferredPlace, loadPlaces]);

    const markVisited = useCallback(async (placeId) => {
        await markPlaceAsVisited(placeId);
        await loadPlaces(); // Reload places after marking as visited
    }, [markPlaceAsVisited, loadPlaces]);

    const deletePlace = useCallback(async (placeId) => {
        await deleteReferredPlace(placeId);
        await loadPlaces(); // Reload places after deleting
    }, [deleteReferredPlace, loadPlaces]);

    useEffect(() => {
        loadPlaces();
    }, [loadPlaces]);

    return {
        places,
        addPlace,
        markVisited,
        deletePlace,
        loadPlaces,
        loading,
        error,
    };
};
