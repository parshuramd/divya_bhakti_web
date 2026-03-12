import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { store } from './src/store';
import { RootNavigator } from './src/navigation';
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    notificationService.registerForPushNotifications();

    const notifSubscription = notificationService.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;
        Toast.show({
          type: 'info',
          text1: title || 'Notification',
          text2: body || '',
        });
      }
    );

    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        const data = response.notification.request.content.data;
        // Handle deep-link navigation based on notification data
        if (data?.screen) {
          // Navigate to the appropriate screen
        }
      }
    );

    return () => {
      notifSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <RootNavigator />
          <Toast position="top" topOffset={60} />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
