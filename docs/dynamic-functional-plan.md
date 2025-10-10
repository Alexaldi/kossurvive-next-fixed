# Rencana Fungsional Dinamis KoSurvive

## Ringkasan Kondisi Saat Ini

| Area | Sumber Data Saat Ini | Catatan |
| --- | --- | --- |
| Onboarding pengguna | API `/api/user` menyimpan data ke store global di memori dan hanya memilih pengguna pertama untuk sesi berikutnya. | Endpoint tidak memanfaatkan Supabase/Prisma dan tidak tahan restart. 【F:app/onboarding/page.jsx†L17-L26】【F:app/api/user/route.js†L5-L19】【F:lib/store.js†L1-L29】 |
| Rekomendasi resep & feed | Data resep berasal dari konstanta lokal dan skor preferensi disimpan di memori global. | Tidak ada koneksi database, histori interaksi hilang ketika server restart. 【F:app/feed/page.jsx†L21-L92】【F:lib/data.js†L14-L59】【F:app/api/recommend/route.js†L5-L10】 |
| Workout & pencatatan mood | Daftar workout diambil dari konstanta lokal, mood disimpan di memori global. | Tidak ada riwayat mood per pengguna di database. 【F:app/olahraga/page.jsx†L61-L197】【F:app/api/workouts/route.js†L1-L3】【F:app/api/mood/route.js†L1-L9】 |
| Kalender aktivitas | Aktivitas disimpan di `localStorage` sehingga tidak sinkron antar perangkat. | Tidak ada entri pada database maupun endpoint server. 【F:app/kalender/page.jsx†L9-L88】【F:app/tambah-aktivitas/page.jsx†L6-L81】 |
| Halaman belajar | Daftar kursus statis dan progres tersimpan di `localStorage`. | Tidak ada data backend maupun penyimpanan progres terpusat. 【F:app/belajar/page.jsx†L5-L147】【F:lib/data.js†L61-L132】 |
| Ringkasan entry di beranda | Komponen mencoba memanggil `/api/entries` namun route belum ada sehingga selalu gagal. | Perlu integrasi dengan tabel catatan aktivitas. 【F:components/home/EntryPreview.jsx†L15-L125】 |

## Perubahan yang Diusulkan

### 1. Skema Database & Prisma
- Tambahkan tabel baru yang memetakan fitur UI:
  - `Recipe`, `RecipeCategory`, dan `RecipeInteraction` untuk menyimpan katalog resep serta skor interaksi per pengguna.
  - `Workout` dan `WorkoutSession` agar daftar workout serta jadwal tersimpan per pengguna.
  - `LearningResource` dan `LearningProgress` untuk modul belajar dan status tonton.
  - `MoodLog` serta `Activity` untuk pencatatan mood harian dan kalender aktivitas.
  - Perlu relasi `UserProfile` ↔ Supabase `auth.users` melalui `supabaseId`. 【F:prisma/schema.prisma†L1-L27】
- Susun migration Prisma baru beserta `prisma/seed.js` agar environment lokal siap diuji.

### 2. Integrasi Supabase & Middleware Auth
- Gunakan session Supabase yang sudah ada di `app/page.jsx`/`app/home/page.jsx` untuk mendapatkan `user.id` dan hubungkan dengan `UserProfile` via helper baru (mis. `lib/auth/getCurrentProfile`). 【F:app/page.jsx†L1-L24】【F:app/home/page.jsx†L1-L24】
- Pada route server, validasi Supabase session sebelum mengakses data per pengguna.

### 3. Pembaruan API Route
- Ganti implementasi `/api/user` agar melakukan upsert `UserProfile` & preferensi ke tabel Prisma, bukan store in-memory.
- Buat ulang namespace `/api/recommend` sehingga:
  - `GET` menghitung skor berbasis data `RecipeInteraction` & preferensi awal.
  - `POST /like|/save|/view` mencatat interaksi ke database dan mengembalikan skor terbaru.
- Tambahkan route REST/handler Prisma untuk:
  - `/api/recipes` (list resep dari DB + filter kategori).
  - `/api/workouts` (list workout dari DB).
  - `/api/mood` (POST mood harian ke `MoodLog`).
  - `/api/activities` (CRUD aktivitas kalender).
  - `/api/learning` (list modul dan update progres tonton).
  - `/api/entries` (mengambil ringkasan gabungan aktivitas terbaru untuk EntryPreview).
- Pastikan seluruh respons memakai helper `successResponse`/`errorResponse` untuk konsistensi. 【F:lib/api/response.js†L1-L6】

### 4. Penyesuaian Komponen Client
- Onboarding: setelah submit, panggil endpoint baru lalu arahkan pengguna berdasarkan profile yang tersimpan.
- Feed: ganti sumber data awal `RECIPES` dengan respons `/api/recipes`, dan gunakan skor dari `/api/recommend` yang sudah tersinkron dengan DB.
- Olahraga: render workout dari endpoint database dan tampilkan riwayat mood/log di UI (misalnya list 7 hari terakhir).
- Kalender & Tambah Aktivitas: gunakan fetch ke `/api/activities` untuk membaca/menambah/menghapus jadwal; hapus ketergantungan `localStorage`.
- Belajar: muat modul belajar dari DB, simpan progres dengan `PATCH /api/learning/:id/progress` sehingga dapat disinkron antar perangkat.
- EntryPreview: konsumsi data dari `/api/entries` agar menampilkan aktivitas terbaru lintas fitur.
- Tambahkan handling loading/error berdasarkan respons server yang baru.

### 5. Seed Data & Utilitas Pendukung
- Perbarui `prisma/seed.js` agar mengisi tabel resep, workout, dan modul belajar berdasarkan data yang saat ini berada di `lib/data.js` untuk menjaga konsistensi konten awal.
- Sediakan helper untuk konversi kategori/enum agar UI tetap kompatibel.

### 6. Rencana Uji
- Jalankan `npm run lint` dan `npm run test` (jika tersedia) setelah implementasi.
- Buat skrip manual untuk memverifikasi alur utama: onboarding → feed (like/save) → kalender → mood → belajar.

## Catatan Tambahan
- Setelah backend siap, pertimbangkan untuk menghapus `lib/data.js` dan `lib/store.js` agar tidak ada sumber data ganda.
- Dokumentasikan environment variable Supabase/Database di `README.md` untuk memudahkan setup tim.

## Langkah Eksekusi Prioritas
1. **Siapkan Fondasi Database**
   - Tambahkan model Prisma baru beserta migrasi awal dan pastikan `prisma/seed.js` mengisi data dasar resep, workout, dan modul belajar.
   - Verifikasi koneksi Supabase melalui `npx prisma studio` atau query manual untuk memastikan tabel baru muncul.
2. **Amankan Otentikasi & Profil**
   - Refactor endpoint `/api/user` untuk upsert `UserProfile` dan kaitkan Supabase `user.id` ke profil lokal.
   - Uji alur onboarding end-to-end sehingga reload halaman tetap mempertahankan preferensi pengguna.
3. **Bangun API Inti Per Fitur**
   - Implementasikan `/api/recipes`, `/api/recommend`, `/api/workouts`, `/api/mood`, `/api/activities`, `/api/learning`, dan `/api/entries` dengan Prisma.
   - Setiap endpoint minimal mendukung operasi `GET` untuk membaca data awal, kemudian tambahkan `POST/PATCH/DELETE` sesuai kebutuhan fitur.
4. **Integrasi Frontend Bertahap**
   - Mulai dari halaman feed untuk memvalidasi alur data baru, disusul kalender, olahraga/mood, belajar, dan akhirnya komponen ringkasan beranda.
   - Selama migrasi, bungkus panggilan fetch dengan fallback agar UI tetap berfungsi ketika backend belum lengkap.
5. **Uji & Dokumentasikan**
   - Setelah setiap modul terhubung ke database, jalankan lint/test dan lakukan uji manual lintas halaman.
   - Perbarui README dengan instruksi menjalankan migrasi, seeding, dan variabel lingkungan yang wajib di-set.
