import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"

export const dynamic = "force-dynamic"

const resolveDisplayName = (user) =>
    user.user_metadata?.display_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    null

export async function GET() {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    try {
        const profile = await prisma.userProfile.upsert({
            where: { supabaseId: user.id },
            update: {
                email: user.email ?? null,
                displayName: resolveDisplayName(user),
            },
            create: {
                supabaseId: user.id,
                email: user.email ?? null,
                role: user.user_metadata?.role ?? "user",
                displayName: resolveDisplayName(user),
            },
        })

        return successResponse("Profil berhasil dimuat.", { profile })
    } catch (error) {
        console.error("Gagal memuat profil:", error)
        return errorResponse("Tidak dapat memuat profil pengguna.", 500)
    }
}

export async function PUT(request) {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    let payload

    try {
        payload = await request.json()
    } catch (error) {
        return errorResponse("Body request tidak valid.", 400)
    }

    const displayName =
        typeof payload?.displayName === "string" ? payload.displayName.trim() : ""

    if (!displayName) {
        return errorResponse("Display name wajib diisi.", 400)
    }

    try {
        const profile = await prisma.userProfile.upsert({
            where: { supabaseId: user.id },
            update: {
                displayName,
            },
            create: {
                supabaseId: user.id,
                email: user.email ?? null,
                role: user.user_metadata?.role ?? "user",
                displayName,
            },
        })

        return successResponse("Profil berhasil diperbarui.", { profile })
    } catch (error) {
        console.error("Gagal memperbarui profil:", error)
        return errorResponse("Tidak dapat memperbarui profil pengguna.", 500)
    }
}
