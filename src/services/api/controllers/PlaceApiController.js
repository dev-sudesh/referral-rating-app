import { lazy } from 'react'
import MapsController from '../../../controllers/maps/MapsController'
import Api from '../Api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { calculateDistance } from '../../../utils/DistanceUtils'
import ImageAsset from '../../../assets/images/ImageAsset'
import SearchFilterController from '../../../controllers/filters/SearchFilterController'

const PlaceApiController = {
    placeCategories: () => {
        return useQuery({
            queryKey: ['placeCategories'],
            queryFn: async () => {
                try {
                    const response = await Api.get({
                        url: Api.url.place.categories()
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
                    const response = await Api.get({
                        url: Api.url.place.nearby({ latitude, longitude, limit, radius, enhanced, category })
                    })
                    if (response.statusCode === 200) {
                        const processedPlaces = processedNearbyPlaces(response, { latitude, longitude })
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
                    const response = await Api.get({
                        url: Api.url.place.search({ query, latitude, longitude, limit, radius, enhanced })
                    })
                    console.log('searchPlaces', response)
                    if (response.statusCode === 200) {
                        const processedPlaces = processedSearchPlaces(response, { latitude, longitude })
                        return processedPlaces
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
const processedNearbyPlaces = (response, userLocation) => {
    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        const image = place.photo_uris?.length > 0 ? place.photo_uris[0] : null
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
            isReferred: false,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })

    MapsController.getState().setPlaces(res)
    return res
}

const processedSearchPlaces = (response, userLocation) => {
    const res = response.results.slice(0, 10).map(place => {
        const coord1 = { latitude: userLocation.latitude, longitude: userLocation.longitude }
        const coord2 = { latitude: place.location.Lat, longitude: place.location.Lng }
        const distance = calculateDistance(coord1, coord2)
        const image = place.photo_uris?.length > 0 ? place.photo_uris[0] : null
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
            isReferred: false,
            openTime: place.weekday_descriptions?.join('\n') || '',
            website: place.website_uri,
        }
    })
    return res
}

export default PlaceApiController