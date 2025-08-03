import { NativeModules } from 'react-native';


const NativeModuleUtils = {
    SplashScreen: {
        show: () => {
            const { SplashScreen } = NativeModules;
            SplashScreen.show();
        },
        hide: () => {
            const { SplashScreen } = NativeModules;
            SplashScreen.hide();
        },
    },
}

export default NativeModuleUtils;