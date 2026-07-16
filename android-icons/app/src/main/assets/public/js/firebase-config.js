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

// Caching transactions to avoid redundant full database queries on write/read transitions
window.transactionsCache = null;
window.getTransactions = async function(userId, forceRefetch = false) {
  if (!window.transactionsCache || forceRefetch) {
    console.log("[TransactionsCache] Cache miss. Fetching from Firestore...");
    const snapshot = await db.collection('transactions')
      .where('userId', '==', userId)
      .get();
    window.transactionsCache = snapshot.docs;
  } else {
    console.log("[TransactionsCache] Cache hit. Returning cached transactions...");
  }
  return window.transactionsCache;
};

window.invalidateTransactionsCache = function() {
  console.log("[TransactionsCache] Invalidating transactions cache...");
  window.transactionsCache = null;
};

// Wrap Firestore operations on the transactions collection to auto-invalidate the cache on write
const originalCollection = db.collection;
db.collection = function(name) {
  const colRef = originalCollection.apply(this, arguments);
  if (name === 'transactions') {
    const originalAdd = colRef.add;
    colRef.add = async function() {
      window.invalidateTransactionsCache();
      return originalAdd.apply(this, arguments);
    };
    const originalDoc = colRef.doc;
    colRef.doc = function() {
      const docRef = originalDoc.apply(this, arguments);
      const originalUpdate = docRef.update;
      docRef.update = async function() {
        window.invalidateTransactionsCache();
        return originalUpdate.apply(this, arguments);
      };
      const originalDelete = docRef.delete;
      docRef.delete = async function() {
        window.invalidateTransactionsCache();
        return originalDelete.apply(this, arguments);
      };
      const originalSet = docRef.set;
      docRef.set = async function() {
        window.invalidateTransactionsCache();
        return originalSet.apply(this, arguments);
      };
      return docRef;
    };
  }
  return colRef;
};

// Wrap Firestore batch writes to auto-invalidate cache on commit
const originalBatch = db.batch;
db.batch = function() {
  const batchRef = originalBatch.apply(this, arguments);
  const originalCommit = batchRef.commit;
  batchRef.commit = async function() {
    window.invalidateTransactionsCache();
    return originalCommit.apply(this, arguments);
  };
  return batchRef;
};

const storage = firebase.storage();

const remoteConfig = firebase.remoteConfig();

remoteConfig.settings = {
    minimumFetchIntervalMillis: 0 // Set to 0 for development to fetch immediately
};
remoteConfig.defaultConfig = {
    "watchmode_api_key": ""
};

// Export for use in other files
window.auth = auth;
window.db = db;
window.storage = storage;
window.remoteConfig = remoteConfig;