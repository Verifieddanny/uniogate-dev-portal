import { getApps, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload, type Messaging } from 'firebase/messaging';

// Web config is public by design (it identifies the project, it doesn't grant access).
// Keep it identical to public/firebase-messaging-sw.js.
export const firebaseConfig = {
  apiKey: 'AIzaSyAzFpOi5HvS9lmQt7D9eQxxnhaRg2klfuw',
  authDomain: 'uniogate-39b1b.firebaseapp.com',
  projectId: 'uniogate-39b1b',
  storageBucket: 'uniogate-39b1b.firebasestorage.app',
  messagingSenderId: '647177645034',
  appId: '1:647177645034:web:671b3cd34f3baa004ea093',
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let messagingPromise: Promise<Messaging | null> | null = null;

/** Firebase Messaging, or null when this browser can't do web push (e.g. Safari tab not installed to Home Screen) */
function messaging() {
  messagingPromise ??= isSupported().then((ok) =>
    ok ? getMessaging(getApps()[0] ?? initializeApp(firebaseConfig)) : null,
  );
  return messagingPromise;
}

/** Asks permission, registers the service worker and returns this browser's FCM token */
export async function getWebPushToken(): Promise<string> {
  if (!VAPID_KEY) throw new Error('NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set.');

  const m = await messaging();
  if (!m) throw new Error('This browser doesn’t support web push.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notifications are blocked for this site. Allow them in the browser’s site settings.');

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;

  const token = await getToken(m, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error('Firebase didn’t return a token. Try again.');
  return token;
}

/**
 * While the tab is open and focused, FCM does NOT show a system notification.
 * It hands the message to the page instead. Returns an unsubscribe function.
 */
export async function onForegroundPush(handler: (payload: MessagePayload) => void): Promise<() => void> {
  const m = await messaging();
  return m ? onMessage(m, handler) : () => {};
}
