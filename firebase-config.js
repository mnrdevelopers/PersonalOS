// Firebase configuration
  const firebaseConfig = {
  apiKey: "AIzaSyBnRKEd7Up3qbwC3mqCQhQLD2_Wd11rdzw",
  authDomain: "expiry-tracker-aadcc.firebaseapp.com",
  projectId: "expiry-tracker-aadcc",
  storageBucket: "expiry-tracker-aadcc.firebasestorage.app",
  messagingSenderId: "17745090137",
  appId: "1:17745090137:web:077f0c5e0e1eca1fd34348",
  measurementId: "G-ST64HBYQLD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore settings for offline support
db.enablePersistence()
  .catch((err) => {
      console.log('Firebase persistence error: ', err);
  });
