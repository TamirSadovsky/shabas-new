// Import the functions you need from the SDKs you need
require("dotenv").config();
const fbapp = require("firebase/app")
const fbstorage = require("firebase/storage")
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration - see .env.example
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(
    `Firebase config missing from environment: ${missing.join(", ")}. See .env.example`
  );
}

// Initialize Firebase
const app = fbapp.initializeApp(firebaseConfig);
const storage = fbstorage.getStorage(app);

module.exports = {storage}
