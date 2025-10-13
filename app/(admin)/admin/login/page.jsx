import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import LoginForm, { initialState } from "./LoginForm"
import { createAdminClientFromCookies, requireAdminUser } from "@/lib/supabase/server-admin"

async function authenticateAdmin(_prevState = initialState, formData) {
  "use server"

  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." }
  }

  const cookieStore = cookies()
  const supabase = createAdminClientFromCookies(cookieStore)

  if (!supabase) {
    return { error: "Konfigurasi Supabase belum lengkap." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message || "Login gagal." }
  }

  const user = data?.user

  if (!user || user.user_metadata?.role !== "admin") {
    await supabase.auth.signOut()
    return { error: "Akun ini tidak memiliki akses admin." }
  }

  revalidatePath("/admin/dashboard")
  redirect("/admin/dashboard")
}

export default async function AdminLoginPage() {
  try {
    await requireAdminUser(cookies())
    redirect("/admin/dashboard")
  } catch (error) {
    if (process.env.NODE_ENV === "development" && error?.message) {
      console.info("Admin session check:", error.message)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mt-16 text-center">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Admin Area</h2>
        <p className="mt-3 text-3xl font-bold text-slate-100">Kelola Konten KoSurvive</p>
        <p className="mt-2 max-w-md text-center text-sm text-slate-400">
          Masuk untuk mengelola resep, workout, dan materi belajar yang tampil di aplikasi pengguna.
        </p>
      </div>
      <LoginForm action={authenticateAdmin} />
      <div className="mt-10 max-w-xl rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Catatan deployment:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Isi environment NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, dan DATABASE_URL.</li>
          <li>Tambahkan akun admin secara manual via Supabase Auth (contoh: admin@kossurvive.com / 123456).</li>
          <li>Supabase menyimpan sesi admin di cookie server-side khusus sehingga terpisah dari login pengguna.</li>
        </ul>
      </div>
    </div>
  )
}
