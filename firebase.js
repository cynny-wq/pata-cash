import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3UuLS4QxwUaKl9KQQlrTZpRueVudwr_M",
  authDomain: "pata-cash-57842.firebaseapp.com",
  projectId: "pata-cash-57842",
  storageBucket: "pata-cash-57842.firebasestorage.app",
  messagingSenderId: "755895695709",
  appId: "1:755895695709:web:ab0ee7d3ccd6b6af6150b4"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };