# API Documentation

This document provides comprehensive documentation for all APIs used in the Referral Rating App, including endpoints, request/response structures, data management, and usage examples.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Base Configuration](#api-base-configuration)
4. [API Endpoints](#api-endpoints)
   - [Authentication APIs](#authentication-apis)
   - [Place APIs](#place-apis)
   - [User APIs](#user-apis)
   - [Referral APIs](#referral-apis)
5. [Response Data Management](#response-data-management)
6. [Error Handling](#error-handling)
7. [Usage Examples](#usage-examples)

---

## Overview

The application uses a centralized API service built on top of Axios with React Query for state management. All API calls are managed through controller modules that handle data processing, error handling, and state updates.

**Base URL**: Configured via `Env.API_URL`

**Key Features**:
- Automatic token injection when `authType: 'auth'` is specified
- Automatic token refresh on 401/423 errors
- Request retry mechanism for network failures
- Performance measurement for all API calls
- Centralized error handling
- Automatic device hash tracking via `X-Device-Hash` header

---

## Authentication

### Authentication Types

The API supports three authentication types:

```javascript
API.AuthType = {
    auth: 'auth',      // Bearer token authentication
    basic: 'basic',    // Basic authentication
    none: 'none'       // No authentication
}
```

### Token Management

- **Anonymous Token**: Obtained via `/api/anon/sessions` endpoint
- **Token Storage**: Tokens are stored using `AsyncStoreUtils.setAuthTokens()`
- **Token Refresh**: Automatically handled by interceptors on 401/423 responses
- **Automatic Token Injection**: When `authType: 'auth'` is specified in `headerConfig`, the API service automatically:
  - Fetches the access token from storage
  - Adds `Authorization: Bearer {token}` header
  - Adds `X-Device-Hash: {deviceUniqueId}` header
- **Device Hash**: All authenticated requests automatically include `X-Device-Hash` header

### Headers

**For Authenticated Requests**:
Controllers only need to specify `authType: 'auth'` in `headerConfig`. The API service automatically adds:
- `Authorization: Bearer {token}` (fetched automatically)
- `X-Device-Hash: {deviceUniqueId}` (added automatically)
- `Accept: application/json`
- `Content-Type: application/json`

**Example**:
```javascript
Api.get({
    url: Api.url.place.categories(),
    headerConfig: {
        authType: Api.AuthType.auth  // Token and device hash added automatically
    }
})
```

### Implementation Details

The API service (`src/services/api/api.js`) handles automatic authentication through two mechanisms:

1. **Request Interceptor** (lines 76-108): Checks if a request needs authentication and automatically adds the token and device hash before the request is sent.

2. **API Method Logic** (in `API.get`, `API.post`, `API.delete`): When `authType: Api.AuthType.auth` is detected in `headerConfig`:
   - Fetches the access token from `AsyncStoreUtils.getAuthTokens()`
   - Adds the token to headers
   - Adds `X-Device-Hash` header with device unique ID
   - Sets `X-Requires-Auth: 'true'` flag for the interceptor

**Benefits**:
- Controllers are simplified - no need to manually fetch tokens
- Consistent authentication handling across all API calls
- Reduced code duplication
- Centralized token management

---

## API Base Configuration

### Request Methods

The API service provides three HTTP methods:

1. **GET**: `API.get({ url, params, headerConfig, callbacks, retryCount })`
2. **POST**: `API.post({ url, data, headerConfig, callbacks, retryCount })`
3. **DELETE**: `API.delete({ url, data, headerConfig, callbacks, retryCount })`

### Default Configuration

- **Timeout**: 30 seconds
- **Retry Count**: 0 (can be configured per request)
- **Success Status Codes**: 200, 201, '200', '201', 'ok', 'OK', 'success', 'SUCCESS'

### Response Structure

**Success Response**:
```javascript
{
    url: string,
    status: 'ok',
    statusCode: 200,
    message: string,
    ...payload  // Additional response data
}
```

**Error Response**:
```javascript
{
    url: string,
    status: 'network' | 'authentication' | 'unauthorized' | 'tokenExpired' | 'server' | 'notfound',
    statusCode: number,
    message: string,
    errors: {},
    originalError: Error
}
```

---

## API Endpoints

### Authentication APIs

#### 1. Anonymous Token

**Endpoint**: `POST /api/anon/sessions`

**Controller**: `AuthApiController.anonymousToken()`

**Authentication**: None (requires `X-Device-Hash` header)

**Request Headers**:
```javascript
{
    'X-Device-Hash': string  // Device unique identifier
}
```

**Response Data**:
```javascript
{
    session_token: string,
    expires_at: string | number
}
```

**Processed Response**:
```javascript
{
    token: string,           // session_token
    expiresAt: string | number  // expires_at
}
```

**Data Management**:
- Token is automatically stored in AsyncStorage via `AsyncStoreUtils.setAuthTokens()`
- Used for subsequent authenticated API calls

**Usage**:
```javascript
const anonymousTokenMutation = ApiController.anonymousToken();
const result = await anonymousTokenMutation.mutateAsync();
// Token is automatically stored
```

**Used In**:
- `src/screens/SplashScreen.js` - Initial app authentication

---

### Place APIs

#### 1. Place Categories

**Endpoint**: `GET /api/places/categories`

**Controller**: `PlaceApiController.placeCategories()`

**Authentication**: Required (Bearer token)

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Response Data**:
```javascript
{
    categories: [
        {
            id: string,
            label: string
        }
    ]
}
```

**Processed Response**:
```javascript
[
    {
        id: 'category',
        title: 'Category',
        options: [
            {
                id: string,
                label: string
            }
        ]
    }
]
```

**Data Management**:
- Categories are stored in `SearchFilterController` state via `setPlaceCategories()`
- Used for filtering places by category

**Usage**:
```javascript
const { data: placeCategoriesResponse } = ApiController.placeCategories();
// Returns React Query hook result
```

**Used In**:
- `src/components/ui/SearchFilter.js` - Category filter dropdown

---

#### 2. Nearby Places

**Endpoint**: `GET /api/places/top` or `GET /api/places?category={category}`

**Controller**: `PlaceApiController.nearbyPlaces()`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional, default: 5000): Search radius in meters
- `limit` (optional, default: 10): Maximum number of results
- `enhanced` (optional, default: true): Enhanced data flag
- `category` (optional): Filter by category ID

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Response Data**:
```javascript
{
    results: [
        {
            id: string,
            name: string,
            address: string,
            location: {
                Lat: number,
                Lng: number
            },
            primary_type: string,
            photo_uris: string[],
            weekday_descriptions: string[],
            website_uri: string
        }
    ]
}
```

**Processed Response**:
```javascript
[
    {
        id: string,
        name: string,
        address: string,
        latitude: number,
        longitude: number,
        distance: number,        // Calculated distance from user location
        category: string,
        image: string | null,    // First photo URI or null
        imageFull: string | null,
        isReferred: boolean,     // Whether user has referred this place
        openTime: string,        // Joined weekday_descriptions
        website: string
    }
]
```

**Data Management**:
- Places are stored in `MapsController` state via `setPlaces()`
- Distance is calculated using `calculateDistance()` utility
- Referral status is determined by comparing with user referrals
- Results are limited to first 10 items

**Additional API Call**:
- Also fetches user referrals: `GET /api/user/referrals` to determine `isReferred` status

**Usage**:
```javascript
const nearbyPlacesMutation = ApiController.nearbyPlaces();
const places = await nearbyPlacesMutation.mutateAsync({
    latitude: 37.78825,
    longitude: -122.4324,
    limit: 10,
    radius: 5000,
    enhanced: true,
    category: 'optional_category_id'
});
```

**Used In**:
- `src/screens/SplashScreen.js` - Initial place loading
- `src/components/ui/SearchFilter.js` - Filtered place results

---

#### 3. Search Places

**Endpoint**: `GET /api/places/search`

**Controller**: `PlaceApiController.searchPlaces()`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `query` (required): Search query string
- `lat` (required): Latitude
- `lng` (required): Longitude
- `limit` (optional, default: 10): Maximum number of results
- `radius` (optional, default: 1000): Search radius in meters
- `enhanced` (optional, default: true): Enhanced data flag

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Response Data**:
```javascript
{
    results: [
        {
            id: string,
            name: string,
            address: string,
            location: {
                Lat: number,
                Lng: number
            },
            primary_type: string,
            photo_uris: string[],
            weekday_descriptions: string[],
            website_uri: string
        }
    ]
}
```

**Processed Response**:
```javascript
[
    {
        id: string,
        name: string,
        address: string,
        latitude: number,
        longitude: number,
        distance: number,
        category: string,
        image: string | null,
        imageFull: string | null,
        isReferred: boolean,
        openTime: string,
        website: string
    }
]
```

**Data Management**:
- Results are returned directly (not stored in global state)
- Distance is calculated from user location
- Referral status is determined by comparing with user referrals
- Results are limited to first 10 items

**Additional API Call**:
- Also fetches user referrals: `GET /api/user/referrals` to determine `isReferred` status

**Usage**:
```javascript
const searchPlacesMutation = ApiController.searchPlaces();
const results = await searchPlacesMutation.mutateAsync({
    query: 'coffee shop',
    latitude: 37.78825,
    longitude: -122.4324,
    limit: 10,
    radius: 1000,
    enhanced: true
});
```

**Used In**:
- `src/screens/main/search/SearchScreen.js` - Search functionality

---

#### 4. Place Details

**Endpoint**: `GET /api/places/details/enhanced?provider=google&place_id={placeId}`

**Controller**: `PlaceApiController.placeDetails()`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `provider` (required): Always 'google'
- `place_id` (required): Google Place ID

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Request Parameters**:
```javascript
{
    place: {
        id: string,        // Place ID
        // ... other place properties
    }
}
```

**Response Data**:
```javascript
{
    result: {
        id: string,
        name: string,
        address: string,
        location: {
            Lat: number,
            Lng: number
        },
        primary_type: string,
        photo_uris: string[],
        weekday_descriptions: string[],
        website_uri: string
    }
}
```

**Processed Response**:
```javascript
{
    id: string,
    name: string,
    address: string,
    latitude: number,
    longitude: number,
    distance: number,
    category: string,
    image: string | null,
    imageFull: string | null,
    isReferred: boolean,   // Preserved from input place
    openTime: string,
    website: string
}
```

**Data Management**:
- Updates the place in `MapsController.places` array
- Sets the selected place in `MapsController.selectedPlace`
- Distance is calculated from current user location

**Usage**:
```javascript
const placeDetailsMutation = ApiController.placeDetails();
const placeDetails = await placeDetailsMutation.mutateAsync({
    place: {
        id: 'place_id_here',
        // ... other place data
    }
});
```

**Used In**:
- `src/components/ui/PlaceFullCard.js` - Place detail view

---

### User APIs

#### 1. User Profile

**Endpoint**: `GET /api/anon/profile`

**Controller**: `UserApiController.profile()`

**Authentication**: Required (Bearer token)

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Response Data**:
```javascript
{
    referrals: [
        {
            place_id: string,
            display_name: string,
            address: string,
            coords: {
                lat: number,
                lng: number
            },
            primary_type: string
        }
    ],
    // ... other user profile data
}
```

**Processed Response**:
```javascript
{
    referrals: [
        {
            id: string,              // place_id
            name: string,            // display_name
            address: string,
            latitude: number,        // coords.lat
            longitude: number,       // coords.lng
            category: string         // primary_type
        }
    ],
    // ... original response data
}
```

**Data Management**:
- Referrals are stored in `ReferralController` state via `setReferredPlaces()`
- Full response is returned for additional profile data

**Usage**:
```javascript
const profileMutation = ApiController.profile();
const profile = await profileMutation.mutateAsync();
```

**Used In**:
- `src/screens/main/map/MapScreen.js` - Load user profile and referrals
- `src/screens/main/referrals/ReferralsScreen.js` - Display user referrals

---

#### 2. User Referrals

**Endpoint**: `GET /api/user/referrals`

**Controller**: `ReferralApiController.referrals()`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional, default: 5000): Search radius in meters

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Response Data**:
```javascript
{
    referrals: [
        {
            id: string,              // Place ID
            // ... referral data
        }
    ]
}
```

**Processed Response**:
```javascript
[
    {
        id: string,
        // ... referral data
    }
]
```

**Data Management**:
- Referrals are stored in `ReferralController` state via `setReferredPlaces()`

**Usage**:
```javascript
const referralsMutation = ApiController.referrals();
const referrals = await referralsMutation.mutateAsync({
    latitude: 37.78825,
    longitude: -122.4324
});
```

**Used In**:
- `src/screens/main/map/MapScreen.js` - Load user referrals in area

---

### Referral APIs

#### 1. Refer/Unrefer Place

**Endpoint**: 
- `POST /api/places/refer` (for refer action)
- `DELETE /api/places/refer` (for unrefer action)

**Controller**: `ReferralApiController.referPlace()`

**Authentication**: Required (Bearer token)

**Request Headers**:
```javascript
{
    authType: 'auth'  // Token and X-Device-Hash are added automatically
}
```

**Request Parameters**:
```javascript
{
    place: {              // Required for 'refer' action
        id: string,
        name: string,
        address: string,
        category: string,
        latitude: number,
        longitude: number
    },
    placeId: string,      // Required for 'unrefer' action
    action: 'refer' | 'unrefer'  // Default: 'refer'
}
```

**POST Request Body (Refer)**:
```javascript
{
    place_id: string,
    display_name: string,
    address: string,
    primary_type: string,
    coords: {
        lat: number,
        lng: number
    }
}
```

**DELETE Request Body (Unrefer)**:
```javascript
{
    place_id: string
}
```

**Response Data**:
```javascript
{
    // Response from server
}
```

**Processed Response**:
- Returns response as-is from server

**Data Management**:
- No automatic state updates
- Caller should refresh referrals list after successful refer/unrefer

**Usage**:
```javascript
const referPlaceMutation = ApiController.referPlace();

// Refer a place
await referPlaceMutation.mutateAsync({
    place: {
        id: 'place_id',
        name: 'Place Name',
        address: '123 Main St',
        category: 'restaurant',
        latitude: 37.78825,
        longitude: -122.4324
    },
    action: 'refer'
});

// Unrefer a place
await referPlaceMutation.mutateAsync({
    placeId: 'place_id',
    action: 'unrefer'
});
```

**Used In**:
- `src/components/ui/PlaceSelectedCard.js` - Refer/unrefer from place card
- `src/components/ui/PlaceFullCard.js` - Refer/unrefer from place detail
- `src/screens/main/map/MapScreen.js` - Refer/unrefer functionality

---

## Response Data Management

### State Controllers

The application uses several state controllers to manage API response data:

1. **MapsController** (`src/controllers/maps/MapsController.js`)
   - Manages places list
   - Manages selected place
   - Manages user location
   - Manages view type (map/list)

2. **ReferralController** (`src/controllers/referrals/ReferralController.js`)
   - Manages referred places list
   - Manages place referral status

3. **SearchFilterController** (`src/controllers/filters/SearchFilterController.js`)
   - Manages place categories
   - Manages filter state

### Data Processing Patterns

1. **Distance Calculation**: All place responses calculate distance from user location using `calculateDistance()` utility
2. **Image Processing**: First photo URI is extracted from `photo_uris` array
3. **Referral Status**: Determined by comparing place IDs with user referrals
4. **Time Formatting**: `weekday_descriptions` array is joined with newlines for display

---

## Error Handling

### Error Status Codes

The API service maps HTTP status codes to error types:

| Status Code | Error Status | Description |
|------------|--------------|-------------|
| 200, 201 | `ok` | Success |
| 400 | `authentication` | Bad Request |
| 401 | `unauthorized` | Unauthorized (triggers token refresh) |
| 403 | `inactive` | Forbidden |
| 404 | `notfound` | Not Found |
| 406 | `invalidlogout` | Not Acceptable |
| 422 | `authentication` | Unprocessable Entity |
| 423 | `tokenExpired` | Token Expired (triggers token refresh) |
| 424 | `refreshTokenFailed` | Token Refresh Failed |
| 500 | `server` | Internal Server Error |
| 502 | `invalid` | Bad Gateway |
| Network Error | `network` | Network/Connection Error |

### Automatic Token Refresh

When a 401 or 423 error occurs:
1. Request is queued
2. New anonymous token is requested
3. Token is stored
4. Original request is retried with new token
5. Queued requests are processed

### Retry Mechanism

- Network errors (`ECONNABORTED`, `Network Error`) trigger automatic retry
- Maximum 3 retry attempts
- Retry count can be configured per request

---

## Usage Examples

### Complete Flow: Search and Refer a Place

```javascript
import ApiController from '../services/api/ApiController';

// 1. Get anonymous token (usually done on app start)
const anonymousTokenMutation = ApiController.anonymousToken();
await anonymousTokenMutation.mutateAsync();

// 2. Search for places
const searchPlacesMutation = ApiController.searchPlaces();
const places = await searchPlacesMutation.mutateAsync({
    query: 'coffee shop',
    latitude: 37.78825,
    longitude: -122.4324
});

// 3. Get place details
const placeDetailsMutation = ApiController.placeDetails();
const placeDetails = await placeDetailsMutation.mutateAsync({
    place: places[0]
});

// 4. Refer the place
const referPlaceMutation = ApiController.referPlace();
await referPlaceMutation.mutateAsync({
    place: placeDetails,
    action: 'refer'
});

// 5. Refresh user referrals
const referralsMutation = ApiController.referrals();
const referrals = await referralsMutation.mutateAsync({
    latitude: 37.78825,
    longitude: -122.4324
});
```

### Using React Query Hooks

```javascript
// Query hook (for GET requests that should auto-fetch)
const { data, isLoading, error } = ApiController.placeCategories();

// Mutation hook (for POST/DELETE or manual GET requests)
const mutation = ApiController.searchPlaces();
const handleSearch = async () => {
    try {
        const results = await mutation.mutateAsync({
            query: 'restaurant',
            latitude: 37.78825,
            longitude: -122.4324
        });
        console.log('Search results:', results);
    } catch (error) {
        console.error('Search failed:', error);
    }
};
```

### Error Handling Example

```javascript
const mutation = ApiController.referPlace();

try {
    await mutation.mutateAsync({
        place: selectedPlace,
        action: 'refer'
    });
} catch (error) {
    if (error.status === 'unauthorized') {
        // Token refresh will be handled automatically
        console.log('Token expired, refreshing...');
    } else if (error.status === 'network') {
        console.log('Network error, please check connection');
    } else {
        console.log('Error:', error.message);
    }
}
```

---

## API URL Structure

All API URLs are defined in `src/services/api/Api.js`:

```javascript
API.url = {
    auth: {
        anonymousToken: () => `/api/anon/sessions`,
        profile: () => `/api/anon/profile`,
    },
    place: {
        categories: () => `/api/places/categories`,
        nearby: ({ latitude, longitude, limit, radius, enhanced, category }) => 
            `api/places${!category ? '/top' : ''}?lat=${latitude}&lng=${longitude}&radius=${radius}&limit=${limit}&enhanced=${enhanced}${category ? '&category=' + category : ''}`,
        search: ({ query, latitude, longitude, limit, radius, enhanced }) => 
            `api/places/search?query=${query}&lat=${latitude}&lng=${longitude}&limit=${limit}&radius=${radius}&enhanced=${enhanced}`,
        details: ({ placeId }) => `/api/places/details/enhanced?provider=google&place_id=${placeId}`,
    },
    referral: {
        refer: () => `/api/places/refer`,
    },
    user: {
        profile: () => `/api/anon/profile`,
        referrals: ({ latitude, longitude, radius }) => 
            `/api/user/referrals?lat=${latitude}&lng=${longitude}&radius=${radius}`,
    }
}
```

---

## Notes

1. **Automatic Authentication**: Controllers no longer need to manually fetch tokens or pass device hash. Simply specify `authType: Api.AuthType.auth` in `headerConfig`, and the API service handles token fetching and header injection automatically.
2. **Device Hash**: All authenticated requests automatically include `X-Device-Hash` header with device unique identifier (handled by API service)
3. **Token Expiration**: Tokens expire and are automatically refreshed on 401/423 errors via axios interceptors
4. **Parallel Requests**: Some endpoints (like `nearbyPlaces` and `searchPlaces`) make parallel requests to fetch both places and user referrals
5. **Data Limits**: Place search results are limited to first 10 items
6. **Distance Calculation**: All place responses include calculated distance from user location
7. **Image Handling**: Place images use the first photo URI from the `photo_uris` array, or `null` if no photos available

---

## File Structure

```
src/services/api/
├── Api.js                    # Base API service with axios instance
├── ApiController.js          # Main API controller aggregator
└── controllers/
    ├── AuthApiController.js  # Authentication APIs
    ├── PlaceApiController.js # Place-related APIs
    ├── ReferralApiController.js # Referral APIs
    └── UserApiController.js  # User profile APIs
```

---

*Last Updated: Generated from codebase analysis*

