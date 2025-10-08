import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"

export const dynamic = "force-dynamic"

export async function GET(request) {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined

    if (Number.isNaN(limit)) {
        return errorResponse("Parameter limit harus berupa angka.", 400)
    }

    try {
        const profile = await prisma.userProfile.findUnique({
            where: { supabaseId: user.id },
        })

        if (!profile) {
            return successResponse("Belum ada data untuk pengguna ini.", { entries: [] })
        }

        const entries = await prisma.wellnessEntry.findMany({
            where: { userId: profile.id },
            orderBy: { occurredAt: "desc" },
            take: limit && limit > 0 ? limit : undefined,
        })

        return successResponse("Daftar aktivitas berhasil dimuat.", { entries })
    } catch (error) {
        console.error("Gagal mengambil wellness entry:", error)
        return errorResponse("Tidak dapat memuat data aktivitas.", 500)
    }
}

export async function POST(request) {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    let payload = null

    try {
        payload = await request.json()
    } catch (error) {
        return errorResponse("Body request tidak valid.", 400)
    }

    const title = typeof payload?.title === "string" ? payload.title.trim() : ""
    const description =
        typeof payload?.description === "string" ? payload.description.trim() : null
    const mood = typeof payload?.mood === "string" ? payload.mood.trim() : null
    const occurredAtInput = payload?.occurredAt
    const occurredAt = occurredAtInput ? new Date(occurredAtInput) : new Date()

    if (!title) {
        return errorResponse("Judul aktivitas wajib diisi.", 400)
    }

    if (Number.isNaN(occurredAt.getTime())) {
        return errorResponse("Format tanggal tidak valid.", 400)
    }

    try {
        const profile = await prisma.userProfile.upsert({
            where: { supabaseId: user.id },
            update: {
                email: user.email ?? null,
                displayName:
                    user.user_metadata?.full_name ??
                    user.user_metadata?.name ??
                    user.user_metadata?.display_name ??
                    null,
            },
            create: {
                supabaseId: user.id,
                email: user.email ?? null,
                role: user.user_metadata?.role ?? "user",
                displayName:
                    user.user_metadata?.full_name ??
                    user.user_metadata?.name ??
                    user.user_metadata?.display_name ??
                    null,
            },
        })

        const entry = await prisma.wellnessEntry.create({
            data: {
                userId: profile.id,
                title,
                description,
                mood,
                occurredAt,
            },
        })

        return successResponse("Aktivitas berhasil disimpan.", { entry }, 201)
    } catch (error) {
        console.error("Gagal membuat wellness entry:", error)
        return errorResponse("Tidak dapat menyimpan aktivitas baru.", 500)
    }
}
