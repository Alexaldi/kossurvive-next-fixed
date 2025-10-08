import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error("Supabase belum dikonfigurasi. NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi.")
        return NextResponse.redirect(new URL("/login", request.url))
    }

    const cookieStore = cookies()

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (arr) => arr.forEach(({ name, value, options }) => cookieStore.set({ name, value, ...options })),
        },
    })

    // ✅ Refresh session setelah redirect dari Google
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        console.error("OAuth callback error:", error)
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // ✅ Sinkronisasi userProfile
    await fetch(`${request.nextUrl.origin}/api/user/sync`, { method: "POST" })

    // ✅ Redirect ke halaman utama
    const nextParam = request.nextUrl.searchParams.get("next")
    const target = nextParam && nextParam.startsWith("/") ? nextParam : "/"
    return NextResponse.redirect(new URL(target, request.url))
}
