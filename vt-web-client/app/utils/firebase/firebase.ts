import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged,
    User,
    UserCredential
} from "firebase/auth";
import { getFunctions } from "firebase/functions";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXSXeKy14XCKJoLwtUyuxB_b_fBD4GhLQ",
  authDomain: "viewtube-e2b83.firebaseapp.com",
  projectId: "viewtube-e2b83",
  appId: "1:265437101019:web:e5aee949aa70fbb38f05fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const functions = getFunctions();

/**
 * Signs in the user with a Google popup.
 * 
 * @returns A Promise that resolves when the user is signed in with the user's credentials.
 */
export function signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs out the user.
 * 
 * @returns A Promise that resolves when the user is signed out.
 */
export function signOut(): Promise<void> {
    return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * 
 * @param callback A function to unsubscribe callback.
 * @returns A function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}