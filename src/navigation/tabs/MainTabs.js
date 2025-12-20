import React, { useState, useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BackHandler, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import MapScreen from '../../screens/main/map/MapScreen';
import RewardsScreen from '../../screens/main/rewards/RewardsScreen';
import ReferralsScreen from '../../screens/main/referrals/ReferralsScreen';
import ProfileScreen from '../../screens/main/profile/ProfileScreen';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';
import ScreenContainer from '../../components/common/ScreenContainer';
import PlaceFullCard from '../../components/ui/PlaceFullCard';
import MapsController from '../../controllers/maps/MapsController';
import ReferralAlert from '../../components/ui/ReferralAlert';
import ReferralController from '../../controllers/referrals/ReferralController';
import ImagePickerController from '../../controllers/imagePicker/ImagePickerController';
import Constants from '../../constants/data';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const navigation = useNavigation();
    const tabNavigatorRef = useRef(null);
    const { showPlaceFullCard, setShowPlaceFullCard, setSelectedPlace, setShowPlaceBigCard, selectedViewType, setSelectedViewType, selectedPlace } = MapsController();
    const { showReferralAlert } = ReferralController();
    const { showImagePicker } = ImagePickerController();
    const [edges, setEdges] = useState(['bottom']);
    const [currentTab, setCurrentTab] = useState('Map');

    useEffect(() => {
        if (showPlaceFullCard) {
            setEdges([]);
        } else {
            setEdges(['bottom']);
        }
    }, [showPlaceFullCard]);

    const [currentStackRoute, setCurrentStackRoute] = useState(null);

    // Track current tab route and stack route
    useEffect(() => {
        const updateCurrentTab = () => {
            const state = navigation.getState();

            // Track current stack route (for detecting SearchScreen, etc.)
            if (state?.routes && state.routes.length > 0) {
                const activeStackRoute = state.routes[state.index];
                if (activeStackRoute?.name) {
                    setCurrentStackRoute(activeStackRoute.name);
                }
            }

            // Find the MainTabs route in the stack navigator
            const mainTabsRoute = state?.routes?.find(route => route.name === 'MainTabs');
            if (mainTabsRoute?.state?.routes && mainTabsRoute.state.routes.length > 0) {
                // Get the active tab from the tab navigator's state
                const activeTab = mainTabsRoute.state.routes[mainTabsRoute.state.index];
                if (activeTab?.name) {
                    setCurrentTab(activeTab.name);
                }
            }
        };

        const unsubscribe = navigation.addListener('state', (e) => {
            updateCurrentTab();
        });

        // Get initial route
        updateCurrentTab();

        return unsubscribe;
    }, [navigation]);

    // Handle back button press
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Priority 1: If SearchScreen is open, close it first
            if (currentStackRoute === Constants.Screen.Search) {
                navigation.goBack();
                return true; // Prevent default back behavior
            }

            // Priority 2: If PlaceFullCard is open, close it first
            if (showPlaceFullCard) {
                setShowPlaceFullCard(false);
                setShowPlaceBigCard(false);
                setSelectedPlace(null);
                return true; // Prevent default back behavior
            }

            // Priority 3: If a place is selected (but PlaceFullCard is not open), unselect the place
            if (selectedPlace) {
                setSelectedPlace(null);
                setShowPlaceBigCard(false);
                return true; // Prevent default back behavior
            }

            // Priority 4: If user is not on Map tab, navigate to Map tab
            if (currentTab !== 'Map') {
                // Since MainTabs is the tab navigator component, useNavigation() returns the parent stack navigator
                // We need to navigate within the tab navigator using CommonActions
                try {
                    // Try to navigate to MainTabs with Map screen
                    navigation.dispatch(
                        CommonActions.navigate({
                            name: 'MainTabs',
                            params: {
                                screen: 'Map',
                            },
                        })
                    );
                } catch (error) {
                    // Fallback: try direct navigation
                    try {
                        navigation.navigate('MainTabs', { screen: 'Map' });
                    } catch (e) {
                        // Navigation fallback failed
                    }
                }
                return true; // Prevent default back behavior
            }

            // Priority 5: If user is on ListView on map tab, switch to map view
            if (currentTab === 'Map' && selectedViewType === 'list') {
                setSelectedViewType('map');
                return true; // Prevent default back behavior
            }

            // Priority 6: If user is on map tab and map view is selected, close the app
            if (currentTab === 'Map' && selectedViewType === 'map') {
                if (Platform.OS === 'android') {
                    BackHandler.exitApp();
                }
                return true; // Prevent default back behavior
            }

            // Default: allow default back behavior
            return false;
        });

        return () => backHandler.remove();
    }, [currentStackRoute, showPlaceFullCard, selectedPlace, currentTab, navigation, selectedViewType, setShowPlaceFullCard, setShowPlaceBigCard, setSelectedPlace, setSelectedViewType]);
    return (
        <ScreenContainer {...ScreenContainer.presets.full}
            edges={edges}
            backgroundColor={theme.colors.background.primary}
            paddingCustom={{

            }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        let IconName;

                        if (route.name === 'Map') {
                            IconName = focused ? IconAsset.bottomTab.selected.mapIcon : IconAsset.bottomTab.unSelected.mapIcon;
                        } else if (route.name === 'Rewards') {
                            IconName = focused ? IconAsset.bottomTab.selected.rewardsIcon : IconAsset.bottomTab.unSelected.rewardsIcon;
                        } else if (route.name === 'Referrals') {
                            IconName = focused ? IconAsset.bottomTab.selected.referralsIcon : IconAsset.bottomTab.unSelected.referralsIcon;
                        } else if (route.name === 'Profile') {
                            IconName = focused ? IconAsset.bottomTab.selected.profileIcon : IconAsset.bottomTab.unSelected.profileIcon;
                        }

                        return <IconName width={size} height={size} />;
                    },
                    tabBarActiveTintColor: theme.colors.primary[500],
                    tabBarInactiveTintColor: theme.colors.text.tertiary,
                    tabBarStyle: {
                        backgroundColor: theme.colors.background.primary,
                        borderTopColor: theme.colors.border.light,
                        paddingBottom: 5,
                        paddingTop: 5,
                        elevation: 0,
                        height: showPlaceFullCard ? 0 : 60,
                        overflow: 'hidden',
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: theme.fontWeight.medium,
                    },
                })}
            >
                <Tab.Screen
                    name="Map"
                    component={MapScreen}
                    options={{
                        tabBarLabel: 'Map',
                    }}
                />
                <Tab.Screen
                    name="Rewards"
                    component={RewardsScreen}
                    options={{
                        tabBarLabel: 'Rewards',
                    }}
                />
                <Tab.Screen
                    name="Referrals"
                    component={ReferralsScreen}
                    options={{
                        tabBarLabel: 'Referrals',
                    }}
                />
                <Tab.Screen
                    name="Profile"
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Profile',
                    }}
                />
            </Tab.Navigator>
            {showReferralAlert && <ReferralAlert />}
        </ScreenContainer>
    );
};

export default MainTabs; 