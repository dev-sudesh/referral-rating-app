import { lazy } from 'react'
import MapsController from '../../../controllers/maps/MapsController'
import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import { calculateDistance } from '../../../utils/DistanceUtils'
import ImageAsset from '../../../assets/images/ImageAsset'

const PlaceApiController = {
    nearbyPlaces: () => {
        return useMutation({
            mutationFn: async (params) => {
                const { latitude, longitude, limit, radius, enhanced } = params || {}
                try {
                    const response = await Api.get({
                        url: Api.url.place.nearby({ latitude, longitude, limit, radius, enhanced })
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