import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

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

    const [courses, progress] = await Promise.all([
      prisma.learningResource.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.learningProgress.findMany({
        where: { userId: profile.id },
        select: { resourceId: true, watched: true },
      }),
    ])

    return successResponse("Daftar modul belajar berhasil dimuat.", {
      courses,
      progress,
    })
  } catch (error) {
    console.error("Gagal memuat kursus:", error)
    return errorResponse("Tidak dapat memuat kursus.", 500)
  }
}
