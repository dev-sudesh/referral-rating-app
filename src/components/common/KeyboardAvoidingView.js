import React, { useState, useEffect } from 'react';
import {
    KeyboardAvoidingView as RNKeyboardAvoidingView,
    ScrollView,
    Platform,
    StyleSheet,
    View,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

const KeyboardAvoidingView = ({
    children,
    behavior = Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset = 0,
    style,
    contentContainerStyle,
    scrollEnabled = true,
    showsVerticalScrollIndicator = false,
    bounces = true,
    onKeyboardShow,
    onKeyboardHide,
    enableOnAndroid = true,
    ...props
}) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                setKeyboardHeight(event.endCoordinates.height);
                setIsKeyboardVisible(true);
                onKeyboardShow?.(event);
            }
        );

        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            (event) => {
                setKeyboardHeight(0);
                setIsKeyboardVisible(false);
                onKeyboardHide?.(event);
            }
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, [onKeyboardShow, onKeyboardHide]);

    // Calculate the total offset including safe area and custom offset
    const getKeyboardVerticalOffset = () => {
        const safeAreaOffset = Platform.OS === 'ios' ? insets.bottom : 0;
        return keyboardVerticalOffset + safeAreaOffset;
    };

    // Determine if we should use KeyboardAvoidingView
    const shouldUseKeyboardAvoiding =
        Platform.OS === 'ios' || (Platform.OS === 'android' && enableOnAndroid);

    const containerStyle = [
        styles.container,
        style,
    ];

    const scrollContentStyle = [
        styles.scrollContent,
        contentContainerStyle,
    ];

    if (scrollEnabled) {
        return (
            <RNKeyboardAvoidingView
                style={containerStyle}
                behavior={shouldUseKeyboardAvoiding ? behavior : undefined}
                keyboardVerticalOffset={getKeyboardVerticalOffset()}
                enabled={shouldUseKeyboardAvoiding}
                {...props}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={scrollContentStyle}
                    showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                    bounces={bounces}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="none"
                >
                    {children}
                </ScrollView>
            </RNKeyboardAvoidingView>
        );
    }

    return (
        <RNKeyboardAvoidingView
            style={containerStyle}
            behavior={shouldUseKeyboardAvoiding ? behavior : undefined}
            keyboardVerticalOffset={getKeyboardVerticalOffset()}
            enabled={shouldUseKeyboardAvoiding}
            {...props}
        >
            <View style={scrollContentStyle}>
                {children}
            </View>
        </RNKeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: theme.spacing.lg,
    },
});

export default KeyboardAvoidingView;
