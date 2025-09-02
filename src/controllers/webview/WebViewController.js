// create a singleton function controller using zustand
import { create } from 'zustand';

const WebViewController = create((set) => ({
    pageTitle: null,
    isLoading: false,
    webViewUrl: null,
    webViewHtml: null,
    isError: false,
    errorMessage: null,
    setWebViewUrl: (url) => set({ webViewUrl: url }),
    setIsLoading: (isLoading) => set({ isLoading }),
    setIsError: (isError) => set({ isError }),
    setErrorMessage: (errorMessage) => set({ errorMessage }),
    setPageTitle: (pageTitle) => set({ pageTitle }),
    setWebViewHtml: (html) => set({ webViewHtml: html }),
}));

export default WebViewController;