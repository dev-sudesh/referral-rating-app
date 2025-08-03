# Image Preloading System

A comprehensive image preloading solution for React Native apps that improves performance and user experience by preloading images before they're needed.

## Features

- ✅ **Local Image Preloading** - Preload local images from your assets
- ✅ **Remote Image Preloading** - Preload remote images from URLs
- ✅ **Progress Tracking** - Real-time progress updates during preloading
- ✅ **Error Handling** - Graceful error handling with fallback options
- ✅ **Caching** - In-memory caching for instant image access
- ✅ **Custom Hook** - Easy-to-use React hook for state management
- ✅ **Component Integration** - Seamless integration with existing components
- ✅ **Performance Optimized** - Efficient preloading with minimal memory usage

## Quick Start

### 1. Setup Image Mappings

First, define your local images in `PreloadImagesUtils.js`:

```javascript
export const LOCAL_IMAGES = {
    'logo-full': require('../../assets/images/logos/logo-full.png'),
    'logo-icon': require('../../assets/images/logos/logo-icon.png'),
    'intro-1': require('../../assets/images/intro/intro-1.svg'),
    // Add more images here...
};
```

### 2. Preload Images in SplashScreen

```javascript
import ImagePreloader from '../components/common/ImagePreloader';

const SplashScreen = ({ navigation }) => {
    const imagesToPreload = ['logo-full', 'logo-icon', 'intro-1'];
    
    return (
        <View style={styles.container}>
            <ImagePreloader
                localImageKeys={imagesToPreload}
                onComplete={(results) => {
                    console.log('Preloading complete:', results);
                    navigation.replace('MainApp');
                }}
                showProgress={true}
                autoStart={true}
            >
                {/* Your splash screen content */}
            </ImagePreloader>
        </View>
    );
};
```

### 3. Use Preloaded Images

```javascript
import AppImage from '../components/common/AppImage';

const MyComponent = () => {
    return (
        <AppImage
            source={LOCAL_IMAGES['logo-full']}
            localKey="logo-full"
            style={styles.image}
            resizeMode="contain"
        />
    );
};
```

## Components

### ImagePreloader

A component that handles the preloading process with progress tracking and error handling.

**Props:**
- `localImageKeys` (string[]) - Array of local image keys to preload
- `remoteImageUrls` (string[]) - Array of remote image URLs to preload
- `onComplete` (function) - Callback when preloading is complete
- `onError` (function) - Callback when preloading fails
- `showProgress` (boolean) - Whether to show progress UI
- `autoStart` (boolean) - Whether to start preloading automatically
- `children` (ReactNode) - Content to show after preloading

**Example:**
```javascript
<ImagePreloader
    localImageKeys={['logo-full', 'logo-icon']}
    remoteImageUrls={['https://example.com/image.jpg']}
    onComplete={(results) => console.log('Complete:', results)}
    showProgress={true}
    autoStart={true}
>
    <Text>App is ready!</Text>
</ImagePreloader>
```

### AppImage

Enhanced image component that can use preloaded images for instant loading.

**Props:**
- `source` (string|number) - Image source (local require or remote URL)
- `localKey` (string) - Key for local preloaded image
- `usePreloaded` (boolean) - Whether to use preloaded images
- `fallbackSource` (string|number) - Fallback image source
- `showLoader` (boolean) - Whether to show loading indicator
- `resizeMode` (string) - Image resize mode
- `fadeDuration` (number) - Image fade duration

**Example:**
```javascript
<AppImage
    source={LOCAL_IMAGES['logo-full']}
    localKey="logo-full"
    style={styles.image}
    resizeMode="contain"
    fallbackSource={LOCAL_IMAGES['logo-icon']}
/>
```

## Hooks

### useImagePreloader

Custom hook that provides image preloading functionality with state management.

**Returns:**
- `isLoading` (boolean) - Whether preloading is in progress
- `progress` (number) - Preloading progress (0-100)
- `completedCount` (number) - Number of completed images
- `totalCount` (number) - Total number of images
- `currentImage` (string) - Currently loading image
- `results` (object) - Preloading results
- `error` (object) - Error information
- `isComplete` (boolean) - Whether preloading is complete
- `hasError` (boolean) - Whether an error occurred
- `successCount` (number) - Number of successful loads
- `failureCount` (number) - Number of failed loads
- `preloadLocal` (function) - Preload local images
- `preloadRemote` (function) - Preload remote images
- `preloadAll` (function) - Preload both local and remote images
- `clearCache` (function) - Clear image cache
- `resetState` (function) - Reset hook state

**Example:**
```javascript
const {
    isLoading,
    progress,
    preloadLocal,
    preloadRemote,
    isComplete
} = useImagePreloader();

const handlePreload = async () => {
    await preloadLocal(['logo-full', 'logo-icon']);
    await preloadRemote(['https://example.com/image.jpg']);
};
```

## Utility Functions

### PreloadImagesUtils

Collection of utility functions for image preloading.

**Functions:**
- `preloadLocalImages(imageKeys, onProgress, onComplete, onError)` - Preload local images
- `preloadRemoteImages(imageUrls, onProgress, onComplete, onError)` - Preload remote images
- `preloadAllImages(localKeys, remoteUrls, onComplete, onError)` - Preload both types
- `clearImageCache(onComplete)` - Clear the image cache
- `getCachedImage(key)` - Get a cached image
- `isImageCached(key)` - Check if an image is cached
- `getCacheStats()` - Get cache statistics
- `preloadImagesWithTimeout(imageKeys, timeout, onProgress, onComplete, onError)` - Preload with timeout

**Example:**
```javascript
import { preloadLocalImages, getCachedImage } from '../utils/preloadImages/PreloadImagesUtils';

// Preload images
await preloadLocalImages(
    ['logo-full', 'logo-icon'],
    (progress) => console.log(`Progress: ${progress}%`),
    (results) => console.log('Complete:', results)
);

// Use cached image
const cachedImage = getCachedImage('logo-full');
```

## Best Practices

### 1. Preload Essential Images Only

Only preload images that are essential for the user experience:

```javascript
const essentialImages = [
    'logo-full',      // App logo
    'logo-icon',      // Tab bar icon
    'intro-1',        // First onboarding screen
    'intro-2',        // Second onboarding screen
    'intro-3',        // Third onboarding screen
];
```

### 2. Use Appropriate Image Sizes

Preload images in the sizes you'll actually use:

```javascript
export const LOCAL_IMAGES = {
    'logo-full': require('../../assets/images/logos/logo-full.png'),
    'logo-small': require('../../assets/images/logos/logo-small.png'), // Smaller version
    'logo-icon': require('../../assets/images/logos/logo-icon.png'),   // Icon version
};
```

### 3. Handle Errors Gracefully

Always provide fallback options:

```javascript
<AppImage
    source={LOCAL_IMAGES['user-avatar']}
    localKey="user-avatar"
    fallbackSource={LOCAL_IMAGES['default-avatar']}
    onError={() => console.log('Avatar failed to load')}
/>
```

### 4. Monitor Performance

Track preloading performance:

```javascript
const handlePreloadComplete = (results) => {
    console.log(`Preloaded ${results.successful}/${results.total} images`);
    if (results.failed > 0) {
        console.warn(`${results.failed} images failed to preload`);
    }
};
```

### 5. Clear Cache When Needed

Clear the cache to free up memory:

```javascript
import { clearImageCache } from '../utils/preloadImages/PreloadImagesUtils';

// Clear cache when app goes to background
useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'background') {
            clearImageCache();
        }
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
}, []);
```

## Performance Benefits

1. **Instant Image Loading** - Preloaded images appear immediately
2. **Reduced Network Requests** - Remote images are cached
3. **Better User Experience** - No loading delays or flickers
4. **Memory Efficient** - Smart caching with automatic cleanup
5. **Progressive Loading** - Load essential images first

## Troubleshooting

### Images Not Preloading

1. Check that image keys are correctly defined in `LOCAL_IMAGES`
2. Verify image paths are correct
3. Ensure images exist in the assets folder
4. Check console for error messages

### Memory Issues

1. Limit the number of preloaded images
2. Clear cache periodically
3. Use appropriate image sizes
4. Monitor memory usage in development

### Remote Images Failing

1. Check network connectivity
2. Verify image URLs are accessible
3. Add timeout handling
4. Provide fallback images

## Examples

See the following example files for complete usage examples:
- `ImagePreloaderExample.js` - Comprehensive preloading examples
- `PreloadedImageExample.js` - Usage examples throughout the app
- `SplashScreen.js` - Integration with splash screen

## API Reference

For detailed API documentation, see the individual component and utility function files. 