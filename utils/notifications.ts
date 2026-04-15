import * as Notifications from 'expo-notifications';

export const scheduleEventNotification = async (
  title: string,
  date: Date
) => {
  // 1 day before
  const oneDayBefore = new Date(date);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  // Same day at 9 AM
  const sameDay = new Date(date);
  sameDay.setHours(9, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming Case Event',
      body: title,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: oneDayBefore,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Today’s Case Event',
      body: title,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: sameDay,
    },
  });
};