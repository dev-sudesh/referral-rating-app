import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, limit, getDocs, orderBy, serverTimestamp, increment, writeBatch, deleteField } from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import FirebaseInitializer from '../../utils/FirebaseInitializer';
import { faker } from '@faker-js/faker';
import Constants from '../../constants/data';
import { cacheImageUrl } from '../../utils/preloadImages/PreloadImagesUtils';

// Get Firestore instance using new modular API
const db = getFirestore();

// Collection names
const COLLECTIONS = {
    USERS: 'users',
    USER_FILTERS: 'user_filters',
    USER_SEARCH_HISTORY: 'user_search_history',
    POPULAR_SEARCH: 'popular_search',
    PLACES: 'places',
    USER_LOCATIONS: 'user_locations',
    REFERRED_PLACES: 'referred_places',
    DEVICE_MAPPINGS: 'device_mappings',
    REWARDS: 'rewards',
    REWARD_REDEEMED: 'reward_redeemed',
};

// Helper function to handle Firestore errors gracefully
const handleFirestoreError = (error, operation) => {
    if (error.code === 'firestore/unavailable') {
        console.warn(`Firestore service unavailable for ${operation}, will retry later`);
        return null;
    }

    // Handle TypeError and other runtime errors
    if (error instanceof TypeError) {
        console.warn(`Type error in ${operation}:`, error.message);
        return null;
    }

    console.error(`Error in ${operation}:`, error);
    throw error;
};

// Helper function to ensure Firebase is ready before operations
const ensureFirebaseReady = async () => {
    try {
        await FirebaseInitializer.waitForFirebase(5, 100);
        return true;
    } catch (error) {
        console.warn('Firebase not ready, but continuing:', error.message);
        return false;
    }
};

// Generate device fingerprint for recovery
const generateDeviceFingerprint = async () => {
    try {
        const deviceId = await DeviceInfo.getUniqueId();
        const deviceModel = DeviceInfo.getModel();
        const osVersion = DeviceInfo.getSystemVersion();
        const appVersion = DeviceInfo.getVersion();
        const buildNumber = DeviceInfo.getBuildNumber();

        // Create a unique fingerprint based on device characteristics
        const fingerprint = deviceId;

        return {
            fingerprint,
            deviceInfo: {
                deviceId,
                deviceModel,
                osVersion,
                appVersion,
                buildNumber,
            },
        };
    } catch (error) {
        console.error('Error generating device fingerprint:', error);
        return null;
    }
};

// Store device mapping for recovery
const storeDeviceMapping = async (userId, deviceFingerprint) => {
    try {
        await ensureFirebaseReady();
        const docRef = doc(db, COLLECTIONS.DEVICE_MAPPINGS, deviceFingerprint);
        await setDoc(docRef, {
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        handleFirestoreError(error, 'storeDeviceMapping');
    }
};

// Find existing user by device fingerprint
const findUserByDeviceFingerprint = async (deviceFingerprint) => {
    try {
        await ensureFirebaseReady();
        const docRef = doc(db, COLLECTIONS.DEVICE_MAPPINGS, deviceFingerprint);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            if (data && data.userId) {
                return data.userId;
            }
        }
        return null;
    } catch (error) {
        handleFirestoreError(error, 'findUserByDeviceFingerprint');
        return null;
    }
};

// Generate anonymous user ID
const generateAnonymousUserId = () => {
    // const deviceId = await DeviceInfo.getUniqueId();
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create anonymous user ID with recovery
const getAnonymousUserId = async () => {
    try {
        let userId = await AsyncStorage.getItem('anonymous_user_id');

        if (!userId) {
            // Try to recover user ID from device fingerprint
            const deviceFingerprint = await generateDeviceFingerprint();
            if (deviceFingerprint) {
                const existingUserId = await findUserByDeviceFingerprint(deviceFingerprint.fingerprint);
                if (existingUserId) {
                    userId = existingUserId;
                } else {
                    userId = generateAnonymousUserId();
                    await storeDeviceMapping(userId, deviceFingerprint.fingerprint);
                }
            } else {
                userId = generateAnonymousUserId();
            }

            await AsyncStorage.setItem('anonymous_user_id', userId);
        }

        return userId;
    } catch (error) {
        console.error('Error getting anonymous user ID:', error);
        // Fallback to generating a new ID
        const fallbackId = generateAnonymousUserId();
        await AsyncStorage.setItem('anonymous_user_id', fallbackId);
        return fallbackId;
    }
};

// Store anonymous user information
const storeAnonymousUser = async (userInfo = {}) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const deviceInfo = await generateDeviceFingerprint();

        const userDoc = {
            userId,
            deviceInfo: deviceInfo?.deviceInfo || {},
            appVersion: userInfo.appVersion || '1.0.0',
            platform: userInfo.platform || 'react-native',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
        };

        const docRef = doc(db, COLLECTIONS.USERS, userId);
        await setDoc(docRef, userDoc, { merge: true });
        return userId;
    } catch (error) {
        handleFirestoreError(error, 'storeAnonymousUser');
        throw error;
    }
};

// Update last login timestamp
const updateLastLogin = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();

        const docRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(docRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        handleFirestoreError(error, 'updateLastLogin');
        throw error;
    }
};

// Store user filters
const storeUserFilters = async (filters) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const filterDoc = {
            userId,
            filters,
            updatedAt: serverTimestamp(),
        };

        const docRef = doc(db, COLLECTIONS.USER_FILTERS, userId);
        await setDoc(docRef, filterDoc, { merge: true });
        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeUserFilters');
        throw error;
    }
};

// Get user filters
const getUserFilters = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USER_FILTERS, userId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            return data && data.filters ? data.filters : [];
        }
        return [];
    } catch (error) {
        handleFirestoreError(error, 'getUserFilters');
        return [];
    }
};

// Store search keyword
const storeSearchKeyword = async (keyword) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const normalizedKeyword = keyword.toLowerCase().trim();

        // Check if this user's search history document exists
        const docRef = doc(db, COLLECTIONS.USER_SEARCH_HISTORY, userId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists) {
            // Document exists, check if keyword exists in the keywords map
            const data = docSnapshot.data();
            const keywords = data?.keywords || {};

            if (keywords[normalizedKeyword]) {
                // Keyword exists, increment the count
                keywords[normalizedKeyword] = {
                    count: (keywords[normalizedKeyword].count || 0) + 1,
                    lastSearched: serverTimestamp(),
                };
            } else {
                // New keyword, add it to the map
                keywords[normalizedKeyword] = {
                    count: 1,
                    lastSearched: serverTimestamp(),
                };
            }

            // Use setDoc with merge to update existing document
            await setDoc(docRef, {
                keywords,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        } else {
            // New user document, create it with the first keyword
            const keywords = {
                [normalizedKeyword]: {
                    count: 1,
                    lastSearched: serverTimestamp(),
                }
            };

            await setDoc(docRef, {
                userId,
                keywords,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        // Also update popular search collection (global, no user ID)
        try {
            const popularSearchRef = doc(db, COLLECTIONS.POPULAR_SEARCH, normalizedKeyword);
            const popularSearchSnapshot = await getDoc(popularSearchRef);

            if (popularSearchSnapshot.exists) {
                // Keyword exists in popular search, increment count
                await setDoc(popularSearchRef, {
                    keyword: normalizedKeyword,
                    count: increment(1),
                    updatedAt: serverTimestamp(),
                }, { merge: true });
            } else {
                // New keyword in popular search, create with count 1
                await setDoc(popularSearchRef, {
                    keyword: normalizedKeyword,
                    count: 1,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
            }
        } catch (popularError) {
            // Don't fail the main operation if popular search update fails
            console.warn('Failed to update popular search:', popularError);
        }

        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeSearchKeyword');
        throw error;
    }
};

// Get search suggestions
const getSearchSuggestions = async (limit = 4) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USER_SEARCH_HISTORY, userId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists) {
            return [];
        }

        const data = docSnapshot.data();
        const keywords = data.keywords || {};

        // Convert keywords map to array format
        const suggestions = Object.entries(keywords).map(([keyword, info]) => ({
            id: keyword,
            keyword,
            searchCount: info.count || 1,
            lastSearched: info.lastSearched?.toDate(),
        }));

        // Sort by lastSearched (most recent first)
        suggestions.sort((a, b) => {
            if (!a.lastSearched && !b.lastSearched) return 0;
            if (!a.lastSearched) return 1;
            if (!b.lastSearched) return 0;
            return b.lastSearched.getTime() - a.lastSearched.getTime();
        });

        // Return only the requested limit
        return suggestions.slice(0, limit);
    } catch (error) {
        handleFirestoreError(error, 'getSearchSuggestions');
        return [];
    }
};

// Store last location
const storeLastLocation = async (location) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const locationDoc = {
            userId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy || 0,
            address: location.address || '',
            updatedAt: serverTimestamp(),
        };

        const docRef = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
        await setDoc(docRef, locationDoc, { merge: true });
        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeLastLocation');
        throw error;
    }
};

// Get last location
const getLastLocation = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
        const docSnapshot = await getDoc(docRef);

        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            return {
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                address: data.address,
                updatedAt: data.updatedAt?.toDate(),
            };
        }
        return null;
    } catch (error) {
        handleFirestoreError(error, 'getLastLocation');
        return null;
    }
};

// Store referred place
const storeReferredPlace = async (place) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();

        const referredPlacesDocRef = doc(db, COLLECTIONS.REFERRED_PLACES, userId);
        const snapshot = await getDoc(referredPlacesDocRef);
        let referredPlacesData = snapshot.data() || {};
        if (!place.isReferred) {
            referredPlacesData = { ...referredPlacesData, [place.id]: place };

            await setDoc(referredPlacesDocRef, { ...referredPlacesData }, { merge: true });
        } else {
            // Use updateDoc with deleteField to properly remove the field
            const updateData = {};
            updateData[place.id] = deleteField();

            await updateDoc(referredPlacesDocRef, updateData);
        }

        return true;
    } catch (error) {
        handleFirestoreError(error, 'storeReferredPlace');
        return false;
    }
};

const isReferredPlace = async (placeId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const collectionRef = doc(db, COLLECTIONS.REFERRED_PLACES, userId);
        const snapshot = await getDoc(collectionRef);
        const referredPlaces = snapshot.data() || {};
        return referredPlaces[placeId] ? true : false;
    } catch (error) {
        handleFirestoreError(error, 'isReferredPlace');
        return false;
    }
};

// Get referred places
const getReferredPlaces = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const collectionRef = doc(db, COLLECTIONS.REFERRED_PLACES, userId);

        // Get all documents and filter client-side to avoid index requirements
        const snapshot = await getDocs(collectionRef);
        const referredPlaces = snapshot.data() || {};

        const places = [];
        Object.keys(referredPlaces).forEach(key => {
            places.push(referredPlaces[key]);
        });

        // Sort client-side by referredAt (most recent first)
        places.sort((a, b) => {
            if (!a.referredAt && !b.referredAt) return 0;
            if (!a.referredAt) return 1;
            if (!b.referredAt) return -1;
            return b.referredAt.getTime() - a.referredAt.getTime();
        });

        return places;
    } catch (error) {
        handleFirestoreError(error, 'getReferredPlaces');
        return [];
    }
};

// Mark place as visited
const markPlaceAsVisited = async (placeId, isVisited = true) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.REFERRED_PLACES, `${userId}_${placeId}`);

        await updateDoc(docRef, {
            isVisited,
            updatedAt: serverTimestamp(),
        });

        return true;
    } catch (error) {
        handleFirestoreError(error, 'markPlaceAsVisited');
        throw error;
    }
};

// Delete referred place
const deleteReferredPlace = async (placeId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.REFERRED_PLACES, `${userId}_${placeId}`);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        handleFirestoreError(error, 'deleteReferredPlace');
        throw error;
    }
};

// Get user statistics
const getUserStats = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();

        // Get filters
        const filtersDocRef = doc(db, COLLECTIONS.USER_FILTERS, userId);
        const filtersDoc = await getDoc(filtersDocRef);
        const hasFilters = filtersDoc.exists && Object.keys(filtersDoc.data()?.filters || {}).length > 0;

        // Get search count
        const searchDocRef = doc(db, COLLECTIONS.USER_SEARCH_HISTORY, userId);
        const searchDoc = await getDoc(searchDocRef);
        let searchCount = 0;
        if (searchDoc.exists) {
            const keywords = searchDoc.data()?.keywords || {};
            searchCount = Object.keys(keywords).length;
        }

        // Get location
        const locationDocRef = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
        const locationDoc = await getDoc(locationDocRef);
        const hasLocation = locationDoc.exists;

        // Get referred places count
        const placesCollectionRef = collection(db, COLLECTIONS.REFERRED_PLACES);
        const placesSnapshot = await getDocs(placesCollectionRef);
        const userPlaces = placesSnapshot.docs.filter(doc => doc.id.startsWith(`${userId}_`));
        const referredPlacesCount = userPlaces.length;

        // Get visited places count
        const visitedPlacesCount = userPlaces.filter(doc => {
            const data = doc.data();
            return data && data.isVisited === true;
        }).length;

        return {
            hasFilters,
            searchCount,
            hasLocation,
            referredPlacesCount,
            visitedPlacesCount,
        };
    } catch (error) {
        handleFirestoreError(error, 'getUserStats');
        return {
            hasFilters: false,
            searchCount: 0,
            hasLocation: false,
            referredPlacesCount: 0,
            visitedPlacesCount: 0,
        };
    }
};

// Clear all user data (for privacy/cleanup)
const clearUserData = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const batch = writeBatch(db);

        // Delete user document
        const userDocRef = doc(db, COLLECTIONS.USERS, userId);
        batch.delete(userDocRef);

        // Delete user filters
        const filtersDocRef = doc(db, COLLECTIONS.USER_FILTERS, userId);
        batch.delete(filtersDocRef);

        // Delete search history
        const searchDocRef = doc(db, COLLECTIONS.USER_SEARCH_HISTORY, userId);
        batch.delete(searchDocRef);

        // Delete user location
        const locationDocRef = doc(db, COLLECTIONS.USER_LOCATIONS, userId);
        batch.delete(locationDocRef);

        // Delete referred places
        const placesCollectionRef = collection(db, COLLECTIONS.REFERRED_PLACES);
        const placesSnapshot = await getDocs(placesCollectionRef);
        placesSnapshot.forEach((doc) => {
            if (doc.id.startsWith(`${userId}_`)) {
                batch.delete(doc.ref);
            }
        });

        // Delete device mappings
        const deviceFingerprint = await generateDeviceFingerprint();
        if (deviceFingerprint) {
            const mappingDocRef = doc(db, COLLECTIONS.DEVICE_MAPPINGS, deviceFingerprint.fingerprint);
            batch.delete(mappingDocRef);
        }

        await batch.commit();
        await AsyncStorage.removeItem('anonymous_user_id');
        return true;
    } catch (error) {
        handleFirestoreError(error, 'clearUserData');
        throw error;
    }
};

// Check if user data was recovered
const checkDataRecovery = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const deviceFingerprint = await generateDeviceFingerprint();

        if (!deviceFingerprint) {
            return false;
        }

        // Check if this is a recovered user by looking for device mapping
        const mappingDocRef = doc(db, COLLECTIONS.DEVICE_MAPPINGS, deviceFingerprint.fingerprint);
        const mappingDoc = await getDoc(mappingDocRef);

        if (mappingDoc.exists) {
            const mappingData = mappingDoc.data();
            // Add null check to prevent TypeError
            if (mappingData && mappingData.userId) {
                // If the mapping exists and the user ID matches, this is a recovered user
                return mappingData.userId === userId;
            }
        }

        return false;
    } catch (error) {
        handleFirestoreError(error, 'checkDataRecovery');
        return false;
    }
};

// Force data recovery (useful for testing or manual recovery)
const forceDataRecovery = async () => {
    try {
        await ensureFirebaseReady();
        const deviceFingerprint = await generateDeviceFingerprint();
        if (!deviceFingerprint) {
            return false;
        }

        const existingUserId = await findUserByDeviceFingerprint(deviceFingerprint.fingerprint);
        if (existingUserId) {
            // Store the recovered user ID locally
            await AsyncStorage.setItem('anonymous_user_id', existingUserId);
            return true;
        }

        return false;
    } catch (error) {
        handleFirestoreError(error, 'forceDataRecovery');
        return false;
    }
};

const getPlacesOfCurrentLocation = async (location, limit = 10) => {
    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter longitude in memory
        // This approach reduces the need for complex composite indexes
        const docRef = query(collection(db, COLLECTIONS.PLACES),
            where('latitude', '>=', latitude - latRange),
            where('latitude', '<=', latitude + latRange));

        const snapshot = await getDocs(docRef);

        if (!snapshot.empty) {
            // Filter longitude in memory to avoid composite index requirement
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange
                ).sort((a, b) => a.rank - b.rank)
                .slice(0, limit);
            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            const places = await storeRandomPlacesOfCurrentLocation(location);
            return places.sort((a, b) => a.rank - b.rank)
                .slice(0, 10);
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getPlacesOfCurrentLocation');
        throw error;
    }
};

const createRandomPlaces = async (location) => {
    const { latitude, longitude } = location;
    const randomPlaces = [];
    for (let i = 0; i < 50; i++) {
        let randomLatitude = latitude + (Math.random() * 0.03 - 0.015);
        let randomLongitude = longitude + (Math.random() * 0.03 - 0.015);
        const distance = Math.sqrt(Math.pow(latitude - (latitude + randomLatitude), 2) + Math.pow(longitude - (longitude + randomLongitude), 2));

        const image = faker.image.urlPicsumPhotos({ width: 50, height: 50, blur: 2 });
        const imageFull = image.replace('/50/50?blur=2', '/300/300');
        // cache the image 
        const openTime = faker.helpers.arrayElement([
            "Mon - Sat: 08:00 - 23:00",
            "Mon - Fri: 08:00 - 23:00",
            "Sat - Sun: 12:00 - 23:00",
            "Mon - Sun: 08:00 - 23:00",
            "Mon - Thu: 08:00 - 23:00",
            "Fri - Sun: 12:00 - 23:00",
            "Mon - Sun: 12:00 - 23:00",
        ]);

        const category = faker.helpers.arrayElement(Constants.filters.map(filter => filter.options.map(option => option.id)).flat());
        let tags1 = faker.helpers.arrayElement([
            'No.1',
            'No.2',
            'No.3',
            'No.4'
        ]);
        const tags2 = faker.helpers.arrayElement(Constants.filters.map(filter => filter.options.map(option => option.id)).flat());

        if (faker.number.int({ min: 0, max: 1 }) === 1) {
            tags1 = undefined;
        }
        const tags = [];
        if (tags1) {
            tags.push({
                id: faker.string.uuid(),
                title: tags1,
                style: 'tagStyle1',
            });
        }
        if (tags2) {
            tags.push({
                id: faker.string.uuid(),
                title: tags2,
                style: 'tagStyle2',
            });
        }
        randomPlaces.push({
            id: faker.string.uuid(),
            name: faker.company.name(),
            tags: tags,
            address: faker.location.streetAddress(),
            description: faker.lorem.sentence(),
            category: category,
            website: faker.internet.url(),
            openTime: openTime,
            distance: distance, // Distance in meters
            rating: faker.number.int({ min: 1, max: 5 }),
            latitude: randomLatitude,
            longitude: randomLongitude,
            rank: i + 1,
            image: image,
            imageFull: imageFull,
            isReferred: false,
        });
    }
    return randomPlaces;
};
const storeRandomPlacesOfCurrentLocation = async (location) => {
    try {
        const randomPlaces = await createRandomPlaces(location);
        const batch = writeBatch(db);
        randomPlaces.forEach(place => {
            const placeDocRef = doc(collection(db, COLLECTIONS.PLACES));
            batch.set(placeDocRef, place);
        });
        await batch.commit();
        return randomPlaces;
    }
    catch (error) {
        handleFirestoreError(error, 'storeRandomPlacesOfCurrentLocation');
        return [];
    }
};

const getFilteredPlaces = async (location, filters) => {

    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter longitude in memory
        // This approach reduces the need for complex composite indexes
        const docRef = query(collection(db, COLLECTIONS.PLACES),
            where('latitude', '>=', latitude - latRange),
            where('latitude', '<=', latitude + latRange));

        const snapshot = await getDocs(docRef);

        if (!snapshot.empty) {
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange &&
                    filters.includes(place.category)
                ).sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            const places = await storeRandomPlacesOfCurrentLocation(location);
            return places.sort((a, b) => a.rank - b.rank)
                .slice(0, 10);
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getFilteredPlaces');
        return [];
    }
};

const getSearchPlaces = async (location, searchText) => {
    const { latitude, longitude } = location;
    try {
        await ensureFirebaseReady();

        // Calculate the bounding box for the search area (3000 meters ≈ 0.03 degrees)
        const latRange = 0.03;
        const lngRange = 0.03;

        // Use a single range query on latitude first, then filter in memory
        // This approach avoids the need for complex composite indexes
        const docRef = query(collection(db, COLLECTIONS.PLACES),
            where('latitude', '>=', latitude - latRange),
            where('latitude', '<=', latitude + latRange));

        const snapshot = await getDocs(docRef);

        if (!snapshot.empty) {
            // Filter longitude and search text in memory to avoid composite index requirement
            const places = snapshot.docs
                .map(doc => doc.data())
                .filter(place =>
                    place.longitude >= longitude - lngRange &&
                    place.longitude <= longitude + lngRange &&
                    (place.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        place.address.toLowerCase().includes(searchText.toLowerCase()) ||
                        place.category.toLowerCase().includes(searchText.toLowerCase()))
                )
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            let userPlaces = [...places];
            for (const place of userPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return userPlaces;
        } else {
            // If no places found, create some random places and search in them
            const places = await storeRandomPlacesOfCurrentLocation(location);
            const filteredPlaces = places
                .filter(place =>
                    place.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    place.address.toLowerCase().includes(searchText.toLowerCase()) ||
                    place.category.toLowerCase().includes(searchText.toLowerCase())
                )
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 10);

            for (const place of filteredPlaces) {
                place.isReferred = await isReferredPlace(place.id);
            }
            return filteredPlaces;
        }
    }
    catch (error) {
        handleFirestoreError(error, 'getSearchPlaces');
        return [];
    }
};

const updateUserPersonalInfo = async (personalInfo) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(docRef, personalInfo);
        return true;
    }
    catch (error) {
        handleFirestoreError(error, 'updateUserPersonalInfo');
        return false;
    }
};

const getUserPersonalInfo = async () => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USERS, userId);
        const docSnapshot = await getDoc(docRef);
        return docSnapshot.data();
    }
    catch (error) {
        handleFirestoreError(error, 'getUserPersonalInfo');
        return null;
    }
};

// Get search count for a specific keyword
const getKeywordSearchCount = async (keyword) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.USER_SEARCH_HISTORY, userId);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists) {
            return 0;
        }

        const data = docSnapshot.data();
        const keywords = data.keywords || {};
        const normalizedKeyword = keyword.toLowerCase().trim();

        return keywords[normalizedKeyword]?.count || 0;
    } catch (error) {
        handleFirestoreError(error, 'getKeywordSearchCount');
        return 0;
    }
};

// Get popular search keywords (global, sorted by count)
const getPopularSearchKeywords = async (limit = 4) => {
    try {
        await ensureFirebaseReady();
        const collectionRef = collection(db, COLLECTIONS.POPULAR_SEARCH);

        // Get all popular search documents
        const snapshot = await getDocs(collectionRef);

        const popularKeywords = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.keyword && data.count) {
                popularKeywords.push({
                    id: doc.id,
                    keyword: data.keyword,
                    count: data.count,
                    updatedAt: data.updatedAt?.toDate(),
                });
            }
        });

        // Sort by count (highest first)
        popularKeywords.sort((a, b) => b.count - a.count);

        // Return only the requested limit
        return popularKeywords.slice(0, limit);
    } catch (error) {
        handleFirestoreError(error, 'getPopularSearchKeywords');
        return [];
    }
};

const createRandomRewards = async () => {
    const randomRewards = [];
    for (let i = 0; i < 20; i++) {
        const image = faker.image.urlPicsumPhotos({ width: 150, height: 150, blur: 0 });

        const redeemCode = faker.string.alphanumeric(8).toUpperCase();
        const status = faker.helpers.arrayElement(['active', 'past']);
        let validUntilFormatted = '';
        if (status === 'past') {
            const validUntil = faker.date.past();
            validUntilFormatted = validUntil.toISOString().split('T')[0] + ' 23:59:59';
        } else {
            const validUntil = faker.date.future();
            validUntilFormatted = validUntil.toISOString().split('T')[0] + ' 23:59:59';
        }

        randomRewards.push({
            id: faker.string.uuid(),
            title: faker.company.name(),
            type: faker.helpers.arrayElement(['Free Product', 'Discount']),
            redeemCode: redeemCode,
            description: faker.lorem.sentence(),
            validUntil: validUntilFormatted,
            status: status,
            image: image,
            howToUse: {
                title: 'How to redeem',
                content: `<p>To redeem this reward, please follow these steps:</p>
                <ul style="list-style-type: none;">
                    <li>Visit the store</li>
                    <li>Select the reward</li>
                    <li>Redeem the reward</li>
                </ul>`,
            }
        });

    }
    return randomRewards;
};

const storeRandomRewards = async () => {
    try {
        await ensureFirebaseReady();
        // check if rewards collection is empty
        const rewards = await getRewards('active');
        if (rewards.length > 0) {
            return;
        }
        const randomRewards = await createRandomRewards();
        const batch = writeBatch(db);
        randomRewards.forEach(reward => {
            const rewardDocRef = doc(collection(db, COLLECTIONS.REWARDS), reward.id);
            batch.set(rewardDocRef, reward);
        });
        await batch.commit();
        return randomRewards;
    }
    catch (error) {
        handleFirestoreError(error, 'storeRandomRewards');
        return [];
    }
};

const getRewards = async (status) => {
    try {
        await ensureFirebaseReady();
        const docRef = collection(db, COLLECTIONS.REWARDS);
        const snapshot = await getDocs(docRef);
        const currentDate = new Date();
        const sixMonthsAgo = new Date(currentDate.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
        const sortedRewards = snapshot.docs.map(doc => doc.data()).filter(reward => new Date(reward.validUntil) >= sixMonthsAgo).sort((a, b) => new Date(a.validUntil) - new Date(b.validUntil));
        console.log('sortedRewards', sortedRewards);
        if (status) {
            return sortedRewards.filter(reward => reward.status === status);
        }
        return sortedRewards;
    }
    catch (error) {
        handleFirestoreError(error, 'getRewards');
        return [];
    }
};

const storeRewardRedeemed = async (rewardId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.REWARD_REDEEMED, userId);
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data() || {};
        data[rewardId] = { redeemedAt: serverTimestamp() };
        await setDoc(docRef, data);
    } catch (error) {
        handleFirestoreError(error, 'storeRewardRedeemed');
        return false;
    }
};

const isRewardRedeemed = async (rewardId) => {
    try {
        await ensureFirebaseReady();
        const userId = await getAnonymousUserId();
        const docRef = doc(db, COLLECTIONS.REWARD_REDEEMED, userId);
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data() || {};
        return data[rewardId]?.redeemedAt;
    } catch (error) {
        handleFirestoreError(error, 'isRewardRedeemed');
        return false;
    }
};

const FirebaseStoreService = {
    // User management
    getAnonymousUserId,
    storeAnonymousUser,
    initializeAnonymousUser: storeAnonymousUser,
    updateLastLogin,

    // Filters
    storeUserFilters,
    getUserFilters,

    // Search
    storeSearchKeyword,
    getSearchSuggestions,
    getKeywordSearchCount,
    getPopularSearchKeywords,

    // Location
    storeLastLocation,
    getLastLocation,

    // Places
    storeReferredPlace,
    getReferredPlaces,
    markPlaceAsVisited,
    deleteReferredPlace,

    // Statistics
    getUserStats,

    // Data management
    clearUserData,
    checkDataRecovery,
    forceDataRecovery,

    // Device fingerprinting
    generateDeviceFingerprint,
    storeDeviceMapping,
    findUserByDeviceFingerprint,

    // Places
    getPlacesOfCurrentLocation,
    createRandomPlaces,
    storeRandomPlacesOfCurrentLocation,
    isReferredPlace,
    getFilteredPlaces,
    getSearchPlaces,

    // Personal info
    updateUserPersonalInfo,
    getUserPersonalInfo,

    // Rewards
    storeRewardRedeemed,
    isRewardRedeemed,
    storeRandomRewards,
    getRewards,
    // Collections
    COLLECTIONS,
};

export default FirebaseStoreService;
