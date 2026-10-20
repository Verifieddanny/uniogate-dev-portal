/* global importScripts, firebase */
// Shows pushes while the portal tab is closed or in the background.
// Must live at the site root: /firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Same config as lib/firebase.ts
firebase.initializeApp({
  apiKey: 'AIzaSyAzFpOi5HvS9lmQt7D9eQxxnhaRg2klfuw',
  authDomain: 'uniogate-39b1b.firebaseapp.com',
  projectId: 'uniogate-39b1b',
  storageBucket: 'uniogate-39b1b.firebasestorage.app',
  messagingSenderId: '647177645034',
  appId: '1:647177645034:web:671b3cd34f3baa004ea093',
});

// Messages with a `notification` block (all of ours) are displayed automatically,
// and clicking one opens `webpush.fcmOptions.link` from the backend.
firebase.messaging();
