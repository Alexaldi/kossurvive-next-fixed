import { createBrowserClient } from "@supabase/ssr"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"

export const createClient = () => {
    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        return null
    }

    return createBrowserClient(url, anonKey)
}

export const getSupabaseClientConfig = getPublicSupabaseConfig
