<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a3de76d8-0112-4851-bb33-a677080adc15

## Run Locally

**Prerequisites:**  Node.js, a Firebase project with Firestore enabled

1. Install dependencies:
   `npm install`
2. Buat file `.env.local` (salin dari `.env.example`) dan isi `VITE_FIREBASE_*` dengan config
   dari Firebase Console > Project Settings > General > Your apps. Data siswa/nilai aplikasi ini
   disimpan di Firestore (real-time, dibagi semua device) - tanpa ini aplikasi tidak akan jalan.
3. Deploy `firestore.rules` yang ada di root repo ini ke project Firebase kamu (lewat Firebase
   Console > Firestore Database > Rules, atau `firebase deploy --only firestore:rules` kalau
   sudah pakai Firebase CLI).
4. Run the app:
   `npm run dev`

Saat pertama kali dijalankan dengan Firestore yang masih kosong, aplikasi otomatis mengisi data
awal (siswa & indikator) sekali saja - setelah itu perubahan lewat aplikasi (tambah/edit/hapus)
adalah satu-satunya sumber data.
