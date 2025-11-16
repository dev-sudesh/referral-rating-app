import { lazy } from 'react'
import MapsController from '../../../controllers/maps/MapsController'
import Api from '../Api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { calculateDistance } from '../../../utils/DistanceUtils'
import ImageAsset from '../../../assets/images/ImageAsset'
import SearchFilterController from '../../../controllers/filters/SearchFilterController'
import AsyncStoreUtils from '../../../utils/AsyncStoreUtils'
import DeviceInfo from '../../../utils/deviceInfo/DeviceInfo'

const PlaceApiController = {
    placeCategories: () => {
        return useQuery({
            queryKey: ['placeCategories'],
            queryFn: async () => {
                try {
                    const accessToken = await AsyncStoreUtils.getAuthTokens();
                    const deviceUniqueId = DeviceInfo.deviceUniqueId;
                    const response = await Api.get({
                        url: Api.url.place.categories(),
                        headerConfig: {
                            authType: Api.AuthType.auth,
                            token: accessToken?.token,
                            'X-Device-Hash': deviceUniqueId
                        }
                    })
                    if (response.statusCode === 200) {
                        const processedCategories = processedPlaceCategories(response)
                        return processedCategories
                    } else {
                        return []
                    }
                } catch (error) {
                    console.log('error', error)
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
                    const accessToken = await AsyncStoreUtils.getAuthTokens();
                    const deviceUniqueId = DeviceInfo.deviceUniqueId;
                    const [placesResponse, referralsResponse] = await Promise.all([
                        Api.get({
                            url: Api.url.place.nearby({ latitude, longitude, limit, radius, enhanced, category }),
                            headerConfig: {
                                authType: Api.AuthType.auth,
                                token: accessToken?.token,
                                'X-Device-Hash': deviceUniqueId
                            }
                        }),
                        Api.get({
                            url: Api.url.user.referrals({ latitude, longitude, radius }),
                            headerConfig: {
                                authType: Api.AuthType.auth,
                                token: accessToken?.token,
                                'X-Device-Hash': deviceUniqueId
                            }
                        })
                    ])
                    if (placesResponse.statusCode === 200) {
                        const processedPlaces = processedNearbyPlaces(placesResponse, referralsResponse, { latitude, longitude })
                        return processedPlaces
                    } else {
                        return response
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }
        })
    },
    searchPlaces: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { query, latitude, longitude, limit = 10, radius = 1000, enhanced = true } = params || {}
                try {
                    const accessToken = await AsyncStoreUtils.getAuthTokens();
                    const deviceUniqueId = DeviceInfo.deviceUniqueId;
                    const [placesResponse, referralsResponse] = await Promise.all([
                        Api.get({
                            url: Api.url.place.search({ query, latitude, longitude, limit, radius, enhanced }),
                            headerConfig: {
                                authType: Api.AuthType.auth,
                                token: accessToken?.token,
                                'X-Device-Hash': deviceUniqueId
                            }
                        }),
                        Api.get({
                            url: Api.url.user.referrals({ latitude, longitude, radius }),
                            headerConfig: {
                                authType: Api.AuthType.auth,
                                token: accessToken?.token,
                                'X-Device-Hash': deviceUniqueId
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
                    console.log('error', error)
                }
            }
        })
    },
    placeDetails: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { place } = params || {}
                try {
                    const accessToken = await AsyncStoreUtils.getAuthTokens();
                    const deviceUniqueId = DeviceInfo.deviceUniqueId;
                    const response = await Api.get({
                        url: Api.url.place.details({ placeId: place.id }),
                        headerConfig: {
                            authType: Api.AuthType.auth,
                            token: accessToken?.token,
                            'X-Device-Hash': deviceUniqueId
                        }
                    })
                    if (response.statusCode === 200) {
                        const processedPlace = processedPlaceDetails(response, place)
                        return processedPlace
                    } else {
                        return response
                    }
                } catch (error) {
                    console.log('error', error)
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
    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        const image = place.photo_uris?.length > 0 ? place.photo_uris[0] : null
        const isReferred = referralsResponse?.results?.find(referral => referral.id === place.id) ? true : false
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
            isReferred: isReferred,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })

    MapsController.getState().setPlaces(res)
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
        const image = resData.photo_uris?.length > 0 ? resData.photo_uris[0] : null
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
            isReferred: isReferred,
            openTime: resData.weekday_descriptions?.join('\n') || '',
            website: resData.website_uri,
        }
    }

    const places = MapsController.getState().places
    const updatedPlaces = places?.map(p => p.id === place.id ? { ...p, ...placeDetails } : p) || []
    MapsController.getState().setPlaces(updatedPlaces)
    MapsController.getState().setSelectedPlace(placeDetails)
    return placeDetails
}

const processedSearchPlaces = (response, referralsResponse, userLocation) => {
    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        const image = place.photo_uris?.length > 0 ? place.photo_uris[0] : null
        const isReferred = referralsResponse?.results?.find(referral => referral.id === place.id) ? true : false
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
            isReferred: isReferred,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })
    return res
}

export default PlaceApiController