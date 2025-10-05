import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET(request) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => cookies().getAll(),
                setAll: (arr) => arr.forEach(({ name, value }) => cookies().set(name, value)),
            },
        }
    )

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
    return NextResponse.redirect(new URL("/", request.url))
}
