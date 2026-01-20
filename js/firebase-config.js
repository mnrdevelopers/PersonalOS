// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyATb0LTO6aqULvUUGOmuKXWiC-DdUTMD3o",
  authDomain: "personalos-80c18.firebaseapp.com",
  projectId: "personalos-80c18",
  storageBucket: "personalos-80c18.firebasestorage.app",
  messagingSenderId: "74874759257",
  appId: "1:74874759257:web:4f16c492f70ab0884ba948",
  measurementId: "G-FMK3WRTCTK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const remoteConfig = firebase.remoteConfig();

remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000 // 1 hour
};
remoteConfig.defaultConfig = {
    "watchmode_api_key": ""
};

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
window.remoteConfig = remoteConfig;