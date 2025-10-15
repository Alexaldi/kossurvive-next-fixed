import * as SupabaseSSR from "@supabase/ssr"
import { cookies } from "next/headers"

import { getPublicSupabaseConfig } from "@/lib/env/public"
import { USER_COOKIE_NAME } from "@/lib/supabase/cookies"

export const createUserRouteClient = () => {
    const { url, anonKey, isConfigured, missingMessage } = getPublicSupabaseConfig()

    if (!isConfigured) {
        return {
            supabase: null,
            pendingCookies: [],
            cookieStore: null,
            error: new Error(missingMessage),
            missingMessage,
        }
    }

    const createServerClient = SupabaseSSR?.createServerClient

    if (typeof createServerClient !== "function") {
        return {
            supabase: null,
            pendingCookies: [],
            cookieStore: null,
            error: new Error(
                "Supabase SSR client tidak tersedia. Pastikan paket @supabase/ssr kompatibel dengan runtime."
            ),
            missingMessage: null,
        }
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

    return { supabase, pendingCookies, cookieStore, error: null, missingMessage: null }
}

export const applyPendingCookies = (response, pendingCookies) => {
    for (const { name, value, options } of pendingCookies) {
        response.cookies.set({ name, value, ...options })
    }

    return response
}

export const buildCookieHeader = (cookieStore, pendingCookies) => {
    if (!cookieStore) {
        return {}
    }

    const pairs = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`)

    for (const { name, value } of pendingCookies) {
        if (value) {
            pairs.push(`${name}=${value}`)
        }
    }

    return pairs.length ? { cookie: pairs.join("; ") } : {}
}
