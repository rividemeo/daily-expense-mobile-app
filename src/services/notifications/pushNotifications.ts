import * as Notifications from 'expo-notifications';
import * as Device from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id',
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1565C0',
    });

    await Notifications.setNotificationChannelAsync('recurring', {
      name: 'Recurring Transactions',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync('summaries', {
      name: 'Monthly Summaries',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return token.data;
}

export async function scheduleBudgetAlert(
  budgetName: string,
  percentage: number
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⚠️ Budget Alert',
      body: `You've used ${percentage}% of your ${budgetName} budget.`,
      data: { type: 'budget_alert' },
      categoryIdentifier: 'budget-alerts',
    },
    trigger: null,
  });
}

export async function scheduleRecurringReminder(
  description: string,
  amount: number,
  daysBeforeDue: number = 1
): Promise<void> {
  const triggerDate = new Date();
  triggerDate.setDate(triggerDate.getDate() + daysBeforeDue);
  triggerDate.setHours(9, 0, 0, 0);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔄 Upcoming Transaction',
      body: `${description} ($${amount.toFixed(2)}) is due ${daysBeforeDue === 0 ? 'today' : 'tomorrow'}.`,
      data: { type: 'recurring_transaction' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
