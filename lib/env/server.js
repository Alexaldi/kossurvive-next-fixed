const missingDatabaseMessage =
    "Database belum dikonfigurasi. Pastikan DATABASE_URL tersedia di environment."
const missingServiceKeyMessage =
    "Service role Supabase belum dikonfigurasi. Tambahkan SUPABASE_SERVICE_ROLE_KEY bila perlu akses admin."

export const getDatabaseConfig = () => {
    const url = process.env.DATABASE_URL ?? ""
    const directUrl = process.env.DIRECT_URL ?? ""

    return {
        url,
        directUrl,
        isConfigured: Boolean(url),
        missingMessage: missingDatabaseMessage,
    }
}

export const getSupabaseServiceRoleConfig = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

    return {
        serviceRoleKey,
        isConfigured: Boolean(serviceRoleKey),
        missingMessage: missingServiceKeyMessage,
    }
}
