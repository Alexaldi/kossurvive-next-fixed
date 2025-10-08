const missingSupabaseMessage =
    "Supabase belum dikonfigurasi. NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi."

export const getPublicSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
    const runtimeEnv = process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV ?? "development"

    return {
        url,
        anonKey,
        runtimeEnv,
        isConfigured: Boolean(url && anonKey),
        missingMessage: missingSupabaseMessage,
    }
}

export const warnMissingSupabaseConfig = (() => {
    let hasWarned = false
    return () => {
        const { missingMessage, isConfigured } = getPublicSupabaseConfig()
        if (isConfigured || hasWarned) return
        hasWarned = true
        console.warn(`⚠️ ${missingMessage}`)
    }
})()
