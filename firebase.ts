import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRTzRMZyPPKMCBjpJxkacpDH8JaC3qEHo",
  authDomain: "post-with-us.firebaseapp.com",
  projectId: "post-with-us",
  storageBucket: "post-with-us.appspot.com",
  messagingSenderId: "305292836518",
  appId: "1:305292836518:web:6e5e69965d6d12266e7e67",
  measurementId: "G-8J75RCV7Y4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };
