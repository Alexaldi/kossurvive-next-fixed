import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

async function getTodayMoodLog(profileId) {
  const { start, end } = getTodayRange()

  return prisma.moodLog.findFirst({
    where: {
      userId: profileId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

async function upsertWellnessEntry(profileId, mood, note) {
  const { start, end } = getTodayRange()

  const existingEntry = await prisma.wellnessEntry.findFirst({
    where: {
      userId: profileId,
      occurredAt: {
        gte: start,
        lte: end,
      },
      title: {
        startsWith: "Catatan mood",
      },
    },
    orderBy: { occurredAt: "desc" },
  })

  if (existingEntry) {
    await prisma.wellnessEntry.update({
      where: { id: existingEntry.id },
      data: {
        title: `Catatan mood: ${mood}`,
        description: note,
        mood,
        occurredAt: new Date(),
      },
    })
    return existingEntry.id
  }

  const entry = await prisma.wellnessEntry.create({
    data: {
      userId: profileId,
      title: `Catatan mood: ${mood}`,
      description: note,
      mood,
    },
  })

  return entry.id
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
    const moodLog = await getTodayMoodLog(profile.id)

    if (!moodLog) {
      return successResponse("Belum ada mood yang dicatat hari ini.", { moodLog: null })
    }

    return successResponse("Mood hari ini ditemukan.", { moodLog })
  } catch (error) {
    console.error("Gagal mengambil mood hari ini:", error)
    return errorResponse("Tidak dapat mengambil mood hari ini.")
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

  const mood = typeof payload?.mood === "string" ? payload.mood.trim() : ""
  const note = typeof payload?.note === "string" ? payload.note.trim() : null

  if (!mood) {
    return errorResponse("Mood wajib diisi.", 400)
  }

  try {
    const profile = await ensureProfile(user)

    const existingMood = await getTodayMoodLog(profile.id)

    if (existingMood) {
      const updatedMood = await prisma.moodLog.update({
        where: { id: existingMood.id },
        data: {
          mood,
          note,
        },
      })

      await upsertWellnessEntry(profile.id, mood, note)

      return successResponse("Mood harian diperbarui.", { moodLog: updatedMood })
    }

    const moodLog = await prisma.moodLog.create({
      data: {
        userId: profile.id,
        mood,
        note,
      },
    })

    await upsertWellnessEntry(profile.id, mood, note)

    return successResponse("Mood berhasil dicatat.", { moodLog })
  } catch (error) {
    console.error("Gagal mencatat mood:", error)
    return errorResponse("Tidak dapat menyimpan mood.", 500)
  }
}
