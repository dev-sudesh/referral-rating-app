import axios from 'axios'
import Env from '../../config/env'
import AsyncStoreUtils from '../../utils/AsyncStoreUtils'
import DeviceInfo from '../../utils/deviceInfo/DeviceInfo'

const API = {}

API.url = {
    auth: {
        anonymousToken: () => `/api/anon/sessions`,
        profile: () => `/api/anon/profile`,
    },
    place: {
        categories: () => `/api/places/categories`,
        nearby: ({ latitude, longitude, limit = 10, radius = 5000, enhanced = true, category }) => `api/places${!category ? '/top' : ''}?lat=${latitude}&lng=${longitude}&radius=${radius}&limit=${limit}&enhanced=${enhanced}${category ? '&category=' + category : ''}`,
        search: ({ query, latitude, longitude, limit = 10, radius = 5000, enhanced = true }) => `api/places/search?query=${query}&lat=${latitude}&lng=${longitude}&limit=${limit}&radius=${radius}&enhanced=${enhanced}`,
        details: ({ placeId }) => `/api/places/details/enhanced?provider=google&place_id=${placeId}`,
    },
    referral: {
        refer: () => `/api/places/refer`,
    },
    user: {
        profile: () => `/api/anon/profile`,
        referrals: ({ latitude, longitude, radius = 5000 }) => `/api/user/referrals?lat=${latitude}&lng=${longitude}&radius=${radius}`,
        saveLocation: () => `/api/user/location`,
    }
}

const successStatuses = [200, 201, '200', '201', 'ok', 'OK', 'success', 'SUCCESS']

API.isSuccess = (response) => {
    let responseData = response
    if (response && typeof response === 'string') {
        responseData = JSON.parse(response)
    }
    return successStatuses.includes(responseData?.statusCode) || successStatuses.includes(responseData?.status) || successStatuses.includes(responseData?.statusText) || successStatuses.includes(responseData?.data?.statusCode)
}

const defaultCallbacks = {
    onSuccess: () => { },
    onError: () => { }
}

const defaultRetryCount = 0
const defaultTimeout = 30000

API.AuthType = {
    auth: 'auth',
    basic: 'basic',
    none: 'none'
}

API.headers = ({ authType = API.AuthType.none, token, multiPart = false, timeout = 30000, ...rest } = {}) => {
    let headerConfig = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    if (authType === API.AuthType.auth) {
        headerConfig['Authorization'] = `Bearer ${token}`
    } else if (authType === API.AuthType.basic) {
        headerConfig['Authorization'] = Env.basicHeader
    }
    headerConfig = { ...headerConfig, ...rest }
    return headerConfig
}

API.instance = axios.create({
    baseURL: Env.API_URL,
    headers: API.headers(),
    timeout: defaultTimeout,
})

let isRefreshing = false;
let failedQueue = [];

// Request interceptor to automatically add auth tokens
API.instance.interceptors.request.use(
    async (config) => {
        // If Authorization header is already set, use it
        if (config.headers?.Authorization) {
            return config;
        }

        // Check if this request needs authentication
        // We'll check for authType in the config metadata or check the URL pattern
        const needsAuth = config.headers?.['X-Requires-Auth'] === 'true' ||
            config.headers?.['authType'] === API.AuthType.auth;

        if (needsAuth) {
            try {
                const tokenData = await AsyncStoreUtils.getAuthTokens();
                if (tokenData?.token) {
                    config.headers.Authorization = `Bearer ${tokenData.token}`;
                }
                // Add device hash if not already present
                if (!config.headers['X-Device-Hash']) {
                    config.headers['X-Device-Hash'] = DeviceInfo.deviceUniqueId;
                }
            } catch (error) {
                console.error('Error adding auth token to request:', error);
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const handleTokenRefresh = async (failedRequest) => {
    try {
        const response = await API.post({
            url: API.url.auth.anonymousToken(),
            headerConfig: {
                'X-Device-Hash': DeviceInfo.deviceUniqueId
            }
        });

        if (API.isSuccess(response)) {
            const responseData = response?.content || response;
            const accessToken = {
                token: responseData.session_token,
                expiresAt: responseData.expires_at,
            };
            await AsyncStoreUtils.setAuthTokens(accessToken);

            if (failedRequest?.response?.config || failedRequest?.config) {
                const originalConfig = failedRequest?.response?.config || failedRequest?.config;
                const newConfig = { ...originalConfig };

                // Update headers with new token
                newConfig.headers = {
                    ...newConfig.headers,
                    ...API.headers({
                        authType: API.AuthType.auth,
                        token: accessToken.token
                    }),
                    'X-Device-Hash': DeviceInfo.deviceUniqueId
                };

                // Remove retry flag to allow retry
                delete newConfig._retry;

                return newConfig;
            }
            throw new Error('Invalid request configuration');
        }
        throw new Error('Invalid token response');
    } catch (error) {
        // If we get 401 during refresh token, clear token data
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            await AsyncStoreUtils.clearAuthTokens();
        }
        throw error;
    }
};

API.instance.interceptors.response.use(
    (response) => response,

    async (error) => {
        // Ensure error is an Axios error
        if (!axios.isAxiosError(error)) {
            return Promise.reject(new Error('Non-Axios error occurred'));
        }

        const originalRequest = error.config;
        // check token passed in header
        // console.log('originalRequest.headers', originalRequest.headers)
        // console.error("api calling error on url ", originalRequest.url, ' with status code ', error.response?.status)
        if (!originalRequest) {
            return Promise.reject(error);
        }

        const statusCode = error.response?.status;

        // If it's 401 on refresh token request, reject immediately
        if (statusCode === 401 && originalRequest.url.includes(API.url.auth.anonymousToken())) {
            await AsyncStoreUtils.clearAuthTokens();
            return Promise.reject(error);
        }

        // Handle 423 (token expired) or 401 (unauthorized) that's not from refresh token
        if (statusCode === 423 || statusCode === 401) {
            // Don't retry if this request was already retried
            if (originalRequest._retry) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return API.instance(originalRequest);
                }).catch((err) => {
                    if (axios.isAxiosError(err)) {
                        return Promise.reject(err);
                    }
                    return Promise.reject(new Error(err?.message || 'Request failed'));
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newConfig = await handleTokenRefresh(error);
                isRefreshing = false;
                processQueue(null, newConfig.headers['Authorization']);
                return API.instance(newConfig);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

API.processResponse = (resp, url) => {
    let payload = resp.data;
    let message = resp.data?.message || 'Processed Ok';
    let statusCode = resp.data?.statusCode || 200;
    let status = 'ok';
    return { url: url, status: status, message: message, ...payload, statusCode: statusCode };
}

API.processError = (error, url) => {
    const errorResponse = {
        url: url,
        status: 'network',
        statusCode: error?.response?.status || error?.status,
        message: error?.response?.data?.message || error?.message || 'Unprocessable Entity or Network Error',
        errors: {},
        originalError: error
    };

    const status = error?.response?.status;

    switch (status) {
        case 400:
            errorResponse.status = 'authentication';
            break;
        case 401:
            errorResponse.status = 'unauthorized';
            // Clear token data on 401 from refresh token
            if (url === API.url.auth.anonymousToken()) {
                AsyncStoreUtils.clearAuthTokens();
            } else {

            }
            break;
        case 403:
            errorResponse.status = 'inactive';
            break;
        case 404:
            errorResponse.status = 'notfound';
            break;
        case 406:
            errorResponse.status = 'invalidlogout';
            break;
        case 422:
            errorResponse.status = 'authentication';
            break;
        case 423:
            errorResponse.status = 'tokenExpired';
            if (url === API.url.auth.anonymousToken()) {
                errorResponse.status = 'refreshTokenFailed';
                errorResponse.statusCode = 424;
                errorResponse.message = 'Unable to re-generate token';
                AsyncStoreUtils.clearAuthTokens();
            }
            break;
        case 424:
            errorResponse.status = 'refreshTokenFailed';
            errorResponse.message = 'Unable to re-generate token';
            AsyncStoreUtils.clearAuthTokens();
            break;
        case 500:
            errorResponse.status = 'server';
            break;
        case 502:
            errorResponse.status = 'invalid';
            break;
        case 430:
        default:
            errorResponse.status = 'network';
            break;
    }
    return errorResponse;
};

// Add performance measurement utility
const measureApiPerformance = async (apiCall) => {
    const startTime = performance.now();
    try {
        const response = await apiCall();
        const endTime = performance.now();
        const duration = endTime - startTime;

        // // Log performance metrics
        // console.log(`API Performance - URL: ${response?.url || 'unknown'}`);
        // console.log(`Response Time: ${duration.toFixed(2)}ms`);
        // console.log(`Status Code: ${response?.statusCode || 'unknown'}`);

        return response;
    } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Log performance metrics for failed requests
        // console.log(`API Performance - Failed Request`);
        // console.log(`Response Time: ${duration.toFixed(2)}ms`);
        // console.log(`Error: ${error?.message || 'unknown error'}`);

        throw error;
    }
};

API.get = async ({ url, params, headerConfig = {}, callbacks = defaultCallbacks, retryCount = defaultRetryCount }) => {
    return measureApiPerformance(async () => {
        try {
            // Prepare headers
            const headers = { ...headerConfig };

            if (headerConfig.authType === API.AuthType.auth) {
                // Get token and extract the token string
                const tokenData = await AsyncStoreUtils.getAuthTokens();
                if (tokenData?.token) {
                    headers.token = tokenData.token;
                    headers.authType = API.AuthType.auth;
                }
                headers['X-Device-Hash'] = DeviceInfo.deviceUniqueId;
                headers['X-Requires-Auth'] = 'true';
            }

            const response = await API.instance.get(url, {
                params,
                headers: API.headers(headers)
            })
            callbacks.onSuccess(response.data)
            if (API.isSuccess(response)) {
                return API.processResponse(response, url)
            } else {
                return API.processError(response.data, url)
            }
        } catch (error) {
            if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error')) && retryCount > 1) {
                if (retryCount < 3) {
                    return API.get({ url, params, headerConfig, callbacks, retryCount: retryCount - 1 })
                }
            }
            callbacks.onError(error)
            return API.processError(error, url);
        }
    });
}

API.post = async ({ url, data, headerConfig = {}, callbacks = defaultCallbacks, retryCount = defaultRetryCount }) => {
    return measureApiPerformance(async () => {
        try {
            // Prepare headers
            const headers = { ...headerConfig };

            if (headerConfig.authType === API.AuthType.auth) {
                // Get token and extract the token string
                const tokenData = await AsyncStoreUtils.getAuthTokens();
                if (tokenData?.token) {
                    headers.token = tokenData.token;
                    headers.authType = API.AuthType.auth;
                }
                headers['X-Device-Hash'] = DeviceInfo.deviceUniqueId;
                headers['X-Requires-Auth'] = 'true';
            }

            const response = await API.instance.post(url, data, { headers: API.headers(headers) })
            callbacks.onSuccess(response.data)
            if (API.isSuccess(response)) {
                return API.processResponse(response, url)
            } else {
                return API.processError(response.data, url)
            }
        } catch (error) {
            if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error')) && retryCount > 1) {
                if (retryCount < 3) {
                    return API.post({ url, data, headerConfig, callbacks, retryCount: retryCount - 1 })
                }
            }
            callbacks.onError(error)
            return API.processError(error, url);
        }
    });
}

API.delete = async ({ url, data, headerConfig = {}, callbacks = defaultCallbacks, retryCount = defaultRetryCount }) => {
    return measureApiPerformance(async () => {
        try {
            // Prepare headers
            const headers = { ...headerConfig };

            if (headerConfig.authType === API.AuthType.auth) {
                // Get token and extract the token string
                const tokenData = await AsyncStoreUtils.getAuthTokens();
                if (tokenData?.token) {
                    headers.token = tokenData.token;
                    headers.authType = API.AuthType.auth;
                }
                headers['X-Device-Hash'] = DeviceInfo.deviceUniqueId;
                headers['X-Requires-Auth'] = 'true';
            }

            const response = await API.instance.delete(url, { data, headers: API.headers(headers) })
            callbacks.onSuccess(response.data)
            if (API.isSuccess(response)) {
                return API.processResponse(response, url)
            } else {
                return API.processError(response.data, url)
            }
        } catch (error) {
            if ((error.code === 'ECONNABORTED' || error.message.includes('Network Error')) && retryCount > 1) {
                if (retryCount < 3) {
                    return API.delete({ url, data, headerConfig, callbacks, retryCount: retryCount - 1 })
                }
            }
            callbacks.onError(error)
            return API.processError(error, url);
        }
    });
}

export default API