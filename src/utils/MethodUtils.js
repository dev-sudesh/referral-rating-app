const days = {
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
    sun: 7,
}

const MethodUtils = {
    currentTimeIsBetween: (openTime) => {
        // openTime is like "Mon - Sat: 08:00 - 23:00"
        // need to check current time and day is between openTime
        const [openDayRange, openTimeRange] = openTime.split(': ');
        const [openStartDay, openEndDay] = openDayRange.split(' - ');
        const [openStartTime, openEndTime] = openTimeRange.split(' - ');
        const currentTime = new Date();
        const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'short' });

        const isOpen = days[currentDay] >= days[openStartDay] && days[currentDay] <= days[openEndDay] && currentTime >= openStartTime && currentTime <= openEndTime;

        return isOpen;

    },
};

export default MethodUtils;