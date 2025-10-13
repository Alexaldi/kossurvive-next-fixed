import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"

let browserClient = null

export const createClient = () => {
    if (browserClient) {
        return browserClient
    }

    const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

    if (!isConfigured) {
        warnMissingSupabaseConfig()
        return null
    }

    try {
        browserClient = createSupabaseClient(url, anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        })
    } catch (error) {
        console.error("Gagal menginisialisasi Supabase client:", error)
        browserClient = null
    }

    return browserClient
}

export const getSupabaseClientConfig = getPublicSupabaseConfig
