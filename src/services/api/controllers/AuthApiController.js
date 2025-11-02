import Api from '../Api'
import { useMutation } from '@tanstack/react-query'
import DeviceInfo from '../../../utils/deviceInfo/DeviceInfo'

const AuthApiController = {
    anonymousToken: () => {
        return useMutation({
            mutationFn: async () => {
                try {
                    // get Device id from device info 
                    const deviceUniqueId = DeviceInfo.deviceUniqueId
                    console.log('deviceUniqueId', deviceUniqueId)
                    const response = await Api.post({
                        url: Api.url.auth.anonymousToken(),
                        headerConfig: {
                            'X-Device-Hash': deviceUniqueId
                        }
                    })
                    console.log('response', response)
                } catch (error) {
                    console.log('error', error)
                }
            }
        })
    },
    // refreshToken: () => {
    //     return useMutation({
    //         mutationFn: async () => {
    //             try {
    //                 const tokenData = await AsyncStore.getItem(AsyncStore.keys.tokenData)
    //                 const response = await Api.get({
    //                     url: Api.url.auth.refreshToken(),
    //                     headerConfig: { authType: Api.AuthType.auth, token: tokenData?.refreshToken }
    //                 })
    //                 const res = response.content || response
    //                 const newTokenData = {
    //                     token: res?.token,
    //                     refreshToken: res?.refreshToken,
    //                     tokenExpireAt: res?.tokenExpireAt,
    //                 }
    //                 await AsyncStore.setItem(AsyncStore.keys.tokenData, JSON.stringify(newTokenData))
    //                 return res
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Token refresh failed');
    //             }
    //         }
    //     })
    // },
    // getLoginData: () => {
    //     return useMutation({
    //         mutationFn: async (data) => {
    //             try {
    //                 const response = await Api.post({
    //                     url: Api.url.auth.login(),
    //                     data: data,
    //                     headerConfig: { authType: Api.AuthType.basic }
    //                 })
    //                 return response.content || response
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Login failed');
    //             }
    //         },
    //     })
    // },
    // getOtpData: () => {
    //     return useMutation({
    //         mutationFn: async (data) => {
    //             try {
    //                 const response = await Api.post({
    //                     url: Api.url.auth.verifyOtp(),
    //                     data: data,
    //                     headerConfig: { authType: Api.AuthType.basic }
    //                 })
    //                 return response.content || response
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Otp verification failed');
    //             }
    //         }
    //     })
    // },
    // resendOtp: () => {
    //     return useMutation({
    //         mutationFn: async (data) => {
    //             try {
    //                 const response = await Api.post({
    //                     url: Api.url.auth.resendOtp(),
    //                     data: data,
    //                     headerConfig: { authType: Api.AuthType.basic }
    //                 })
    //                 return response.content || response
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Otp resend failed');
    //             }
    //         }
    //     })
    // },
    // astroRegisterUserApi: () => {
    //     // const { updateAstroDiscountData } = useAstroDiscountController()
    //     return useMutation({
    //         mutationFn: async (data) => {
    //             try {
    //                 const tokenData = await AsyncStore.getItem(AsyncStore.keys.tokenData)
    //                 const response = await Api.post({
    //                     url: Api.url.user.astrologerRegister(),
    //                     data: data,
    //                     headerConfig: { authType: Api.AuthType.auth, token: tokenData?.token }
    //                 })
    //                 // updateAstroDiscountData(response)

    //                 return response
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Device info set failed');
    //             }
    //         }
    //     })
    // },
    // getRegisterUser: () => {
    //     return useMutation({
    //         mutationFn: async (data) => {
    //             try {
    //                 const tokenData = await AsyncStore.getItem(AsyncStore.keys.tokenData)
    //                 const token = (tokenData !== null ? tokenData?.token : global.activeUser?.token);
    //                 const response = await Api.post({
    //                     url: Api.url.auth.register(),
    //                     data: data,
    //                     headerConfig: { authType: Api.AuthType.auth, token: token }
    //                 })
    //                 return response
    //             } catch (error) {
    //                 throw new Error(error?.response?.data?.message || error?.message || 'Device info set failed');
    //             }
    //         }
    //     })
    // }, 
}

export default AuthApiController