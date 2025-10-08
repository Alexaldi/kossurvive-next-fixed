import { createServerClient } from "@supabase/ssr"
import { cookies as nextCookies } from "next/headers"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"

const resolveCookieValue = (cookie) => {
    if (!cookie) return undefined
    if (typeof cookie === "string") return cookie
    return cookie.value
}

const instantiateServerClient = (cookieStore) => {
    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        return null
    }

    const store = cookieStore ?? nextCookies()

    return createServerClient(url, anonKey, {
        cookies: {
            get(name) {
                return resolveCookieValue(store.get(name))
            },
            set(name, value, options) {
                try {
                    store.set?.({ name, value, ...options })
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.warn("Tidak bisa menyetel cookie Supabase di konteks ini:", error?.message)
                    }
                }
            },
            remove(name, options) {
                try {
                    store.set?.({ name, value: "", ...options })
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.warn("Tidak bisa menghapus cookie Supabase di konteks ini:", error?.message)
                    }
                }
            },
        },
    })
}

export const createClient = () => instantiateServerClient()
export const createClientFromCookies = (cookieStore) => instantiateServerClient(cookieStore)
export const getSupabaseServerConfig = getPublicSupabaseConfig
