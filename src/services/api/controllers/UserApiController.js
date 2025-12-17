import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import ReferralController from '../../../controllers/referrals/ReferralController'

// Standalone function that can be called from anywhere (components or utilities)
const saveUserLocation = async ({ latitude, longitude }) => {
    try {
        const response = await Api.post({
            url: Api.url.user.saveLocation(),
            data: {
                lat: latitude,
                lng: longitude,
            },
            headerConfig: {
                authType: Api.AuthType.auth
            }
        })
        if (Api.isSuccess(response)) {
            return response
        } else {
            return null
        }
    } catch (error) {
        console.warn('error', error)
        throw error
    }
}

const UserApiController = {
    profile: () => {
        return useMutation({
            mutationFn: async () => {
                try {
                    const response = await Api.get({
                        url: Api.url.user.profile(),
                        headerConfig: {
                            authType: Api.AuthType.auth
                        }
                    })
                    if (Api.isSuccess(response)) {
                        const processedProfile = processedProfileData(response)
                        return processedProfile
                    } else {
                        return null
                    }
                } catch (error) {
                    console.warn('error', error)
                }
            }
        })
    },
    saveLocation: () => {
        return useMutation({
            mutationFn: saveUserLocation
        })
    },
    // Expose the standalone function for use in utilities
    saveLocationDirect: saveUserLocation,
}

const processedProfileData = (response) => {
    const resReferrals = response.referrals || []
    const referrals = resReferrals.map(referral => ({
        id: referral.place_id,
        name: referral.display_name,
        address: referral.address,
        latitude: referral.coords?.lat,
        longitude: referral.coords?.lng,
        category: referral.primary_type,
    }))
    ReferralController.getState().setReferredPlaces(referrals)
    const settings = response.settings || {}
    return response
}

export default UserApiController