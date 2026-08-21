// Import the functions you need from the SDKs you need
const fbapp = require("firebase/app")
const fbstorage = require("firebase/storage")
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIKwYzn5EKmnfsfJgu_mbPjfEJAESTCss",
  authDomain: "osem-puzzle.firebaseapp.com",
  projectId: "osem-puzzle",
  storageBucket: "osem-puzzle.appspot.com",
  messagingSenderId: "326015687795",
  appId: "1:326015687795:web:64a15a84ae1810a85ade06",
};

// Initialize Firebase
const app = fbapp.initializeApp(firebaseConfig);
const storage = fbstorage.getStorage(app);

module.exports = {storage}
