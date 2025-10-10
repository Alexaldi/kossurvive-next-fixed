import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

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

    const moodLog = await prisma.moodLog.create({
      data: {
        userId: profile.id,
        mood,
        note,
      },
    })

    await prisma.wellnessEntry.create({
      data: {
        userId: profile.id,
        title: `Catatan mood: ${mood}`,
        description: note,
        mood,
      },
    })

    return successResponse("Mood berhasil dicatat.", { moodLog })
  } catch (error) {
    console.error("Gagal mencatat mood:", error)
    return errorResponse("Tidak dapat menyimpan mood.", 500)
  }
}
