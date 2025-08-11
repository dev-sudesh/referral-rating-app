# UI Components

## SearchFilter

A comprehensive search filter component that uses `react-native-raw-bottom-sheet` to display filter options in a bottom sheet modal.

### Features

- **Bottom Sheet Modal**: Uses `react-native-raw-bottom-sheet` for smooth animations
- **Multiple Filter Categories**: Supports multiple filter categories (Favorites, Category, Cuisine, etc.)
- **Search Within Filters**: Search bar to filter the filter options themselves
- **Visual Feedback**: Selected filters are highlighted with different colors and icons
- **Filter Count**: Shows the number of active filters in the header
- **Clear All**: Option to clear all selected filters at once
- **Responsive Design**: Follows the app's theme and responsive design patterns

### Usage

```jsx
import SearchFilter from '../components/ui/SearchFilter';

const MyComponent = () => {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});

    const handleFilterPress = () => {
        setIsFilterVisible(true);
    };

    const handleFilterClose = () => {
        setIsFilterVisible(false);
    };

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        console.log('Applied filters:', filters);
        // Implement your filter logic here
    };

    return (
        <View>
            <TouchableOpacity onPress={handleFilterPress}>
                <Text>Open Filters</Text>
            </TouchableOpacity>

            <SearchFilter
                isVisible={isFilterVisible}
                onClose={handleFilterClose}
                onApplyFilters={handleApplyFilters}
                initialFilters={activeFilters}
            />
        </View>
    );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | `false` | Controls the visibility of the bottom sheet |
| `onClose` | `function` | - | Callback when the bottom sheet is closed |
| `onApplyFilters` | `function` | - | Callback when filters are applied (receives filters object) |
| `initialFilters` | `object` | `{}` | Initial filter state to populate the component |

### Filter Data Structure

The component includes predefined filter categories:

```javascript
const filterCategories = {
    favorites: {
        title: 'Favorites',
        options: [
            { id: 'fav1', label: 'Favorite 1' },
            { id: 'fav2', label: 'Favorite 2' },
            // ... more options
        ]
    },
    category: {
        title: 'Category',
        options: [
            { id: 'food', label: 'Food' },
            { id: 'drinks', label: 'Drinks' },
            // ... more options
        ]
    },
    cuisine: {
        title: 'Cuisine',
        options: [
            { id: 'italian', label: 'Italian' },
            { id: 'german', label: 'German' },
            // ... more options
        ]
    },
    otherCategory: {
        title: 'Other category',
        options: [
            { id: 'other1', label: 'Other 1' },
            { id: 'other2', label: 'Other 2' },
            // ... more options
        ]
    }
};
```

### Filter State Structure

The filters are stored as an object where keys are category names and values are arrays of selected filter IDs:

```javascript
{
    favorites: ['fav1', 'fav3'],
    category: ['food'],
    cuisine: ['asian', 'italian']
}
```

### Customization

To customize the filter categories, modify the `filterCategories` object in the `SearchFilter.js` file:

```javascript
const filterCategories = {
    yourCategory: {
        title: 'Your Category Title',
        options: [
            { id: 'option1', label: 'Option 1' },
            { id: 'option2', label: 'Option 2' },
            // ... more options
        ]
    }
};
```

### Integration with SearchBar

The SearchFilter component is designed to work with the SearchBar component. The SearchBar includes a filter button that shows the number of active filters:

```jsx
<SearchBar
    handleBackPress={handleBackPress}
    setSearchText={setSearchText}
    onFilterPress={handleFilterPress}
    activeFilterCount={getActiveFilterCount()}
/>
```

### Example Component

See `SearchFilterExample.js` for a complete example of how to use the SearchFilter component.

### Dependencies

- `react-native-raw-bottom-sheet`: For the bottom sheet modal
- `react-native`: Core React Native components
- Theme constants from the app's design system

### Styling

The component uses the app's theme system for consistent styling:
- Colors from `theme.colors`
- Typography from `theme.typography`
- Spacing from `theme.spacing`
- Border radius from `theme.borderRadius`

All styles are responsive and follow the app's design patterns. 