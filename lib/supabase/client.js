import { createBrowserClient } from "@supabase/ssr"

const missingConfigError = () =>
    new Error(
        "Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY terisi."
    )

export const createClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        throw missingConfigError()
    }

    return createBrowserClient(url, anonKey)
}
