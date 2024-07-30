
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: "AIzaSyBXX2dHPna8O-NbaWTD7ukqSTaPVA9rdy0",
  authDomain: "cloudmessages4-2875f.firebaseapp.com",
  databaseURL: "https://cloudmessages4-2875f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cloudmessages4-2875f",
  storageBucket: "cloudmessages4-2875f.appspot.com",
  messagingSenderId: "1021060863316",
  appId: "1:1021060863316:web:a147612fd4043fe02e24c1"
};



firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  console.log('Received background message ', payload.headers);
  const notificationTitle = payload.notification.title;
  /**
   * notificationOptions is an object that can have the following properties:
   * 
    interface NotificationOptions {
      actions?: NotificationAction[];
      badge?: string;
      body?: string;
      data?: any;
      dir?: NotificationDirection;
      icon?: string;
      image?: string;
      lang?: string;
      renotify?: boolean;
      requireInteraction?: boolean;
      silent?: boolean | null;
      tag?: string;
      timestamp?: EpochTimeStamp;
      vibrate?: VibratePattern;
    }
   */
  const notificationOptions = {
    body: payload.notification.body,
    requireInteraction:payload.notification.requireInteraction,
    image:payload.notification.image,
    dir:payload.notification.dir,
  };
  self.registration.showNotification(notificationTitle,notificationOptions);
});
