import React, { useRef } from 'react';
import { theme } from '../../../constants/theme';
import ScreenContainer from '../../../components/common/ScreenContainer';
import ScreenHeader from '../../../components/ui/ScreenHeader';
import WebViewController from '../../../controllers/webview/WebViewController';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const WebViewScreen = () => {
    const navigation = useNavigation();
    const webViewRef = useRef(null);
    const { pageTitle, webViewUrl, webViewHtml } = WebViewController();
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
            {(webViewHtml || webViewUrl) && (
                <WebView
                    source={{ ...(webViewHtml ? { html: webViewHtml } : { uri: webViewUrl }) }}
                    ref={webViewRef}
                    contentStyle={{
                        flex: 1,
                    }}
                />
            )}
        </ScreenContainer>
    );
};

export default WebViewScreen;