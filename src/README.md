# RNFramework - React Native Project Structure

This is a comprehensive React Native framework with a professional, industry-level folder structure and modern UI components.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components used across the app
│   └── ui/              # Basic UI components (Button, Input, etc.)
├── screens/             # Screen components
│   ├── auth/            # Authentication screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ResetPasswordScreen.js
│   ├── onboarding/      # Onboarding screens
│   │   └── OnboardingScreen.js
│   ├── main/            # Main app screens
│   │   ├── map/         # Map screen
│   │   ├── rewards/     # Rewards screen
│   │   ├── referrals/   # Referrals screen
│   │   └── profile/     # Profile screen
│   ├── SplashScreen.js
│   └── SocialLogicScreen.js
├── navigation/          # Navigation configuration
│   ├── stacks/          # Stack navigators
│   │   └── AuthStack.js
│   ├── tabs/            # Tab navigators
│   │   └── MainTabs.js
│   └── AppNavigator.js  # Main app navigator
├── constants/           # App constants and configuration
│   ├── colors/          # Color palette
│   ├── fonts/           # Typography and font configuration
│   └── theme/           # Complete theme configuration
├── services/            # API services and external integrations
├── utils/               # Utility functions and helpers
├── assets/              # Static assets
│   ├── fonts/           # Custom fonts
│   ├── images/          # Images and icons
│   └── icons/           # Icon assets
├── hooks/               # Custom React hooks
├── store/               # State management (Redux, Context, etc.)
└── types/               # TypeScript type definitions
```

## 🎨 Design System

### Colors
The app uses a comprehensive color system with:
- **Primary Colors**: Blue palette (50-900)
- **Secondary Colors**: Purple palette (50-900)
- **Neutral Colors**: Gray palette (50-900)
- **Semantic Colors**: Success, Warning, Error
- **Background Colors**: Primary, Secondary, Tertiary, Dark
- **Text Colors**: Primary, Secondary, Tertiary, Inverse, Disabled
- **Border Colors**: Light, Medium, Dark
- **Overlay Colors**: Light, Medium, Dark

### Typography
The typography system includes:
- **Font Families**: Inter (primary), Poppins (secondary), RobotoMono (mono)
- **Font Sizes**: Display, Heading (H1-H6), Body, Label, Button, Caption
- **Font Weights**: Thin, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black
- **Line Heights**: Optimized for each font size

### Spacing
Consistent spacing system:
- **Base Unit**: 4px
- **Scale**: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48), xxxl(64)
- **Specific Spacing**: Screen padding, card padding, button padding, etc.

### Border Radius
- **Scale**: none(0), xs(4), sm(8), md(12), lg(16), xl(20), xxl(24), round(50), full(9999)

### Shadows
Platform-specific shadows for iOS and Android with small, medium, and large variants.

## 📱 Screens

### 1. Splash Screen
- App branding and loading animation
- Auto-navigation to onboarding after 3 seconds

### 2. Onboarding Screen
- Multi-slide introduction to the app
- Swipeable interface with pagination
- Skip and navigation controls

### 3. Social Logic Screen
- Social authentication options (Google, Facebook, Apple)
- Email login option
- Skip functionality

### 4. Authentication Screens
- **Login Screen**: Email/password login with validation
- **Register Screen**: User registration with form validation
- **Reset Password Screen**: Password reset functionality

### 5. Main App Screens
- **Map Screen**: Interactive map with nearby places and filters
- **Rewards Screen**: Points system, available/redeemed rewards, achievements
- **Referrals Screen**: Referral codes, sharing, history, and rewards
- **Profile Screen**: User profile, settings, quick actions

## 🧩 Components

### UI Components
- **Button**: Multiple variants (primary, secondary, outline), sizes, and states
- **Input**: Form inputs with validation, password visibility, and error states

### Navigation
- **AppNavigator**: Main navigation container
- **AuthStack**: Authentication flow navigation
- **MainTabs**: Bottom tab navigation for main app

## 🎯 Features

### Authentication
- Social login integration
- Email/password authentication
- Password reset functionality
- Form validation

### Map Integration
- Interactive map placeholder
- Location-based features
- Nearby places with filters
- Directions functionality

### Rewards System
- Points accumulation
- Level progression
- Reward redemption
- Achievement tracking

### Referral System
- Referral code generation
- Social sharing
- Referral tracking
- Reward distribution

### Profile Management
- User information display
- Settings management
- Quick actions
- Account statistics

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Install navigation dependencies:
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
# or
yarn add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context
```

3. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

4. Run the app:
```bash
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

## 📋 Dependencies

### Required Navigation Dependencies
- `@react-navigation/native`
- `@react-navigation/stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`

### Optional Dependencies (for full functionality)
- `react-native-maps` (for map integration)
- `@react-native-async-storage/async-storage` (for data persistence)
- `react-native-vector-icons` (for custom icons)
- `react-native-gesture-handler` (for advanced gestures)

## 🎨 Customization

### Theme Customization
Modify the theme in `src/constants/theme/index.js`:
- Colors in `src/constants/colors/index.js`
- Typography in `src/constants/fonts/index.js`
- Spacing, border radius, and shadows in the main theme file

### Adding New Screens
1. Create the screen component in the appropriate folder
2. Add it to the navigation stack/tab
3. Update the navigation flow if needed

### Adding New Components
1. Create the component in `src/components/`
2. Follow the existing patterns for styling and theming
3. Export and use throughout the app

## 📝 Best Practices

1. **Consistent Styling**: Always use the theme constants for colors, typography, and spacing
2. **Component Reusability**: Create reusable components for common UI patterns
3. **Navigation**: Use the established navigation patterns
4. **Error Handling**: Implement proper error handling and user feedback
5. **Performance**: Optimize components for performance, especially lists and images
6. **Accessibility**: Include proper accessibility labels and support

## 🔧 Development

### Code Style
- Use functional components with hooks
- Follow React Native best practices
- Use consistent naming conventions
- Implement proper TypeScript types (if using TypeScript)

### Testing
- Unit tests for components
- Integration tests for navigation flows
- E2E tests for critical user journeys

### Performance
- Optimize bundle size
- Implement lazy loading where appropriate
- Use proper image optimization
- Monitor app performance

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository. 