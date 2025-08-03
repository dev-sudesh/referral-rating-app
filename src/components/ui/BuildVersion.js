import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import DeviceInfo from '../../utils/deviceInfo/DeviceInfo';
import theme from '../../constants/theme';

const BuildVersion = (props) => {
    const { containerStyle, versionStyle } = props;
    return (
        <View style={[styles.footer, containerStyle]}>
            <Text style={[styles.version, versionStyle]}>Version {DeviceInfo.buildVersion} ({DeviceInfo.buildNumber})</Text>
        </View>
    )
}

export default BuildVersion

const styles = StyleSheet.create({

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        alignItems: 'center',
    },
    version: {
        ...theme.typography.captionMedium,
        color: theme.colors.primary[800],
    },
})