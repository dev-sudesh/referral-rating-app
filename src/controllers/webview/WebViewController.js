// create a singleton function controller using zustand
import { create } from 'zustand';

const WebViewController = create((set) => ({
    pageTitle: null,
    isLoading: false,
    webViewUrl: "https://www.google.com",
    isError: false,
    errorMessage: null,
    setWebViewUrl: (url) => set({ webViewUrl: url }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsError: (isError) => set({ isError }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    setPageTitle: (pageTitle) => set({ pageTitle }),
}));

export default WebViewController;