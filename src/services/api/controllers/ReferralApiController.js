import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import ReferralController from '../../../controllers/referrals/ReferralController'

const ReferralApiController = {
    referPlace: () => {
        return useMutation({
            mutationFn: async ({ place, placeId, action = 'refer' }) => {
                try {
                    const headerConfig = buildHeaderConfig();

                    const normalizedAction = action?.toLowerCase();
                    let data;
                    let requestFn;

                    switch (normalizedAction) {
                        case 'unrefer': {
                            data = buildUnreferPlacePayload({ placeId });
                            requestFn = Api.delete;
                            break;
                        }
                        case 'refer':
                        default: {
                            if (!place) {
                                throw new Error('ReferralApiController.referPlace requires a place object for refer action');
                            }
                            data = buildReferPlacePayload({ place });
                            requestFn = Api.post;
                            break;
                        }
                    }

                    const response = await requestFn({
                        url: Api.url.referral.refer(),
                        data,
                        headerConfig,
                    })

                    if (Api.isSuccess(response)) {
                        return processedReferPlaceData(response)
                    } else {
                        return null
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }
        })
    },
    referrals: () => {
        return useMutation({
            mutationFn: async ({ latitude, longitude }) => {
                try {
                    const response = await Api.get({
                        url: Api.url.user.referrals({ latitude, longitude }),
                        headerConfig: {
                            authType: Api.AuthType.auth
                        }
                    })
                    if (Api.isSuccess(response)) {
                        const processedReferrals = processedReferralsData(response)
                        return processedReferrals
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

const buildReferPlacePayload = ({ place = {} }) => {
    const placeId = place.id;
    const displayName = place.name;
    const address = place.address;
    const primaryType = place.category;

    const latitude = place.latitude;
    const longitude = place.longitude;

    const payload = {
        place_id: placeId,
        display_name: displayName,
        address,
        primary_type: primaryType,
    };

    if (!payload.place_id) {
        throw new Error('place_id is required to refer a place');
    }

    const coords = {};
    if (typeof latitude === 'number') {
        coords.lat = latitude;
    }
    if (typeof longitude === 'number') {
        coords.lng = longitude;
    }

    if (Object.keys(coords).length > 0) {
        payload.coords = coords;
    }

    return payload;
}

const buildUnreferPlacePayload = ({ placeId }) => {
    const resolvedPlaceId = placeId;
    if (!resolvedPlaceId) {
        throw new Error('place_id is required to unrefer a place');
    }
    return {
        place_id: resolvedPlaceId,
    }
}

const buildHeaderConfig = () => {
    return {
        authType: Api.AuthType.auth
    };
}

const processedReferPlaceData = (response) => {
    return response
}

const processedReferralsData = (response) => {
    const referrals = response.referrals || []
    ReferralController.getState().setReferredPlaces(referrals)
    return referrals
}

export default ReferralApiController