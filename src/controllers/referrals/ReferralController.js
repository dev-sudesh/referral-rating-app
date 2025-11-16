// create a singleton function controller using zustand
import { create } from 'zustand';

const ReferralController = create((set) => ({
    showReferralAlert: false,
    placeReferredStatus: false,
    referredPlaces: [],
    setReferredPlaces: (places) => set({ referredPlaces: places }),
    setPlaceReferredStatus: (status) => set({ placeReferredStatus: status }),
    setShowReferralAlert: (show) => set({ showReferralAlert: show }),
}));

export default ReferralController;