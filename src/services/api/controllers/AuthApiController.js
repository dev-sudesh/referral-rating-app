import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import DeviceInfo from '../../../utils/deviceInfo/DeviceInfo'
import AsyncStoreUtils from '../../../utils/AsyncStoreUtils'

const AuthApiController = {
    anonymousToken: () => {
        return useMutation({
            mutationFn: async () => {
                try {
                    // get Device id from device info 
                    const deviceUniqueId = DeviceInfo.deviceUniqueId
                    const response = await Api.post({
                        url: Api.url.auth.anonymousToken(),
                        headerConfig: {
                            'X-Device-Hash': deviceUniqueId
                        }
                    })
                    if (Api.isSuccess(response)) {
                        const processedResponse = processedAnonymousToken(response)
                        return processedResponse
                    } else {
                        return []
                    }
                } catch (error) {
                    console.log('error', error)
                }
            }
        })
    },
}

const processedAnonymousToken = async (response) => {
    const responseData = response.content || response
    const accessToken = {
        token: responseData.session_token,
        expiresAt: responseData.expires_at,
    }
    await AsyncStoreUtils.setAuthTokens(accessToken)
    return accessToken
}

export default AuthApiController