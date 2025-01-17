import { registerRootComponent } from 'expo';
import './i18n.ts'; // This line imports the i18n configuration
import App from './pages/mainPage.tsx';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
