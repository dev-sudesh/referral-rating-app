// create a singleton function using zustand
import { create } from 'zustand';

const SearchFilterController = create((set) => ({
    isSearchFilterVisible: false,
    setIsSearchFilterVisible: (isSearchFilterVisible) => set({ isSearchFilterVisible }),
}));

export default SearchFilterController;