// app/auth/callback/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as SupabaseSSR from "@supabase/ssr"

import { getSupabaseServerConfig } from "@/lib/supabase/server"
import { USER_COOKIE_NAME } from "@/lib/supabase/cookies"

export async function GET(req) {
    const requestUrl = new URL(req.url)
    const code = requestUrl.searchParams.get("code")
    const nextParam = requestUrl.searchParams.get("next") ?? "/home"

    const nextPath = nextParam.startsWith("/") ? nextParam : "/home"

    const { url, anonKey, isConfigured, missingMessage } = getSupabaseServerConfig()

    if (!isConfigured) {
        console.warn(missingMessage)
        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("error", "config")
        return NextResponse.redirect(redirectUrl)
    }

    const createServerClient = SupabaseSSR?.createServerClient

    if (typeof createServerClient !== "function") {
        return NextResponse.redirect(new URL("/login", requestUrl.origin))
    }

    const cookieStore = cookies()
    const pendingCookies = []

    const supabase = createServerClient(url, anonKey, {
        cookies: {
            get(name) {
                return cookieStore.get(name)?.value
            },
            set(name, value, options) {
                pendingCookies.push({ name, value, options })
            },
            remove(name, options) {
                pendingCookies.push({ name, value: "", options: { ...options, maxAge: 0 } })
            },
        },
        cookieOptions: {
            name: USER_COOKIE_NAME,
        },
    })

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
            console.error("Failed to exchange OAuth code", exchangeError)
            return buildRedirectResponse(requestUrl, "/login?error=oauth", pendingCookies)
        }
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (!user || userError) {
        return buildRedirectResponse(requestUrl, "/login", pendingCookies)
    }

    const cookiePairs = cookieStore
        .getAll()
        .map(({ name, value }) => `${name}=${value}`)

    for (const { name, value } of pendingCookies) {
        if (value) {
            cookiePairs.push(`${name}=${value}`)
        }
    }

    try {
        const syncResponse = await fetch(new URL("/api/user/sync", requestUrl.origin), {
            method: "POST",
            headers: cookiePairs.length ? { cookie: cookiePairs.join("; ") } : undefined,
        })

        if (!syncResponse.ok) {
            const message = await syncResponse.text()
            console.error("Failed to sync user profile", message)
        }
    } catch (error) {
        console.error("Error syncing user profile", error)
    }

    return buildRedirectResponse(requestUrl, nextPath, pendingCookies)
}

function buildRedirectResponse(requestUrl, path, pendingCookies) {
    const target = path.startsWith("/") ? path : "/home"
    const response = NextResponse.redirect(new URL(target, requestUrl.origin))

    for (const { name, value, options } of pendingCookies) {
        response.cookies.set({ name, value, ...options })
    }

    return response
}
