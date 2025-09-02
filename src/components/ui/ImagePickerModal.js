import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
    PermissionsAndroid,
    Pressable,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { theme } from '../../constants/theme';
import ImageAsset from '../../assets/images/ImageAsset';
import AppImage from '../common/AppImage';

const ImagePickerModal = ({
    visible = false,
    onClose,
    onImageSelected,
    title = 'Choose Image',
    cameraText = 'Take Photo',
    galleryText = 'Choose from Gallery',
    cancelText = 'Cancel',
    quality = 0.8,
    maxWidth = 1024,
    maxHeight = 1024,
    includeBase64 = false,
    includeExtra = false,
}) => {
    const [loading, setLoading] = useState(false);

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'This app needs access to your camera to take photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission',
                        message: 'This app needs access to your storage to select photos.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleCameraPress = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
            return;
        }

        setLoading(true);
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality,
                maxWidth,
                maxHeight,
                includeBase64,
                includeExtra,
                saveToPhotos: false,
            });

            if (result.didCancel) {
                console.log('User cancelled camera');
            } else if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Failed to take photo');
            } else if (result.assets && result.assets.length > 0) {
                onImageSelected(result.assets[0]);
                onClose();
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to open camera');
        } finally {
            setLoading(false);
        }
    };

    const handleGalleryPress = async () => {
        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to select photos.');
            return;
        }

        setLoading(true);
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality,
                maxWidth,
                maxHeight,
                includeBase64,
                includeExtra,
                selectionLimit: 1,
            });

            if (result.didCancel) {
                console.log('User cancelled gallery');
            } else if (result.errorCode) {
                Alert.alert('Error', result.errorMessage || 'Failed to select image');
            } else if (result.assets && result.assets.length > 0) {
                onImageSelected(result.assets[0]);
                onClose();
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to open gallery');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Pressable onPress={handleClose} style={styles.overlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.optionsContainer}>
                    <TouchableOpacity activeOpacity={1} style={styles.optionButton} onPress={handleCameraPress}>
                        <View style={styles.optionButtonContent}>
                            <AppImage source={ImageAsset.cameraIcon} style={styles.optionIcon} />
                            <Text style={styles.optionText}>{cameraText}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} style={styles.optionButton} onPress={handleGalleryPress}>
                        <View style={styles.optionButtonContent}>
                            <AppImage source={ImageAsset.galleryIcon} style={styles.optionIcon} />
                            <Text style={styles.optionText}>{galleryText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.overlay.dark,
        width: theme.responsive.screen().width,
        alignItems: 'center',
        justifyContent: 'center',

    },
    modalContainer: {
        alignSelf: 'center',
        width: '85%',
        backgroundColor: theme.colors.background.white,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        margin: theme.spacing.lg,
        ...theme.shadows.large,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.h4,
        color: theme.colors.text.primary,
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionButton: {
        alignItems: 'center',
        width: '45%',
        height: theme.responsive.size(100),
        justifyContent: 'center',
        alignItems: 'stretch',
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.primary[500],
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    optionButtonDisabled: {
        opacity: 0.6,
    },
    optionButtonContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
    },
    optionIcon: {
        width: theme.responsive.iconSize(24),
        height: theme.responsive.iconSize(24),
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: theme.responsive.fontSize(20),
    },
    optionText: {
        ...theme.typography.bodyMedium,
        color: theme.colors.text.primary,
        flex: 1,
    },
    cancelButton: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.neutral[100],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    cancelButtonDisabled: {
        opacity: 0.6,
    },
    cancelText: {
        ...theme.typography.buttonMedium,
        color: theme.colors.text.secondary,
    },
});

export default ImagePickerModal;
