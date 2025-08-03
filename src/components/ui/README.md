# UI Components

This directory contains reusable UI components for the ReferralRating app.

## TextInputField

A comprehensive and customizable text input field component that matches the app's design system. Perfect for forms, authentication screens, and any text input needs.

### Features

- ✅ Labels positioned above input fields
- ✅ White rounded input boxes with proper styling
- ✅ Password field with eye icon toggle
- ✅ Error state handling with validation
- ✅ Focus and disabled states
- ✅ Customizable styling and theming
- ✅ Support for different keyboard types
- ✅ Multiline text input support
- ✅ Built-in validation helpers
- ✅ Accessibility features

### Basic Usage

```jsx
import TextInputField from '../components/ui/TextInputField';

// Basic text input
<TextInputField
  label="Your name"
  placeholder="Enter your full name"
  value={name}
  onChangeText={setName}
/>

// Email input
<TextInputField
  label="E-mail address"
  placeholder="Enter your email address"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
/>

// Password input with toggle
<TextInputField
  label="Password"
  placeholder="Enter your password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={true}
/>
```

### Advanced Usage

```jsx
// Input with error handling
<TextInputField
  label="Username"
  value={username}
  onChangeText={setUsername}
  error={usernameError}
  autoCapitalize="none"
  autoCorrect={false}
/>

// Disabled input
<TextInputField
  label="Read-only field"
  value="This field cannot be edited"
  disabled={true}
/>

// Multiline input
<TextInputField
  label="Description"
  value={description}
  onChangeText={setDescription}
  multiline={true}
  numberOfLines={4}
  placeholder="Enter a detailed description..."
/>

// Custom styling
<TextInputField
  label="Custom Input"
  value={customValue}
  onChangeText={setCustomValue}
  style={{ fontSize: 18 }}
  labelStyle={{ color: '#2196F3' }}
  inputContainerStyle={{ borderWidth: 2 }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label text displayed above the input |
| `placeholder` | `string` | - | Placeholder text for the input |
| `value` | `string` | - | Current value of the input |
| `onChangeText` | `Function` | - | Callback when text changes |
| `secureTextEntry` | `boolean` | `false` | Whether to hide text (for passwords) |
| `keyboardType` | `string` | `'default'` | Keyboard type (email-address, numeric, etc.) |
| `autoCapitalize` | `string` | `'sentences'` | Text capitalization mode |
| `autoCorrect` | `boolean` | `true` | Whether to enable auto-correction |
| `error` | `string` | - | Error message to display |
| `disabled` | `boolean` | `false` | Whether the input is disabled |
| `multiline` | `boolean` | `false` | Whether to allow multiple lines |
| `numberOfLines` | `number` | `1` | Number of lines for multiline input |
| `style` | `Object` | - | Additional styles for the input |
| `containerStyle` | `Object` | - | Additional styles for the container |
| `labelStyle` | `Object` | - | Additional styles for the label |
| `inputContainerStyle` | `Object` | - | Additional styles for the input container |

### States

#### Default State
- Light grey border
- White background
- Dark grey label text

#### Focused State
- Primary color border
- Subtle shadow effect
- Enhanced visual feedback

#### Error State
- Red border and text
- Error message displayed below
- Clear visual indication

#### Disabled State
- Greyed out appearance
- Non-interactive
- Reduced opacity

### Examples

See `TextInputFieldExample.js` for comprehensive usage examples including:

- Basic form fields
- Password input with toggle
- Error handling and validation
- Different keyboard types
- Custom styling examples
- Form validation patterns

### Design System Integration

The TextInputField component follows the app's design system:

- Uses colors from `src/constants/colors`
- Applies typography from `src/constants/theme`
- Follows spacing and border radius guidelines
- Implements consistent focus and error states
- Uses existing icon assets for password toggle

### Best Practices

1. **Always provide labels**: Make inputs accessible and clear
2. **Use appropriate keyboard types**: Improve user experience
3. **Handle errors gracefully**: Provide clear error messages
4. **Validate input**: Implement proper form validation
5. **Consider accessibility**: Ensure proper contrast and touch targets

### Accessibility

- Proper touch targets (minimum 44x44 points)
- Clear labels for screen readers
- Sufficient color contrast
- Error announcements for assistive technologies

## ScreenHeader

A flexible and customizable header component for screens with various configurations and styling options.

### Features

- ✅ Multiple variants (default, transparent, elevated)
- ✅ Customizable left, center, and right components
- ✅ Built-in back button functionality
- ✅ Safe area handling for iOS and Android
- ✅ Shadow effects with platform-specific implementations
- ✅ Customizable colors and styling
- ✅ Responsive design following the app's design system

### Basic Usage

```jsx
import ScreenHeader from '../components/ui/ScreenHeader';

// Basic header with title
<ScreenHeader title="My Screen" />

// Header with subtitle
<ScreenHeader 
  title="Profile" 
  subtitle="Manage your account" 
/>

// Header with back button
<ScreenHeader 
  title="Settings"
  showBackButton
  onBackPress={() => navigation.goBack()}
/>
```

### Advanced Usage

```jsx
// Header with custom components
<ScreenHeader
  title="Dashboard"
  leftComponent={<MenuButton onPress={handleMenu} />}
  rightComponent={<NotificationBell onPress={handleNotifications} />}
/>

// Elevated header with shadow
<ScreenHeader
  title="Elevated Header"
  variant="elevated"
  showShadow={true}
/>

// Transparent header over content
<ScreenHeader
  title="Transparent Header"
  variant="transparent"
  titleColor="#FFFFFF"
  subtitleColor="#FFFFFF"
/>

// Custom styled header
<ScreenHeader
  title="Custom Style"
  backgroundColor="#2196F3"
  titleColor="#FFFFFF"
  titleStyle={{ fontSize: 20, fontWeight: 'bold' }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | The main title text |
| `subtitle` | `string` | - | Optional subtitle text |
| `leftComponent` | `React.ReactNode` | - | Custom left component (overrides back button) |
| `rightComponent` | `React.ReactNode` | - | Custom right component |
| `centerComponent` | `React.ReactNode` | - | Custom center component (overrides title/subtitle) |
| `showBackButton` | `boolean` | `false` | Whether to show a back button |
| `onBackPress` | `Function` | - | Callback for back button press |
| `backButtonText` | `string` | `'Back'` | Text for back button |
| `variant` | `'default' \| 'transparent' \| 'elevated'` | `'default'` | Header variant |
| `showShadow` | `boolean` | - | Whether to show shadow (default: true for elevated) |
| `style` | `Object` | - | Additional styles for header container |
| `titleStyle` | `Object` | - | Additional styles for title |
| `subtitleStyle` | `Object` | - | Additional styles for subtitle |
| `safeArea` | `boolean` | `true` | Whether to include safe area padding |
| `backgroundColor` | `string` | - | Custom background color |
| `titleColor` | `string` | - | Custom title color |
| `subtitleColor` | `string` | - | Custom subtitle color |

### Variants

#### Default
- White background
- Light border bottom
- Standard styling

#### Transparent
- Transparent background
- No border
- Useful for overlaying content

#### Elevated
- White background
- Shadow effect
- Elevated appearance

### Examples

See `ScreenHeaderExamples.js` for comprehensive usage examples including:

- Basic headers
- Headers with back buttons
- Custom left/right components
- Different variants
- Custom styling
- Multiple action buttons
- Safe area handling

### Design System Integration

The ScreenHeader component follows the app's design system:

- Uses colors from `src/constants/colors`
- Applies typography from `src/constants/theme`
- Follows spacing guidelines
- Implements platform-specific shadows
- Respects safe area requirements

### Best Practices

1. **Use semantic titles**: Make titles descriptive and user-friendly
2. **Consistent back button**: Use the built-in back button for navigation
3. **Limit right actions**: Don't overcrowd the right section
4. **Consider accessibility**: Ensure sufficient contrast and touch targets
5. **Test on both platforms**: Verify appearance on iOS and Android

### Accessibility

- Proper touch targets (minimum 44x44 points)
- Semantic titles for screen readers
- Sufficient color contrast
- Clear visual hierarchy 