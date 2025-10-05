// app/auth/callback/route.js
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(req) {
    const requestUrl = new URL(req.url)
    const code = requestUrl.searchParams.get("code")
    const nextPath = requestUrl.searchParams.get("next") ?? "/"

    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (arr) => {
                    arr.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, options)
                    })
                },
            },
        }
    )

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
            console.error("Failed to exchange OAuth code", exchangeError)
            return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin))
        }
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
        return NextResponse.redirect(new URL("/login", requestUrl.origin))
    }

    const cookieHeader = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ")

    try {
        const syncResponse = await fetch(new URL("/api/user/sync", requestUrl.origin), {
            method: "POST",
            headers: cookieHeader ? { cookie: cookieHeader } : undefined,
        })

        if (!syncResponse.ok) {
            const message = await syncResponse.text()
            console.error("Failed to sync user profile", message)
        }
    } catch (error) {
        console.error("Error syncing user profile", error)
    }

    return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
}
