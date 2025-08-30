// create a singleton function controller using zustand
import { create } from 'zustand';

const MapsController = create((set) => ({
    selectedViewType: 'map',
    showPlaceFullCard: false,
    selectedPlace: null,
    showPlaceBigCard: false,
    places: [],
    userLocation: null,
    setUserLocation: (userLocation) => set({ userLocation: userLocation }),
    setPlaces: (places) => set({ places: places }),
    setSelectedViewType: (viewType) => set({ selectedViewType: viewType }),
    setShowPlaceFullCard: (show) => set({ showPlaceFullCard: show }),
    setSelectedPlace: (place) => set({ selectedPlace: place }),
    setShowPlaceBigCard: (show) => set({ showPlaceBigCard: show }),
}));

export default MapsController;