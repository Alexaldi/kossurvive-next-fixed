import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"

export const dynamic = "force-dynamic"

const findEntryForUser = async (supabaseUserId, entryId) =>
    prisma.wellnessEntry.findFirst({
        where: {
            id: entryId,
            user: {
                supabaseId: supabaseUserId,
            },
        },
    })

export async function GET(_request, { params }) {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    try {
        const entry = await findEntryForUser(user.id, params.id)

        if (!entry) {
            return errorResponse("Aktivitas tidak ditemukan.", 404)
        }

        return successResponse("Detail aktivitas berhasil dimuat.", { entry })
    } catch (error) {
        console.error("Gagal mengambil detail entry:", error)
        return errorResponse("Tidak dapat memuat aktivitas.", 500)
    }
}

export async function PUT(request, { params }) {
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

    const title = typeof payload?.title === "string" ? payload.title.trim() : ""
    const description =
        typeof payload?.description === "string" ? payload.description.trim() : null
    const mood = typeof payload?.mood === "string" ? payload.mood.trim() : null
    const occurredAtInput = payload?.occurredAt
    const occurredAt = occurredAtInput ? new Date(occurredAtInput) : undefined

    if (!title) {
        return errorResponse("Judul aktivitas wajib diisi.", 400)
    }

    if (occurredAt && Number.isNaN(occurredAt.getTime())) {
        return errorResponse("Format tanggal tidak valid.", 400)
    }

    try {
        const existing = await findEntryForUser(user.id, params.id)

        if (!existing) {
            return errorResponse("Aktivitas tidak ditemukan.", 404)
        }

        const entry = await prisma.wellnessEntry.update({
            where: { id: existing.id },
            data: {
                title,
                description,
                mood,
                ...(occurredAt ? { occurredAt } : {}),
            },
        })

        return successResponse("Aktivitas berhasil diperbarui.", { entry })
    } catch (error) {
        console.error("Gagal memperbarui wellness entry:", error)
        return errorResponse("Tidak dapat memperbarui aktivitas.", 500)
    }
}

export async function DELETE(_request, { params }) {
    const { isConfigured, missingMessage } = getDatabaseConfig()
    if (!isConfigured) {
        return errorResponse(missingMessage, 503)
    }

    const { user, response } = await requireUserSession()

    if (!user) {
        return response
    }

    try {
        const existing = await findEntryForUser(user.id, params.id)

        if (!existing) {
            return errorResponse("Aktivitas tidak ditemukan.", 404)
        }

        await prisma.wellnessEntry.delete({ where: { id: existing.id } })

        return successResponse("Aktivitas berhasil dihapus.")
    } catch (error) {
        console.error("Gagal menghapus wellness entry:", error)
        return errorResponse("Tidak dapat menghapus aktivitas.", 500)
    }
}
