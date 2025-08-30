// Import gesture handler first (required for React Native Gesture Handler)
import './gesture-handler';

/**
 * @format
 * React Native Entry Point - Optimized for performance
 */

// Configure Firebase warnings globally (must be set before Firebase imports)
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = false;

// Core React Native imports
import { AppRegistry } from 'react-native';

// App-specific imports
import App from './App';
import { name as appName } from './app.json';
import { Env } from './src/config/env';

// Initialize environment configuration
Env.init();

// Register the main app component
AppRegistry.registerComponent(appName, () => App);
