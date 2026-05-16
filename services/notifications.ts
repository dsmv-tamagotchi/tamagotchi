import { Alert } from 'react-native';

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    return true; 
  }

  static async sendLocalNotification(title: string, body: string) {
    Alert.alert(
      title,
      body,
      [{ text: 'OK', onPress: () => console.log('Alert closed') }],
      { cancelable: true }
    );
  }
}
