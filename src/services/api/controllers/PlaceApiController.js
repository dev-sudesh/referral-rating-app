import { lazy } from 'react'
import MapsController from '../../../controllers/maps/MapsController'
import Api from '../Api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { calculateDistance } from '../../../utils/DistanceUtils'
import ImageAsset from '../../../assets/images/ImageAsset'
import SearchFilterController from '../../../controllers/filters/SearchFilterController'
import ReferralController from '../../../controllers/referrals/ReferralController'

const PlaceApiController = {
    placeCategories: () => {
        return useQuery({
            queryKey: ['placeCategories'],
            queryFn: async () => {
                try {
                    const response = await Api.get({
                        url: Api.url.place.categories(),
                        headerConfig: {
                            authType: Api.AuthType.auth
                        }
                    })
                    if (response.statusCode === 200) {
                        const processedCategories = processedPlaceCategories(response)
                        return processedCategories
                    } else {
                        return []
                    }
                } catch (error) {
                    return []
                }
            }
        })
    },
    nearbyPlaces: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { latitude, longitude, limit, radius, enhanced, category } = params || {}
                try {
                    const nearbyUrl = Api.url.place.nearby({ latitude, longitude, limit, radius, enhanced, category });
                    const referralsUrl = Api.url.user.referrals({ latitude, longitude, radius });
                    const [placesResponse, referralsResponse] = await Promise.all([
                        Api.get({
                            url: nearbyUrl,
                            headerConfig: {
                                authType: Api.AuthType.auth
                            }
                        }),
                        Api.get({
                            url: referralsUrl,
                            headerConfig: {
                                authType: Api.AuthType.auth
                            }
                        })
                    ])
                    if (placesResponse.statusCode === 200) {
                        const processedPlaces = processedNearbyPlaces(placesResponse, referralsResponse, { latitude, longitude })
                        return processedPlaces
                    } else {
                        return placesResponse
                    }
                } catch (error) {
                    // Error handled silently
                }
            }
        })
    },
    searchPlaces: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { query, latitude, longitude, limit = 10, radius = 3000, enhanced = true } = params || {}
                try {
                    const searchUrl = Api.url.place.search({ query, latitude, longitude, limit, radius, enhanced });
                    const referralsUrl = Api.url.user.referrals({ latitude, longitude, radius });
                    const [placesResponse, referralsResponse] = await Promise.all([
                        Api.get({
                            url: searchUrl,
                            headerConfig: {
                                authType: Api.AuthType.auth
                            }
                        }),
                        Api.get({
                            url: referralsUrl,
                            headerConfig: {
                                authType: Api.AuthType.auth
                            }
                        })
                    ])
                    if (placesResponse.statusCode === 200) {
                        const processedPlaces = processedSearchPlaces(placesResponse, referralsResponse, { latitude, longitude })
                        return processedPlaces
                    } else {
                        return placesResponse
                    }
                } catch (error) {
                    // Error handled silently
                }
            }
        })
    },
    placeDetails: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { place } = params || {}
                try {
                    const response = await Api.get({
                        url: Api.url.place.details({ placeId: place.id }),
                        headerConfig: {
                            authType: Api.AuthType.auth
                        }
                    })
                    if (response.statusCode === 200) {
                        const processedPlace = processedPlaceDetails(response, place)
                        return processedPlace
                    } else {
                        return response
                    }
                } catch (error) {
                    // Error handled silently
                }
            }
        })
    }
}

const processedPlaceCategories = (response) => {
    if (!response || !response.categories || !Array.isArray(response.categories)) {
        return []
    }

    const res = [{
        id: 'category',
        title: 'Category',
        options: response.categories.map(category => {
            const label = category.label;
            return { id: category.id, label: label }
        })
    }]
    SearchFilterController.getState().setPlaceCategories(res)
    return res
}
const processedNearbyPlaces = (response, referralsResponse, userLocation) => {
    const referralIds = new Set((referralsResponse?.results || []).map(r => r.id));
    const currentPlaces = MapsController.getState().places || [];
    const currentReferred = currentPlaces.filter(p => p.isReferred);

    // Also check ReferralController's referredPlaces state to ensure all already referred places are marked
    const referredPlacesFromController = ReferralController.getState().referredPlaces || [];
    const referredPlaceIdsFromController = new Set(
        referredPlacesFromController
            .filter(ref => ref && (ref.id || ref.place_id))
            .map(ref => ref.id || ref.place_id)
    );

    // Combine both sources: API response and ReferralController state
    const allReferralIds = new Set([...referralIds, ...referredPlaceIdsFromController]);

    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        let image = null
        let imageList = []
        if (place.photo_uris?.length > 0) {
            image = place.photo_uris[0]
            place.photo_uris.forEach(uri => imageList.push(uri))
        }
        // Check if place is referred from either API response or ReferralController state
        const isReferred = allReferralIds.has(place.id);

        // Check if this place was previously referred
        const previousPlace = currentPlaces.find(p => p.id === place.id);
        const wasReferred = previousPlace?.isReferred || false;

        // If it was referred but not in current referralIds, silently handle
        // (Place will be marked as not referred based on current API response)

        return {
            id: place.id,
            name: place.name,
            address: place.address,
            latitude: place.location.Lat,
            longitude: place.location.Lng,
            distance,
            category: place.primary_type,
            image,
            imageFull: image,
            imageList: imageList,
            isReferred: isReferred,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })

    const referredInNewPlaces = res.filter(p => p.isReferred);

    MapsController.getState().setPlaces(res);

    // Verify after setting
    setTimeout(() => {
        const verifyAfterSet = MapsController.getState().places?.filter(p => p.isReferred) || [];
    }, 50);

    return res
}

const processedPlaceDetails = (response, place) => {
    let placeDetails = {
        ...place,
    }
    if (response.statusCode === 200) {
        const userLocation = MapsController.getState().userLocation;
        const resData = response.result;
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: resData.location.Lat, longitude: resData.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        let image = null
        let imageList = []
        if (resData.photo_uris?.length > 0) {
            image = resData.photo_uris[0]
            resData.photo_uris.forEach(uri => imageList.push(uri))
        }
        const isReferred = place.isReferred
        placeDetails = {
            id: resData.id,
            name: resData.name,
            address: resData.address,
            latitude: resData.location.Lat,
            longitude: resData.location.Lng,
            distance,
            category: resData.primary_type,
            image,
            imageFull: image,
            imageList: imageList,
            isReferred: isReferred,
            openTime: resData.weekday_descriptions?.join('\n') || '',
            website: resData.website_uri,
        }
    }

    const places = MapsController.getState().places
    const previousPlace = places?.find(p => p.id === place.id);
    const updatedPlaces = places?.map(p => p.id === place.id ? { ...p, ...placeDetails } : p) || []
    const updatedReferred = updatedPlaces.filter(p => p.isReferred);
    const previousReferred = places?.filter(p => p.isReferred) || [];

    MapsController.getState().setPlaces(updatedPlaces)
    MapsController.getState().setSelectedPlace(placeDetails)

    // Verify after setting
    setTimeout(() => {
        const verifyAfterSet = MapsController.getState().places?.filter(p => p.isReferred) || [];
    }, 50);

    return placeDetails
}

const processedSearchPlaces = (response, referralsResponse, userLocation) => {
    // Get referral IDs from API response
    const referralIdsFromApi = new Set((referralsResponse?.results || []).map(r => r.id));

    // Also check ReferralController's referredPlaces state to ensure all already referred places are marked
    const referredPlacesFromController = ReferralController.getState().referredPlaces || [];
    const referredPlaceIdsFromController = new Set(
        referredPlacesFromController
            .filter(ref => ref && (ref.id || ref.place_id))
            .map(ref => ref.id || ref.place_id)
    );

    // Combine both sources: API response and ReferralController state
    const allReferralIds = new Set([...referralIdsFromApi, ...referredPlaceIdsFromController]);

    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        let image = null
        let imageList = []
        if (place.photo_uris?.length > 0) {
            image = place.photo_uris[0]
            place.photo_uris.forEach(uri => imageList.push(uri))
        }
        // Check if place is referred from either API response or ReferralController state
        const isReferred = allReferralIds.has(place.id);
        return {
            id: place.id,
            name: place.name,
            address: place.address,
            latitude: place.location.Lat,
            longitude: place.location.Lng,
            distance,
            category: place.primary_type,
            image,
            imageFull: image,
            imageList: imageList,
            isReferred: isReferred,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })
    return res
}

export default PlaceApiController