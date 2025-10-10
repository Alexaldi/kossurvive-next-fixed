import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

export async function POST(request, { params }) {
  const { isConfigured, missingMessage } = getDatabaseConfig()
  if (!isConfigured) {
    return errorResponse(missingMessage, 503)
  }

  const { user, response } = await requireUserSession()
  if (!user) {
    return response
  }

  const resourceId = params?.id
  if (!resourceId) {
    return errorResponse("ID kursus tidak ditemukan pada URL.", 400)
  }

  let payload = null
  try {
    payload = await request.json().catch(() => ({}))
  } catch (error) {
    payload = {}
  }

  const watchedInput = payload?.watched
  const watched = typeof watchedInput === "boolean" ? watchedInput : true

  try {
    const resource = await prisma.learningResource.findUnique({ where: { id: resourceId } })
    if (!resource) {
      return errorResponse("Kursus tidak ditemukan.", 404)
    }

    const profile = await ensureProfile(user)

    const progress = await prisma.learningProgress.upsert({
      where: { user_resource_unique: { userId: profile.id, resourceId } },
      update: {
        watched,
      },
      create: {
        userId: profile.id,
        resourceId,
        watched,
      },
    })

    if (watched) {
      await prisma.wellnessEntry.create({
        data: {
          userId: profile.id,
          title: `Belajar: ${resource.title}`,
          description: resource.summary,
        },
      })
    }

    return successResponse("Progress belajar tersimpan.", { progress })
  } catch (error) {
    console.error("Gagal memperbarui progress belajar:", error)
    return errorResponse("Tidak dapat menyimpan progress belajar.", 500)
  }
}
