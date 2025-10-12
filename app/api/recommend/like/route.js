import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { buildRecommendation, ensureProfile } from "../helpers"

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

  const recipeId = typeof payload?.recipeId === "string" ? payload.recipeId : null
  if (!recipeId) {
    return errorResponse("ID resep wajib diisi.", 400)
  }

  try {
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
    if (!recipe) {
      return errorResponse("Resep tidak ditemukan.", 404)
    }

    const profile = await ensureProfile(user)

    const existing = await prisma.recipeInteraction.findUnique({
      where: { user_recipe_unique: { userId: profile.id, recipeId } },
    })

    const nextLiked = existing ? !existing.liked : true

    await prisma.recipeInteraction.upsert({
      where: { user_recipe_unique: { userId: profile.id, recipeId } },
      update: {
        liked: nextLiked,
        lastInteracted: new Date(),
      },
      create: {
        userId: profile.id,
        recipeId,
        liked: true,
      },
    })

    const recommendation = await buildRecommendation(profile)
    const message = nextLiked ? "Resep disukai." : "Suka dihapus."
    return successResponse(message, recommendation)
  } catch (error) {
    console.error("Gagal memproses like resep:", error)
    return errorResponse("Tidak dapat menyimpan interaksi resep.", 500)
  }
}
