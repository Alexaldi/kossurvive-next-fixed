import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

const parseDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

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
    const profile = await ensureProfile(user)
    const activities = await prisma.activity.findMany({
      where: { userId: profile.id },
      orderBy: { date: "desc" },
    })

    return successResponse("Aktivitas berhasil dimuat.", { activities })
  } catch (error) {
    console.error("Gagal memuat aktivitas:", error)
    return errorResponse("Tidak dapat memuat aktivitas.", 500)
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

  const dateString = typeof payload?.date === "string" ? payload.date : ""
  const workout = typeof payload?.workout === "string" ? payload.workout.trim() : ""
  const date = parseDate(dateString)

  if (!date) {
    return errorResponse("Tanggal aktivitas tidak valid.", 400)
  }

  if (!workout) {
    return errorResponse("Nama aktivitas wajib diisi.", 400)
  }

  try {
    const profile = await ensureProfile(user)

    const activity = await prisma.activity.create({
      data: {
        userId: profile.id,
        date,
        workout,
      },
    })

    await prisma.wellnessEntry.create({
      data: {
        userId: profile.id,
        title: `Aktivitas: ${workout}`,
        occurredAt: date,
      },
    })

    return successResponse("Aktivitas berhasil disimpan.", { activity }, 201)
  } catch (error) {
    console.error("Gagal membuat aktivitas:", error)
    return errorResponse("Tidak dapat menyimpan aktivitas.", 500)
  }
}

export async function DELETE(request) {
  const { isConfigured, missingMessage } = getDatabaseConfig()
  if (!isConfigured) {
    return errorResponse(missingMessage, 503)
  }

  const { user, response } = await requireUserSession()
  if (!user) {
    return response
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  try {
    const profile = await ensureProfile(user)

    if (id) {
      await prisma.activity.deleteMany({
        where: {
          id,
          userId: profile.id,
        },
      })
    } else {
      await prisma.activity.deleteMany({ where: { userId: profile.id } })
    }

    return successResponse("Aktivitas berhasil dihapus.")
  } catch (error) {
    console.error("Gagal menghapus aktivitas:", error)
    return errorResponse("Tidak dapat menghapus aktivitas.", 500)
  }
}
