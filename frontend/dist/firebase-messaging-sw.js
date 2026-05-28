importScripts(
  "https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js"
);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDM1g0paGxT4anb8xyvj0FlyxX7ooDqADc",
  authDomain: "momentum-1d43b.firebaseapp.com",
  projectId: "momentum-1d43b",
  storageBucket: "momentum-1d43b.firebasestorage.app",
  messagingSenderId: "680167337515",
  appId: "1:680167337515:web:f0a8daec892bc0a709846e",
  measurementId: "G-YMGZV2L6DJ",
};

// Initialize Firebase using compat SDK
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // Ensure the icon path is correct
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
