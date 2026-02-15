import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: "market-purse",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: "868383628473",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : (getApps()[0] || null);

let auth: any = null;
let db: any = null;

if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("Firebase config missing. Skipping initialization. (This is expected during build if env vars are missing)");
}

// Messaging is only supported in the browser
let messaging: any = null;
if (typeof window !== "undefined") {
    // We need to check if messaging is supported (it might not be in some environments)
    import("firebase/messaging").then(({ isSupported, getMessaging }) => {
        isSupported().then(supported => {
            if (supported) {
                messaging = getMessaging(app);
            }
        });
    });
}

export { app, auth, db, messaging };
