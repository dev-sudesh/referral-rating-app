import { Platform } from 'react-native';
import DeviceInfo from './deviceInfo/DeviceInfo';

const MapUtils = {
    Provider: 'google',
    init: function () {
        this.Provider = 'google';
        if (Platform.OS === 'ios') {
            this.Provider = DeviceInfo.isEmulator ? 'apple' : 'google';
        }
    }
}

export default MapUtils;