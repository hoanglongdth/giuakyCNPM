import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDogzW9Icuveaoec77wyCBcA_vurPLwxaU",
  authDomain: "cnpmapp-f30dc.firebaseapp.com",
  projectId: "cnpmapp-f30dc",
  storageBucket: "cnpmapp-f30dc.firebasestorage.app",
  messagingSenderId: "364828607363",
  appId: "1:364828607363:web:a05641af603232f3346cb6",
  measurementId: "G-8Z34Z7L7HE",
};

// Khai báo biến app
let app;

// Kiểm tra nếu app đã khởi tạo rồi thì dùng lại, chưa thì khởi tạo mới
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Khởi tạo và export database
const db = getFirestore(app);

export { db };
