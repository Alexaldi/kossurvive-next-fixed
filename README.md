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
   - `DATABASE_URL` dengan connection string Postgres.
   - `DIRECT_URL` bila ingin memakai connection string non-pooled (bisa dikosongkan).
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` dari proyek Supabase Anda.
   - `SUPABASE_SERVICE_ROLE_KEY` bila butuh akses admin (opsional).

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
