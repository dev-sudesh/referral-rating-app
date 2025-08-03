import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MapScreen from '../../screens/main/map/MapScreen';
import RewardsScreen from '../../screens/main/rewards/RewardsScreen';
import ReferralsScreen from '../../screens/main/referrals/ReferralsScreen';
import ProfileScreen from '../../screens/main/profile/ProfileScreen';
import { theme } from '../../constants/theme';
import IconAsset from '../../assets/icons/IconAsset';
import ScreenContainer from '../../components/common/ScreenContainer';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    return (
        <ScreenContainer {...ScreenContainer.presets.full}
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
                        height: 60,
                        elevation: 0,
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
        </ScreenContainer>
    );
};

export default MainTabs; 