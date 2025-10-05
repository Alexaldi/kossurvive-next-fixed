// middleware.js
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const isDev = process.env.NODE_ENV === "development"
const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(req) {
    const res = NextResponse.next()

    if (!hasSupabaseConfig) {
        if (isDev) {
            console.warn("⚠️ Supabase env belum di-set, middleware melewati proteksi auth.")
        }
        return res
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => req.cookies.getAll(),
                setAll: (cookies) => {
                    cookies.forEach(({ name, value }) => req.cookies.set(name, value))
                    res.cookies.set(cookies)
                },
            },
        }
    )

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (isDev) {
        console.log("🔍 Path:", req.nextUrl.pathname)
        console.log("🔍 User:", user)
        console.log("🔍 Error:", error)
    }

    const publicPaths = ["/", "/login", "/register"]
    const isAuthCallback = req.nextUrl.pathname === "/auth/callback"

    // 1️⃣ kalau BELUM login → tendang ke /login (kecuali di path /login & /register)
    if (!user && !publicPaths.includes(req.nextUrl.pathname) && !isAuthCallback) {
        if (isDev) console.log("⚠️ Redirecting: Not logged in")
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/login"
        return NextResponse.redirect(redirectUrl)
    }

    // 2️⃣ kalau SUDAH login → jangan bisa buka /login atau /register
    if (user && publicPaths.includes(req.nextUrl.pathname)) {
        if (isDev) console.log("⚠️ Redirecting: Already logged in")
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = "/" // atau "/app-user" sesuai kebutuhan lo
        return NextResponse.redirect(redirectUrl)
    }

    // 3️⃣ kalau admin path tapi role bukan admin → tendang ke root
    if (user) {
        const role = user.user_metadata?.role || "user"
        if (isDev) console.log("✅ Role:", role)

        if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
            if (isDev) console.log("⛔ Access denied: not admin")
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = "/"
            return NextResponse.redirect(redirectUrl)
        }
    }

    return res
}

export const config = {
    matcher: [
        // cek hanya untuk route aplikasi
        "/((?!_next/static|_next/image|favicon.ico|Logo.png|api/public).*)",
    ],
}
