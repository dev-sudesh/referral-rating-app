import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const useNetworkConnectivity = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [connectionType, setConnectionType] = useState(null);
    const [isInternetReachable, setIsInternetReachable] = useState(true);
    const [connectionState, setConnectionState] = useState('connected'); // 'connected', 'no-network', 'no-internet'

    useEffect(() => {
        // Get initial network state
        const getInitialNetworkState = async () => {
            const state = await NetInfo.fetch();
            updateConnectionState(state);
        };

        getInitialNetworkState();

        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener(state => {
            updateConnectionState(state);
        });

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    const updateConnectionState = (state) => {
        setIsConnected(state.isConnected);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable);

        // Determine the specific connection state
        if (!state.isConnected) {
            setConnectionState('no-network');
        } else if (state.isConnected && state.isInternetReachable === false) {
            setConnectionState('no-internet');
        } else {
            setConnectionState('connected');
        }
    };

    // Check if we have a valid internet connection
    const hasValidConnection = isConnected && isInternetReachable;

    // Get user-friendly connection status
    const getConnectionStatus = () => {
        switch (connectionState) {
            case 'no-network':
                return {
                    title: 'No Internet Connection',
                    message: 'Please check your internet connection and try again. Make sure you\'re connected to Wi-Fi or mobile data.',
                    type: 'no-network'
                };
            case 'no-internet':
                return {
                    title: 'Connected but No Internet',
                    message: 'You\'re connected to a network, but there\'s no internet access. Please check your network settings or try a different connection.',
                    type: 'no-internet'
                };
            default:
                return {
                    title: 'Connected',
                    message: 'You have a working internet connection.',
                    type: 'connected'
                };
        }
    };

    return {
        isConnected,
        connectionType,
        isInternetReachable,
        hasValidConnection,
        connectionState,
        getConnectionStatus,
    };
};

export default useNetworkConnectivity;
