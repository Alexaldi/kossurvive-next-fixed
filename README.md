# KosSurvive (Next.js App Router + Tailwind)

Implementasi cepat dari konsep di dokumen: feed resep ala FYP, olahraga kos + mood tracker, dan belajar kos.

## Prasyarat
- Node.js 18+ dan npm.
- Akses ke database PostgreSQL (mis. Supabase) yang akan menyimpan data pengguna.

## Konfigurasi Environment
1. Duplikat file contoh environment:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` dan isi:
   - `DATABASE_URL` dengan connection string Postgres untuk aplikasi. Saat memakai Supabase, Anda boleh menggunakan host pooler (`*.pooler.supabase.com:6543`).
   - `DIRECT_URL` untuk koneksi langsung (wajib mengarah ke port 5432 di Supabase) agar migrasi dan seed tidak melewati pooler.
   - `PRISMA_SEED_DATABASE_URL` (opsional) bila ingin memakai koneksi berbeda khusus untuk `prisma db seed`; bila kosong maka akan memakai `DIRECT_URL`.
- `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari proyek Supabase Anda.
- `SUPABASE_SERVICE_ROLE_KEY` bila butuh akses admin (opsional).
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (opsional) bila Anda ingin menentukan bucket publik default yang menyimpan aset gambar.
- `NEXT_PUBLIC_SUPABASE_LOGO_PATH` (opsional) untuk menentukan path atau nama file logo pada bucket publik.

## Konfigurasi Supabase Storage

- Buat bucket publik di Supabase Storage (mis. `public-assets`) dan simpan seluruh gambar aplikasi di dalamnya.
- Simpan metadata konten pada tabel `public_recipe_gallery` dengan kolom berikut minimal: `id`, `title`, `description`, `category`, `price`, dan `image_url`. Kolom `image_url` dapat berupa:
  - URL penuh (`https://.../storage/v1/object/public/...`), atau
  - Path objek (mis. `public-assets/resep/nasi-goreng.jpg`), atau
  - Pasangan bucket + path terpisah (`bucket`, `path` / `storage_path`).
- Logo navbar akan dicari pada tabel `site_assets` (baris `slug = 'primary_logo'`). Anda bisa menyimpan `image_url` atau kombinasi `bucket` dan `path` di tabel ini. Jika tabel kosong, aplikasi memakai nilai dari `NEXT_PUBLIC_SUPABASE_LOGO_PATH` lalu jatuh ke placeholder bawaan bila tetap gagal.
- Aplikasi otomatis mem-cache URL publik Supabase di sisi klien. Jika Anda mengganti file dengan nama sama, panggil `clearSupabaseImageCache()` dari `lib/supabase/storage` atau refresh penuh browser untuk melihat versi terbaru.

## Deploy ke Vercel

1. Buka **Project Settings → Environment Variables** pada dashboard Vercel.
2. Tambahkan variabel berikut pada lingkungan **Production**, **Preview**, dan **Development**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` (opsional, isi dengan nama bucket publik)
   - `NEXT_PUBLIC_SUPABASE_LOGO_PATH` (opsional, isi path objek logo mis. `public-assets/branding/logo.png`)
   - Variabel Prisma/database lain seperti `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dll sesuai kebutuhan.
3. Deploy ulang proyek. Next.js akan otomatis mengizinkan domain Supabase Storage berdasarkan `NEXT_PUBLIC_SUPABASE_URL`, jadi gambar publik langsung tersedia tanpa konfigurasi tambahan.

## Modul Admin

- Area admin dapat diakses melalui `/admin` dan hanya menerima login email/password Supabase Auth.
- Pastikan akun admin memiliki `user_metadata.role = "admin"`; contoh kredensial uji coba: `admin@kossurvive.com` / `123456`.
- Sesi admin disimpan di cookie server-side (`sb-admin-auth-token`) dan terpisah dari sesi user biasa.
- Dashboard menyediakan CRUD untuk Resep, Workout, dan Materi Belajar, lengkap dengan unggah gambar ke Supabase Storage menggunakan `SUPABASE_SERVICE_ROLE_KEY`.
- Tombol logout akan menghapus cookie admin dan mengarahkan kembali ke `/admin/login`.

## Instalasi Dependensi & Prisma
```bash
npm install
npx prisma generate
npx prisma migrate deploy   # atau prisma db push jika belum ada migrasi
npm run db:seed             # opsional untuk mengisi data awal
```

## Menjalankan Aplikasi
```bash
npm run dev
# kemudian buka http://localhost:3000
```
