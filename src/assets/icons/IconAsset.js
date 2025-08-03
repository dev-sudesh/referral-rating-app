import EyeOn from '../../assets/icons/eye-on.svg';
import EyeOff from '../../assets/icons/eye-off.svg';
import ArrowBack from '../../assets/icons/back-arrow.svg';
import MapIcon from '../../assets/icons/bottomTabs/map-icon.svg';
import RewardsIcon from '../../assets/icons/bottomTabs/rewards-icon.svg';
import ReferralsIcon from '../../assets/icons/bottomTabs/referrals-icon.svg';
import ProfileIcon from '../../assets/icons/bottomTabs/profile-icon.svg';
import MapIconSelected from '../../assets/icons/bottomTabs/map-icon-selected.svg';
import RewardsIconSelected from '../../assets/icons/bottomTabs/rewards-icon-selected.svg';
import ReferralsIconSelected from '../../assets/icons/bottomTabs/referrals-icon-selected.svg';
import ProfileIconSelected from '../../assets/icons/bottomTabs/profile-icon-selected.svg';

const IconAsset = {
    eyeOn: EyeOn,
    eyeOff: EyeOff,
    arrowBack: ArrowBack,
    bottomTab: {
        selected: {
            mapIcon: MapIconSelected,
            rewardsIcon: RewardsIconSelected,
            referralsIcon: ReferralsIconSelected,
            profileIcon: ProfileIconSelected,
        },
        unSelected: {
            mapIcon: MapIcon,
            rewardsIcon: RewardsIcon,
            referralsIcon: ReferralsIcon,
            profileIcon: ProfileIcon,
        },
    },
}

export default IconAsset;