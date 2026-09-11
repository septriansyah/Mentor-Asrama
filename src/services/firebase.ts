import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

// Konfigurasi diambil dari environment variable (lihat .env.example).
// Vite hanya expose variabel berawalan VITE_ ke kode client-side.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  // eslint-disable-next-line no-console
  console.error(
    'Konfigurasi Firebase belum diisi. Salin .env.example ke .env.local dan isi VITE_FIREBASE_*.'
  );
}

const app = initializeApp(firebaseConfig);
// ignoreUndefinedProperties: field opsional (mis. Penilaian.catatan) yang bernilai undefined
// tidak boleh membuat setDoc/updateDoc gagal - biarkan Firestore mengabaikannya, bukan error.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
