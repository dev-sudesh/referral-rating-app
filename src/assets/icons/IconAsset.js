import EyeOn from '../../assets/icons/others/eye-on.svg';
import EyeOff from '../../assets/icons/others/eye-off.svg';
import ArrowBack from '../../assets/icons/others/back-arrow.svg';
import MapIcon from '../../assets/icons/bottomTabs/map-icon.svg';
import RewardsIcon from '../../assets/icons/bottomTabs/rewards-icon.svg';
import ReferralsIcon from '../../assets/icons/bottomTabs/referrals-icon.svg';
import ProfileIcon from '../../assets/icons/bottomTabs/profile-icon.svg';
import MapIconSelected from '../../assets/icons/bottomTabs/map-icon-selected.svg';
import RewardsIconSelected from '../../assets/icons/bottomTabs/rewards-icon-selected.svg';
import ReferralsIconSelected from '../../assets/icons/bottomTabs/referrals-icon-selected.svg';
import ProfileIconSelected from '../../assets/icons/bottomTabs/profile-icon-selected.svg';
import MarkerIcon from '../../assets/icons/others/marker-icon.svg';
import SearchIcon from '../../assets/icons/others/search-icon.svg';
import FilterIcon from '../../assets/icons/others/filter-icon.svg';
import NewProfileIcon from '../../assets/icons/others/new-profile-icon.svg';
import ArrowRightIcon from '../../assets/icons/others/arrow-angle-right.svg';
import PlusIcon from '../../assets/icons/others/plus-icon.svg';
import CheckIcon from '../../assets/icons/others/check-icon.svg';

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
    markerIcon: require('../../assets/icons/others/marker-icon.svg'),
    markerIconSvg: MarkerIcon,
    searchIcon: SearchIcon,
    filterIcon: FilterIcon,
    newProfileIcon: NewProfileIcon,
    arrowRightIcon: ArrowRightIcon,
    plusIcon: PlusIcon,
    checkIcon: CheckIcon,
}

export default IconAsset;