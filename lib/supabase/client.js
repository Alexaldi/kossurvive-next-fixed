import * as SupabaseSSR from "@supabase/ssr"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"

export const createClient = () => {
    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        return null
    }

    const createBrowserClient = SupabaseSSR?.createBrowserClient

    if (typeof createBrowserClient !== "function") {
        console.warn(
            "Supabase createBrowserClient tidak ditemukan. Pastikan paket @supabase/ssr ter-install dan mendukung runtime browser.",
        )
        return null
    }

    return createBrowserClient(url, anonKey)
}

export const getSupabaseClientConfig = getPublicSupabaseConfig
