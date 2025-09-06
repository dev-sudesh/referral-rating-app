// create a singleton function using zustand
import { Dimensions } from 'react-native';
import { create } from 'zustand';

const SearchFilterController = create((set) => ({
    isSearchFilterVisible: false,
    filterHeight: Dimensions.get('window').height * 0.9,
    showSearchBar: true,
    handleFilterCallback: null,
    initialFilters: null,
    setIsSearchFilterVisible: ({
        isSearchFilterVisible,
        filterHeight,
        showSearchBar,
        initialFilters,
        handleFilterCallback
    }) => set({
        isSearchFilterVisible,
        filterHeight: filterHeight ? filterHeight : Dimensions.get('window').height * 0.9,
        showSearchBar: showSearchBar == false ? false : true,
        initialFilters: initialFilters ? initialFilters : null,
        handleFilterCallback: handleFilterCallback ? handleFilterCallback : null,
    }),
    setFilterHeight: (filterHeight) => set({ filterHeight }),
    setShowSearchBar: (showSearchBar) => set({ showSearchBar }),
    setHandleFilterCallback: (handleFilterCallback) => set({ handleFilterCallback }),
}));

export default SearchFilterController;