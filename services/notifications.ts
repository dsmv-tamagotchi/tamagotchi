import * as Notifications from 'expo-notifications';

export async function requestPermission() {
  await Notifications.requestPermissionsAsync();
}

export async function sendTestNotification(message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Alerta, to",
      body: message,
    },
    trigger: null
  });
}