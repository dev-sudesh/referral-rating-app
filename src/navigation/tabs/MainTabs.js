import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Text } from 'react-native';
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

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const { showPlaceFullCard } = MapsController();
    const { showReferralAlert } = ReferralController();
    const { showImagePicker } = ImagePickerController();
    const [edges, setEdges] = useState(['bottom']);
    React.useEffect(() => {
        if (showPlaceFullCard) {
            setEdges([]);
        } else {
            setEdges(['bottom']);
        }
    }, [showPlaceFullCard]);
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
            {showPlaceFullCard && <PlaceFullCard />}
            {showReferralAlert && <ReferralAlert />}
        </ScreenContainer>
    );
};

export default MainTabs; 