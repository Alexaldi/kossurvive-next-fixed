import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

export async function POST() {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    try {
        const profile = await ensureProfile(user)

        return successResponse("Profil berhasil disinkronkan.", { profile })
    } catch (error) {
        console.error("❌ Gagal sinkronisasi profil:", error)
        return errorResponse("Tidak dapat menyinkronkan profil pengguna.", 500)
    }
}
