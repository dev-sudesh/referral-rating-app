import { Dimensions, Platform, StatusBar } from "react-native";
import RNDeviceInfo from 'react-native-device-info';

const DeviceInfo = {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isTablet: Dimensions.get('window').width >= 768,
    isPhone: Dimensions.get('window').width < 768,
    isLandscape: Dimensions.get('window').width > Dimensions.get('window').height,
    isPortrait: Dimensions.get('window').width < Dimensions.get('window').height,
    buildNumber: RNDeviceInfo.getBuildNumber(),
    buildVersion: RNDeviceInfo.getVersion(),
    statusBarHeight: StatusBar.currentHeight || 0,
    init: function () {
        this.isIOS = Platform.OS === 'ios';
        this.isAndroid = Platform.OS === 'android';
        this.isTablet = Dimensions.get('window').width >= 768;
        this.isPhone = Dimensions.get('window').width < 768;
        this.isLandscape = Dimensions.get('window').width > Dimensions.get('window').height;
        this.isPortrait = Dimensions.get('window').width < Dimensions.get('window').height;
        this.buildNumber = RNDeviceInfo.getBuildNumber();
        this.buildVersion = RNDeviceInfo.getVersion();
        this.statusBarHeight = StatusBar.currentHeight || 0;
    },
};

export default DeviceInfo;