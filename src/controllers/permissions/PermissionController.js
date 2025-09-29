import { create } from 'zustand';

const PermissionController = create((set, get) => ({
    locationServiceEnabled: null,
    locationPermissionGranted: null,
    showPermissionError: null,
    errorType: null, // 'permission' | 'gps' | null
    setLocationPermissionGranted: (granted) => {
        set({ locationPermissionGranted: granted });
        get().updatePermissionErrorState();
    },
    setLocationServiceEnabled: (enabled) => {
        set({ locationServiceEnabled: enabled });
        get().updatePermissionErrorState();
    },
    setErrorType: (type) => {
        set({ errorType: type });
    },
    setShowPermissionError: (show) => {
        set({ showPermissionError: show });
    },
    updatePermissionErrorState: () => {
        const state = get();
        const { locationPermissionGranted, locationServiceEnabled } = state;

        // Determine error type and whether to show error
        if (locationPermissionGranted === false) {
            set({
                showPermissionError: true,
                errorType: 'permission'
            });
        } else if (locationServiceEnabled === false) {
            set({
                showPermissionError: true,
                errorType: 'gps'
            });
        } else {
            set({
                showPermissionError: false,
                errorType: null
            });
        }
    },
    resetLocationState: () => {
        set({
            locationServiceEnabled: false,
            locationPermissionGranted: false,
            showPermissionError: false,
            errorType: null,
        });
    }
}));

export default PermissionController;