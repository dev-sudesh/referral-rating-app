import Toast from 'react-native-toast-message';

/**
 * ToastUtils - A utility object for showing toast messages using react-native-toast-message
 * 
 * Usage:
 * import ToastUtils from '../utils/ToastUtils';
 * 
 * ToastUtils.success('Operation completed successfully!');
 * ToastUtils.error('Something went wrong!');
 * ToastUtils.info('Here is some information');
 * ToastUtils.warning('Please check your input');
 */

const ToastUtils = {
    /**
     * Show a success toast message
     * @param {string} message - The message to display
     * @param {string} title - Optional title for the toast
     * @param {number} duration - Duration in milliseconds (default: 4000)
     */
    success: (message, { title = 'Success', duration = 4000 } = {}) => {
        Toast.show({
            type: 'success',
            text1: title,
            text2: message,
            visibilityTime: duration,
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
        });
    },

    /**
     * Show an error toast message
     * @param {string} message - The message to display
     * @param {string} title - Optional title for the toast
     * @param {number} duration - Duration in milliseconds (default: 5000)
     */
    error: (message, { title = 'Error', duration = 5000 } = {}) => {
        Toast.show({
            type: 'error',
            text1: title,
            text2: message,
            visibilityTime: duration,
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
        });
    },

    /**
     * Show an info toast message
     * @param {string} message - The message to display
     * @param {string} title - Optional title for the toast
     * @param {number} duration - Duration in milliseconds (default: 4000)
     */
    info: (message, { title = 'Info', duration = 4000 } = {}) => {
        Toast.show({
            type: 'info',
            text1: title,
            text2: message,
            visibilityTime: duration,
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
        });
    },

    /**
     * Show a warning toast message
     * @param {string} message - The message to display
     * @param {string} title - Optional title for the toast
     * @param {number} duration - Duration in milliseconds (default: 4500)
     */
    warning: (message, { title = 'Warning', duration = 4500 } = {}) => {
        Toast.show({
            type: 'error', // Using error type for warning as react-native-toast-message doesn't have warning by default
            text1: title,
            text2: message,
            visibilityTime: duration,
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
        });
    },

    /**
     * Show a custom toast message with custom configuration
     * @param {Object} config - Custom configuration object
     */
    custom: (config) => {
        const defaultConfig = {
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
            visibilityTime: 4000,
        };

        Toast.show({
            ...defaultConfig,
            ...config,
        });
    },

    /**
     * Hide any currently visible toast
     */
    hide: () => {
        Toast.hide();
    },

    /**
     * Show a simple message without title (just message)
     * @param {string} message - The message to display
     * @param {string} type - Type of toast ('success', 'error', 'info')
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    simple: (message, type = 'info', duration = 3000) => {
        Toast.show({
            type: type,
            text1: message,
            visibilityTime: duration,
            autoHide: true,
            position: 'bottom',
            bottomOffset: 60,
        });
    },

    /**
     * Show a toast for network errors
     * @param {string} message - Optional custom message
     */
    networkError: (message = 'Network connection failed. Please check your internet connection.') => {
        ToastUtils.error(message, 'Connection Error', 6000);
    },

    /**
     * Show a toast for validation errors
     * @param {string} message - The validation error message
     */
    validationError: (message) => {
        ToastUtils.error(message, 'Validation Error', 4000);
    },

    /**
     * Show a toast for loading states
     * @param {string} message - Loading message
     */
    loading: (message = 'Loading...') => {
        ToastUtils.info(message, '', 2000);
    },

    /**
     * Show a toast for successful operations
     * @param {string} operation - The operation that was successful
     */
    operationSuccess: (operation = 'Operation') => {
        ToastUtils.success(`${operation} completed successfully!`);
    },
};

export default ToastUtils;
