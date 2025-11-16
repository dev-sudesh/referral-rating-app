import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import ReferralController from '../../../controllers/referrals/ReferralController'

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
                    console.log('error', error)
                }
            }
        })
    },

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
    return response
}

export default UserApiController