import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"

export async function POST() {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    const displayName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        null

    try {
        const profile = await prisma.userProfile.upsert({
            where: { supabaseId: user.id },
            update: {
                email: user.email ?? null,
                role: user.user_metadata?.role ?? "user",
                displayName,
            },
            create: {
                supabaseId: user.id,
                email: user.email ?? null,
                role: user.user_metadata?.role ?? "user",
                displayName,
            },
        })

        return successResponse("Profil berhasil disinkronkan.", { profile })
    } catch (error) {
        console.error("❌ Gagal sinkronisasi profil:", error)
        return errorResponse("Tidak dapat menyinkronkan profil pengguna.", 500)
    }
}
