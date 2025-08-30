// create a singleton using zustand
import { create } from 'zustand';

const FirebaseController = create((set) => ({
    isFirebaseReady: false,
    isFirestoreReady: false,
    anonymousUser: {
        isLoading: false,
        userDetail: null,
        error: null,
    },
    setIsFirebaseReady: (isFirebaseReady) => set({ isFirebaseReady }),
    setIsFirestoreReady: (isFirestoreReady) => set({ isFirestoreReady }),
    setAnonymousUser: (userDetail) => set({
        anonymousUser: {
            isLoading: false,
            userDetail: userDetail,
            error: null,
        }
    }),
    setIsLoading: (isLoading) => set({
        anonymousUser: {
            ...FirebaseController.getState().anonymousUser,
            isLoading: isLoading
        }
    }),
}));

export default FirebaseController;