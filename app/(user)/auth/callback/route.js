import { NextResponse } from "next/server"

import { applyPendingCookies, buildCookieHeader, createUserRouteClient } from "@/lib/supabase/route-client"

const WAIT_ON_CLOCK_SKEW_MS = 1200

const sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration))

const sanitizeNextPath = (nextParam) => {
    if (!nextParam || typeof nextParam !== "string") {
        return "/home"
    }

    return nextParam.startsWith("/") ? nextParam : "/home"
}

const buildRedirect = (requestUrl, path, pendingCookies) => {
    const target = path.startsWith("/") ? path : "/home"
    const response = NextResponse.redirect(new URL(target, requestUrl.origin), { status: 303 })

    return applyPendingCookies(response, pendingCookies)
}

const syncUserProfile = async (requestUrl, cookieStore, pendingCookies) => {
    if (!cookieStore) return

    try {
        await fetch(new URL("/api/user/sync", requestUrl.origin), {
            method: "POST",
            headers: buildCookieHeader(cookieStore, pendingCookies),
        })
    } catch (error) {
        console.error("Error syncing user profile", error)
    }
}

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const nextParam = sanitizeNextPath(requestUrl.searchParams.get("next"))

    const { supabase, pendingCookies, cookieStore, error, missingMessage } = createUserRouteClient()

    if (!supabase) {
        if (missingMessage) {
            console.warn(missingMessage)
        } else if (error) {
            console.error(error.message)
        }

        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("error", "auth")
        return NextResponse.redirect(redirectUrl)
    }

    if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
            console.error("Failed to exchange OAuth code", exchangeError)

            if (!exchangeError.message?.includes("issued in the future")) {
                const redirectUrl = new URL("/login", requestUrl.origin)
                redirectUrl.searchParams.set("error", "oauth")
                return applyPendingCookies(NextResponse.redirect(redirectUrl), pendingCookies)
            }

            await sleep(WAIT_ON_CLOCK_SKEW_MS)
        }
    }

    let sessionResult = await supabase.auth.getSession()

    if (!sessionResult.data?.session) {
        await sleep(250)
        sessionResult = await supabase.auth.getSession()
    }

    const session = sessionResult.data?.session

    if (!session) {
        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("error", "session")
        return applyPendingCookies(NextResponse.redirect(redirectUrl), pendingCookies)
    }

    const user = session.user

    if (!user) {
        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("error", "user")
        return applyPendingCookies(NextResponse.redirect(redirectUrl), pendingCookies)
    }

    await syncUserProfile(requestUrl, cookieStore, pendingCookies)

    return buildRedirect(requestUrl, nextParam, pendingCookies)
}

export async function POST(request) {
    const requestUrl = new URL(request.url)
    const nextParam = sanitizeNextPath(requestUrl.searchParams.get("next"))

    const { supabase, pendingCookies, cookieStore, error, missingMessage } = createUserRouteClient()

    if (!supabase) {
        const message = missingMessage ?? error?.message ?? "Supabase belum dikonfigurasi."
        return NextResponse.json({ success: false, message }, { status: 503 })
    }

    let payload

    try {
        payload = await request.json()
    } catch (err) {
        return NextResponse.json({ success: false, message: "Payload tidak valid." }, { status: 400 })
    }

    const accessToken = payload?.access_token
    const refreshToken = payload?.refresh_token

    if (!accessToken || !refreshToken) {
        return NextResponse.json({ success: false, message: "Token sesi tidak lengkap." }, { status: 400 })
    }

    const { data, error: setSessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
    })

    if (setSessionError || !data?.session) {
        const message = setSessionError?.message ?? "Tidak dapat menyimpan sesi Supabase."
        return NextResponse.json({ success: false, message }, { status: 401 })
    }

    await syncUserProfile(requestUrl, cookieStore, pendingCookies)

    const response = NextResponse.json({ success: true, redirectTo: nextParam })

    return applyPendingCookies(response, pendingCookies)
}
