# Common Components

This directory contains reusable common components that provide enhanced functionality for React Native applications.

## KeyboardAvoidingView

A comprehensive keyboard avoiding view component that wraps React Native's `KeyboardAvoidingView` with additional features like scroll handling, safe area support, and customizable behavior.

### Features

- **Cross-platform support**: Works on both iOS and Android
- **Safe area handling**: Automatically accounts for safe area insets
- **Scroll support**: Built-in ScrollView with keyboard-aware scrolling
- **Customizable behavior**: Different keyboard avoidance behaviors
- **Event callbacks**: Keyboard show/hide event handlers
- **Flexible styling**: Customizable styles and content container styles

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | The content to render inside the keyboard avoiding view |
| `behavior` | `'height' \| 'position' \| 'padding'` | `'padding'` (iOS) / `'height'` (Android) | How the keyboard avoiding view should behave |
| `keyboardVerticalOffset` | `number` | `0` | Additional offset to apply when keyboard appears |
| `style` | `StyleProp<ViewStyle>` | - | Style for the container |
| `contentContainerStyle` | `StyleProp<ViewStyle>` | - | Style for the content container |
| `scrollEnabled` | `boolean` | `true` | Whether to enable scrolling |
| `showsVerticalScrollIndicator` | `boolean` | `false` | Whether to show vertical scroll indicator |
| `bounces` | `boolean` | `true` | Whether the scroll view should bounce |
| `onKeyboardShow` | `(event: KeyboardEvent) => void` | - | Callback when keyboard shows |
| `onKeyboardHide` | `(event: KeyboardEvent) => void` | - | Callback when keyboard hides |
| `enableOnAndroid` | `boolean` | `true` | Whether to enable keyboard avoiding on Android |

### Usage Examples

#### Basic Usage

```jsx
import KeyboardAvoidingView from '../components/common/KeyboardAvoidingView';

const MyScreen = () => {
    return (
        <KeyboardAvoidingView>
            <TextInput placeholder="Enter text" />
            <Button title="Submit" />
        </KeyboardAvoidingView>
    );
};
```

#### With Custom Configuration

```jsx
import KeyboardAvoidingView from '../components/common/KeyboardAvoidingView';

const MyForm = () => {
    const handleKeyboardShow = (event) => { 
    };

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={20}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            onKeyboardShow={handleKeyboardShow}
            onKeyboardHide={() => {}}
        >
            {/* Your form content */}
        </KeyboardAvoidingView>
    );
};
```

#### Without Scrolling

```jsx
import KeyboardAvoidingView from '../components/common/KeyboardAvoidingView';

const MySimpleScreen = () => {
    return (
        <KeyboardAvoidingView scrollEnabled={false}>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <TextInput placeholder="Enter text" />
            </View>
        </KeyboardAvoidingView>
    );
};
```

### Best Practices

1. **Use appropriate behavior**: 
   - Use `'padding'` for most cases (especially on iOS)
   - Use `'height'` for Android or when you need more control
   - Use `'position'` sparingly as it can cause layout issues

2. **Set keyboardVerticalOffset**: 
   - Add offset if you have headers, navigation bars, or other UI elements
   - Consider safe area insets (handled automatically)

3. **Handle keyboard events**: 
   - Use `onKeyboardShow` and `onKeyboardHide` for custom logic
   - Access keyboard height and duration from the event object

4. **Scroll configuration**: 
   - Enable scrolling for long forms or content
   - Disable scrolling for simple screens with few inputs
   - Use `keyboardShouldPersistTaps="handled"` for better UX

5. **Styling**: 
   - Use `contentContainerStyle` for styling the scrollable content
   - Use `style` for styling the container itself

### Platform Differences

- **iOS**: Uses `'keyboardWillShow'` and `'keyboardWillHide'` events for smoother animations
- **Android**: Uses `'keyboardDidShow'` and `'keyboardDidHide'` events
- **Safe Area**: Automatically handles safe area insets on iOS
- **Behavior**: Default behavior differs between platforms for optimal UX

### Example Implementation

See `KeyboardAvoidingViewExample.js` for a complete example showing:
- Form with multiple text inputs
- Different input types (text, email, phone, multiline)
- Keyboard event handling
- Proper styling and layout
- Button integration

### Dependencies

- `react-native-safe-area-context`: For safe area handling
- `react-native`: Core React Native components 