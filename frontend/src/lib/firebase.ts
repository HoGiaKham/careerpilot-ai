import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 1. Khởi tạo App chuẩn Singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Lấy đối tượng Auth AN TOÀN NHẤT (Không bao giờ bị undefined)
const auth = getAuth(app);

// 3. Trị dứt điểm lỗi "Database is closing/hidden" bằng cách ép dùng LocalStorage (Chỉ chạy trên Client)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    // Ignore persistence initialization errors.
  });
}

const googleProvider = new GoogleAuthProvider();

// Facebook không trả email
const facebookProvider = new FacebookAuthProvider();

facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export { app, auth, googleProvider, facebookProvider };