# DeviceInfo Utility

A comprehensive utility class for React Native that provides device information, screen dimensions, platform details, and other useful device-related data.

## Features

- 📱 **Screen Dimensions**: Get screen width, height, and aspect ratio
- 🖥️ **Platform Detection**: iOS/Android platform information
- 📐 **Device Type**: Phone, tablet, TV detection
- 🔄 **Orientation**: Landscape/portrait detection
- 📏 **Safe Area**: Status bar and safe area calculations
- 📊 **Responsive Design**: Breakpoint-based responsive utilities
- 🆔 **Device Information**: Brand, model, unique ID
- 🔋 **Battery Info**: Battery level and charging status
- 📱 **App Version**: Version and build number
- 🎯 **Notch Detection**: Check if device has notch
- 📡 **Network Info**: Connection and carrier information

## Installation

The utility uses the following dependencies that are already installed in your project:

- `react-native` (core)
- `react-native-device-info` (for advanced device information)

## Usage

### Basic Usage

```javascript
import DeviceInfo from '../utils/deviceInfo/DeviceInfo';

// Get screen dimensions
const screen = DeviceInfo.getScreenDimensions();
console.log(screen); // { width: 375, height: 812, aspectRatio: 0.461 }

// Get platform info
const platform = DeviceInfo.getPlatformInfo();
console.log(platform); // { isIOS: true, isAndroid: false, platform: 'ios', ... }

// Check device type
const deviceType = DeviceInfo.getDeviceType();
console.log(deviceType); // { type: 'phone-portrait', isPhone: true, ... }
```

### Responsive Design

```javascript
// Get responsive breakpoints
const responsive = DeviceInfo.getResponsiveBreakpoints();
if (responsive.isSmall) {
  // Apply small screen styles
} else if (responsive.isMedium) {
  // Apply medium screen styles
}

// Use in styles
const styles = {
  container: {
    padding: DeviceInfo.getConstants().spacing.md,
    borderRadius: DeviceInfo.getConstants().borderRadius.md,
  },
  text: {
    fontSize: responsive.isSmall ? 14 : 16,
  },
};
```

### Orientation Handling

```javascript
// Check orientation
const orientation = DeviceInfo.getOrientation();
const isLandscape = DeviceInfo.isLandscape();
const isPortrait = DeviceInfo.isPortrait();

// Listen for orientation changes
const removeListener = DeviceInfo.addDimensionChangeListener((dimensions) => {
  console.log('Screen dimensions changed:', dimensions);
  // Handle orientation change
});

// Don't forget to remove listener
// removeListener();
```

### Async Device Information

```javascript
// Get device brand and model
const deviceInfo = await DeviceInfo.getDeviceBrandAndModel();
console.log(deviceInfo); // { brand: 'Apple', model: 'iPhone 14', ... }

// Get device ID
const deviceId = await DeviceInfo.getDeviceId();
console.log(deviceId); // "unique-device-identifier"

// Check if device has notch
const hasNotch = await DeviceInfo.hasNotch();
console.log(hasNotch); // true/false

// Get app version
const appVersion = await DeviceInfo.getAppVersion();
console.log(appVersion); // { version: '1.0.0', buildNumber: '1', ... }

// Get battery info
const batteryInfo = await DeviceInfo.getBatteryInfo();
console.log(batteryInfo); // { batteryLevel: 0.75, isCharging: false, ... }
```

### Complete Device Information

```javascript
// Get all device information at once
const allInfo = DeviceInfo.getAllDeviceInfo();
console.log(allInfo);
// {
//   screen: { width: 375, height: 812, aspectRatio: 0.461 },
//   platform: { isIOS: true, isAndroid: false, ... },
//   deviceType: { type: 'phone-portrait', isPhone: true, ... },
//   safeArea: { statusBarHeight: 44, bottomSafeArea: 34, ... },
//   responsive: { isSmall: false, isMedium: true, ... },
//   orientation: 'portrait',
//   pixelDensity: { scale: 3, pixelWidth: 1125, ... }
// }
```

## API Reference

### Static Methods

#### Screen & Dimensions
- `getScreenDimensions()` - Get screen width, height, and aspect ratio
- `getScreenDimensionsWithStatusBar()` - Get screen dimensions including status bar
- `getStatusBarHeight()` - Get status bar height
- `getPixelDensity()` - Get pixel density information

#### Platform & Device
- `getPlatformInfo()` - Get platform information (iOS/Android)
- `getDeviceType()` - Get device type (phone/tablet/TV)
- `getDeviceBrandAndModel()` - Get device brand and model (async)
- `getDeviceId()` - Get unique device identifier (async)
- `hasNotch()` - Check if device has notch (async)

#### Orientation & Layout
- `getOrientation()` - Get current orientation
- `isLandscape()` - Check if landscape mode
- `isPortrait()` - Check if portrait mode
- `addDimensionChangeListener(callback)` - Listen for dimension changes

#### Safe Area & Layout
- `getSafeAreaInfo()` - Get safe area information
- `getResponsiveBreakpoints()` - Get responsive breakpoints

#### App & System
- `getAppVersion()` - Get app version information (async)
- `getBatteryInfo()` - Get battery information (async)
- `getNetworkInfo()` - Get network information (async)

#### Utilities
- `getAllDeviceInfo()` - Get all device information
- `getConstants()` - Get design constants (breakpoints, spacing, etc.)

### Constants

```javascript
const constants = DeviceInfo.getConstants();

// Breakpoints
constants.breakpoints.small    // 375
constants.breakpoints.medium   // 768
constants.breakpoints.large    // 1024
constants.breakpoints.xlarge   // 1200

// Spacing
constants.spacing.xs   // 4
constants.spacing.sm   // 8
constants.spacing.md   // 16
constants.spacing.lg   // 24
constants.spacing.xl   // 32
constants.spacing.xxl  // 48

// Border Radius
constants.borderRadius.sm    // 4
constants.borderRadius.md    // 8
constants.borderRadius.lg    // 12
constants.borderRadius.xl    // 16
constants.borderRadius.round // 50
```

## React Component Example

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from '../utils/deviceInfo/DeviceInfo';

const DeviceInfoComponent = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [orientation, setOrientation] = useState(DeviceInfo.getOrientation());

  useEffect(() => {
    // Get async device info
    const getDeviceInfo = async () => {
      const info = await DeviceInfo.getDeviceBrandAndModel();
      setDeviceInfo(info);
    };
    getDeviceInfo();

    // Listen for orientation changes
    const removeListener = DeviceInfo.addDimensionChangeListener(() => {
      setOrientation(DeviceInfo.getOrientation());
    });

    return removeListener;
  }, []);

  const screen = DeviceInfo.getScreenDimensions();
  const responsive = DeviceInfo.getResponsiveBreakpoints();

  return (
    <View style={[
      styles.container,
      { backgroundColor: orientation === 'landscape' ? '#f0f0f0' : '#ffffff' }
    ]}>
      <Text style={[styles.text, { fontSize: responsive.isSmall ? 14 : 16 }]}>
        Screen: {screen.width} x {screen.height}
      </Text>
      <Text style={styles.text}>
        Orientation: {orientation}
      </Text>
      {deviceInfo && (
        <Text style={styles.text}>
          Device: {deviceInfo.fullModel}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DeviceInfo.getConstants().spacing.md,
  },
  text: {
    marginBottom: DeviceInfo.getConstants().spacing.sm,
  },
});

export default DeviceInfoComponent;
```

## Error Handling

All async methods include error handling and will return fallback values if the device information cannot be retrieved:

```javascript
// Example of error handling
try {
  const deviceInfo = await DeviceInfo.getDeviceBrandAndModel();
  console.log(deviceInfo);
} catch (error) {
  console.error('Failed to get device info:', error);
  // Fallback values will be returned automatically
}
```

## Notes

- Async methods require proper error handling in production
- Dimension change listeners should be removed when components unmount
- Some device information may not be available on all devices/platforms
- The utility gracefully handles missing permissions or unavailable data

## Examples

See `DeviceInfo.example.js` for comprehensive usage examples. 