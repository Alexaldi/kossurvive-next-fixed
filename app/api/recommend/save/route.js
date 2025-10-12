import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { buildRecommendation, ensureProfile } from "../helpers"

async function parseRecipeId(request) {
  let payload = null
  try {
    payload = await request.json()
  } catch (error) {
    return { recipeId: null, error: errorResponse("Body request tidak valid.", 400) }
  }

  const recipeId = typeof payload?.recipeId === "string" ? payload.recipeId : null
  if (!recipeId) {
    return { recipeId: null, error: errorResponse("ID resep wajib diisi.", 400) }
  }

  return { recipeId, error: null }
}

async function ensureRecipe(recipeId) {
  return prisma.recipe.findUnique({ where: { id: recipeId } })
}

async function loadInteraction(profileId, recipeId) {
  return prisma.recipeInteraction.findUnique({
    where: { user_recipe_unique: { userId: profileId, recipeId } },
  })
}

async function refreshRecommendation(profile) {
  return buildRecommendation(profile)
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

  const { recipeId, error } = await parseRecipeId(request)
  if (error) {
    return error
  }

  try {
    const recipe = await ensureRecipe(recipeId)
    if (!recipe) {
      return errorResponse("Resep tidak ditemukan.", 404)
    }

    const profile = await ensureProfile(user)

    const existing = await loadInteraction(profile.id, recipeId)

    if (existing?.saved) {
      const recommendation = await refreshRecommendation(profile)
      return successResponse("Resep sudah tersimpan.", recommendation)
    }

    if (existing) {
      await prisma.recipeInteraction.update({
        where: { user_recipe_unique: { userId: profile.id, recipeId } },
        data: {
          saved: true,
          lastInteracted: new Date(),
        },
      })
    } else {
      await prisma.recipeInteraction.create({
        data: {
          userId: profile.id,
          recipeId,
          saved: true,
        },
      })
    }

    const recommendation = await refreshRecommendation(profile)
    return successResponse("Resep disimpan.", recommendation)
  } catch (error) {
    console.error("Gagal memproses simpan resep:", error)
    return errorResponse("Tidak dapat menyimpan interaksi resep.", 500)
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

  const { recipeId, error } = await parseRecipeId(request)
  if (error) {
    return error
  }

  try {
    const recipe = await ensureRecipe(recipeId)
    if (!recipe) {
      return errorResponse("Resep tidak ditemukan.", 404)
    }

    const profile = await ensureProfile(user)
    const existing = await loadInteraction(profile.id, recipeId)

    if (!existing?.saved) {
      const recommendation = await refreshRecommendation(profile)
      return successResponse("Resep tidak ada dalam simpanan.", recommendation)
    }

    await prisma.recipeInteraction.update({
      where: { user_recipe_unique: { userId: profile.id, recipeId } },
      data: {
        saved: false,
        lastInteracted: new Date(),
      },
    })

    const recommendation = await refreshRecommendation(profile)
    return successResponse("Simpanan dihapus.", recommendation)
  } catch (error) {
    console.error("Gagal menghapus simpanan resep:", error)
    return errorResponse("Tidak dapat menghapus simpanan resep.", 500)
  }
}
