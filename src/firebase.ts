
import { initializeApp } from 'firebase/app';
import {
  MessagePayload,
  getMessaging,
  getToken,
  onMessage,
} from 'firebase/messaging';
import { setLocalStorageItem } from './utils/storage/local-storage';
import { Storage } from './contstants/storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyBXX2dHPna8O-NbaWTD7ukqSTaPVA9rdy0',
  authDomain: 'cloudmessages4-2875f.firebaseapp.com',
  databaseURL:
    'https://cloudmessages4-2875f-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'cloudmessages4-2875f',
  storageBucket: 'cloudmessages4-2875f.appspot.com',
  messagingSenderId: '1021060863316',
  appId: '1:1021060863316:web:a147612fd4043fe02e24c1',
};

const vapidKey =
  'BGu8h6ldSab2I6yJQXsUNNn-yvki3f_4ikbXtmW9PCUeDbERHmjCi4CSl9cGWbvUF7N1k2hVtLhMSTAKb0TEoSM';

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const getDeviceToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { vapidKey });
      if (currentToken) {
        console.log('Current token for client: ', currentToken);
        setLocalStorageItem(Storage.currentToken, currentToken);
        // Track the token -> client mapping, by sending to backend server
        // show on the UI that permission is secured
      } else {
        console.log(
          'No registration token available. Request permission to generate one.'
        );
        // shows on the UI that permission is required
      }
    } else if (permission === 'denied') {
      console.log('Notification permission was denied.');
      // Inform the user that notifications are blocked
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    // catch error while creating client token
  }
};

export const onMessageListener = () =>
  new Promise<MessagePayload>((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
