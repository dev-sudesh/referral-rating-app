// create a singleton function controller using zustand
import { create } from 'zustand';
import ImageAsset from '../../assets/images/ImageAsset';

const RewardController = create((set) => ({
    rewards: [],
    rewardRedeemedStatus: false,
    selectedReward: null,
    setRewards: (rewards) => set({ rewards }),
    setRewardRedeemedStatus: (status) => set({ rewardRedeemedStatus: status }),
    setSelectedReward: (reward) => set({ selectedReward: reward }),
}));

export default RewardController;