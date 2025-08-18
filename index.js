import './gesture-handler';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Env } from './src/config/env';

Env.init();

AppRegistry.registerComponent(appName, () => App);
