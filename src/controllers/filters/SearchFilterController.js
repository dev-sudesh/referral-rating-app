// create a singleton function using zustand
import { Dimensions } from 'react-native';
import { create } from 'zustand';

const SearchFilterController = create((set) => ({
    isSearchFilterVisible: false,
    filterHeight: Dimensions.get('window').height * 0.9,
    showSearchBar: true,
    setIsSearchFilterVisible: ({ isSearchFilterVisible, filterHeight, showSearchBar }) => set({ isSearchFilterVisible, filterHeight: filterHeight ? filterHeight : Dimensions.get('window').height * 0.9, showSearchBar: showSearchBar == false ? false : true }),
    setFilterHeight: (filterHeight) => set({ filterHeight }),
    setShowSearchBar: (showSearchBar) => set({ showSearchBar }),
}));

export default SearchFilterController;