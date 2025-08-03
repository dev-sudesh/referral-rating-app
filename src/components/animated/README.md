# LoadingIndicator Component

A versatile and customizable animated loading indicator component for React Native applications.

## Features

- **Multiple Animation Types**: Spinner, Pulse, Dots, and Wave animations
- **Customizable Sizes**: Small, Medium, and Large sizes
- **Color Customization**: Support for any color value
- **Smooth Animations**: Uses React Native's Animated API with native driver
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Efficient animation loops with proper cleanup

## Installation

The component is already included in your project at `src/components/animated/LoadingIndicator.js`.

## Usage

### Basic Usage

```jsx
import LoadingIndicator from '../components/animated/LoadingIndicator';

// Default spinner
<LoadingIndicator />

// With custom type
<LoadingIndicator type="pulse" />

// With custom size and color
<LoadingIndicator 
  type="dots" 
  size="large" 
  color="#FF6B6B" 
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `string` | `'spinner'` | Animation type: `'spinner'`, `'pulse'`, `'dots'`, `'wave'` |
| `size` | `string` | `'medium'` | Size: `'small'`, `'medium'`, `'large'` |
| `color` | `string` | `colors.primary[500]` | Color of the loading indicator |
| `backgroundColor` | `string` | `colors.background.primary` | Background color of the container |
| `style` | `object` | `{}` | Additional styles for the loading container |
| `containerStyle` | `object` | `{}` | Additional styles for the outer container |

### Animation Types

#### 1. Spinner
A classic rotating circle animation.

```jsx
<LoadingIndicator type="spinner" />
```

#### 2. Pulse
A pulsing circle that scales up and down.

```jsx
<LoadingIndicator type="pulse" />
```

#### 3. Dots
Three dots that animate in sequence with opacity and scale changes.

```jsx
<LoadingIndicator type="dots" />
```

#### 4. Wave
Five vertical bars that animate in a wave pattern.

```jsx
<LoadingIndicator type="wave" />
```

### Size Variations

```jsx
// Small size
<LoadingIndicator size="small" />

// Medium size (default)
<LoadingIndicator size="medium" />

// Large size
<LoadingIndicator size="large" />
```

### Color Customization

```jsx
// Using theme colors
<LoadingIndicator color={colors.primary[500]} />
<LoadingIndicator color={colors.secondary[500]} />
<LoadingIndicator color={colors.success[500]} />

// Using custom colors
<LoadingIndicator color="#FF6B6B" />
<LoadingIndicator color="rgb(255, 107, 107)" />
```

### Custom Styling

```jsx
<LoadingIndicator 
  type="pulse"
  size="large"
  color={colors.primary[500]}
  style={{
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }}
  containerStyle={{
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  }}
/>
```

## Examples

### Full Screen Loading

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingIndicator from '../components/animated/LoadingIndicator';
import { colors } from '../../constants/colors';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LoadingIndicator 
        type="spinner"
        size="large"
        color={colors.primary[500]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
});

export default LoadingScreen;
```

### Inline Loading

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingIndicator from '../components/animated/LoadingIndicator';

const LoadingButton = ({ loading, onPress, title }) => {
  return (
    <View style={styles.button}>
      {loading ? (
        <LoadingIndicator 
          type="dots" 
          size="small" 
          color="#FFFFFF" 
        />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Conditional Loading

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LoadingIndicator from '../components/animated/LoadingIndicator';

const DataComponent = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({ message: 'Data loaded!' });
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator type="wave" size="medium" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>{data.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Demo

To see all animation types in action, you can use the `LoadingIndicatorDemo` component:

```jsx
import LoadingIndicatorDemo from '../components/animated/LoadingIndicatorDemo';

// In your screen
<LoadingIndicatorDemo />
```

## Performance Notes

- All animations use the native driver for optimal performance
- Animation loops are properly cleaned up when the component unmounts
- The component is optimized for React Native's rendering system

## Customization

The component is built to be easily customizable. You can:

1. Modify the animation durations in the `useEffect` hooks
2. Add new animation types by extending the `renderContent` function
3. Customize the size configurations in the `sizeConfig` object
4. Adjust the styling in the `StyleSheet` object

## Dependencies

- React Native (Animated API)
- Your app's color constants (`src/constants/colors`)

## License

This component is part of your React Native project and follows the same license terms. 