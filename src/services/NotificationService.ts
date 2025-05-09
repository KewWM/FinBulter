import * as Notifications from 'expo-notifications';

export class NotificationService {
  static async initialize() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.HIGH
      }),
    });

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return false;
    }
    return true;
  }

  static async scheduleBudgetAlert(currentExpense: number, budget: number, timeframe: 'daily' | 'weekly'): Promise<void> {
    try {
      if (!budget || budget <= 0 || !currentExpense || currentExpense <= 0) {
        return;
      }

      const percentage = (currentExpense / budget) * 100;
      const timeframeDisplay = timeframe === 'daily' ? 'today' : 'this week';
      const emoji = timeframe === 'daily' ? '⚠️' : '🚨';
      const warningEmoji = timeframe === 'daily' ? '⚡' : '📊';

      if (currentExpense >= budget) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Budget Alert! ${emoji}`,
            body: timeframe === 'daily' 
              ? `You've exceeded your daily budget of RM${budget.toFixed(2)}. Today's spending: RM${currentExpense.toFixed(2)}`
              : `Weekly budget exceeded! You've spent RM${currentExpense.toFixed(2)} out of your RM${budget.toFixed(2)} weekly budget.`,
            data: { type: 'budget_alert', timeframe },
            priority: 'high',
            sound: true,
            vibrate: [0, 250, 250, 250],
          },
          trigger: null,
        });
      } else if (percentage >= 80) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Budget Warning ${warningEmoji}`,
            body: timeframe === 'daily'
              ? `You're close to your daily limit! You've used ${percentage.toFixed(1)}% of today's budget (RM${currentExpense.toFixed(2)}/RM${budget.toFixed(2)})`
              : `Weekly budget update: You've used ${percentage.toFixed(1)}% of this week's budget (RM${currentExpense.toFixed(2)}/RM${budget.toFixed(2)})`,
            data: { type: 'budget_warning', timeframe },
            priority: 'high',
            sound: true,
            vibrate: [0, 250, 250, 250],
          },
          trigger: null,
        });
      }
    } catch (error) {
      console.error('Error scheduling budget alert:', error);
    }
  }
}
