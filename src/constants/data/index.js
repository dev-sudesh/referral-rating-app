import { Platform } from "react-native";
import ImageAsset from "../../assets/images/ImageAsset";

const Constants = {
    onboarding: [
        {
            id: '1',
            title: 'Recognise the business that you like',
            subtitle: '',
            description: '',
            icon: ImageAsset.intro.intro1,
        },
        {
            id: '2',
            title: 'Refer them to increase their rating',
            subtitle: '',
            description: '',
            icon: ImageAsset.intro.intro2,
        },
        {
            id: '3',
            title: 'Be rewarded from them for your loyalty',
            subtitle: '',
            description: '',
            icon: ImageAsset.intro.intro3,
        },
    ],
    socialOptions: (platform) => {
        return [
            {
                id: 'facebook',
                title: 'Continue with Facebook',
                color: '#3D5B98',
                platform: ['android', 'ios'],
            },
            {
                id: 'twitter',
                title: 'Continue with Twitter',
                color: '#4AA0EB',
                platform: ['android', 'ios'],
            },
            {
                id: 'apple',
                title: 'Continue with Apple',
                color: '#020002',
                platform: ['ios'],
            },
        ].filter(option => option.platform.includes(platform))
    },
    Screen: {
        Splash: 'Splash',
        Onboarding: 'Onboarding',
        Stack: {
            Auth: 'AuthStack',
            Main: 'MainTabs',
        },
        AuthStack: {
            SocialLogic: 'SocialLogic',
            Login: 'Login',
            Register: 'Register',
            ResetPassword: 'ResetPassword',
        },
        MainTabs: {
            Map: 'Map',
            Rewards: 'Rewards',
            Referrals: 'Referrals',
            Profile: 'Profile',
        },
        Search: 'Search',
        PersonalInfo: 'PersonalInfo',
        FavoriteFilters: 'FavoriteFilters',
        NotificationSettings: 'NotificationSettings',
        SignInOptions: 'SignInOptions',
    },
}

export default Constants;