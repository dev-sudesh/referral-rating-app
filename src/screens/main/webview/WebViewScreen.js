import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import WebViewController from '../../../controllers/webview/WebViewController';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const WebViewScreen = () => {
    const navigation = useNavigation();
    const webViewRef = useRef(null);
    const { pageTitle, isLoading, webViewUrl, isError, errorMessage, setIsLoading, setWebViewUrl, setIsError, setErrorMessage } = WebViewController();
    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            paddingCustom={{
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
            }}
        >
            <ScreenHeader
                style={{
                    paddingHorizontal: theme.spacing.md,
                }}
                title={pageTitle}
                titleStyle={{
                    fontWeight: theme.fontWeight.bold,
                }}
                showBackButton
                onBackPress={() => navigation.goBack()}
            />
            <WebView
                source={{ uri: "https://www.google.com" }}
                ref={webViewRef}
                contentStyle={{
                    flex: 1,
                }}
            // onLoad={() => setIsLoading(false)}
            // onError={() => setIsError(true)}
            />
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({

});

export default WebViewScreen;