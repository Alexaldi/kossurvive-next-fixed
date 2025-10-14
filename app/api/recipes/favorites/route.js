import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile } from "@/lib/profile"

function serializeRecipe(interaction) {
  if (!interaction?.recipe) return null

  return {
    id: interaction.recipe.id,
    name: interaction.recipe.name,
    categories: interaction.recipe.categories,
    estCost: interaction.recipe.estCost,
    image: interaction.recipe.image,
    nutrients: interaction.recipe.nutrients,
    ingredients: interaction.recipe.ingredients,
    howto: interaction.recipe.howto,
    liked: interaction.liked,
    saved: interaction.saved,
    lastInteracted: interaction.lastInteracted,
  }
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
    const interactions = await prisma.recipeInteraction.findMany({
      where: {
        userId: profile.id,
        OR: [{ liked: true }, { saved: true }],
      },
      include: {
        recipe: true,
      },
      orderBy: { lastInteracted: "desc" },
    })

    const liked = []
    const saved = []

    for (const interaction of interactions) {
      const payload = serializeRecipe(interaction)
      if (!payload) continue
      if (interaction.liked) {
        liked.push(payload)
      }
      if (interaction.saved) {
        saved.push(payload)
      }
    }

    const dedupe = (collection) => {
      const map = new Map()
      for (const item of collection) {
        if (!map.has(item.id)) {
          map.set(item.id, item)
        }
      }
      return Array.from(map.values())
    }

    return successResponse("Favorit resep berhasil dimuat.", {
      liked: dedupe(liked),
      saved: dedupe(saved),
    })
  } catch (error) {
    console.error("Gagal memuat koleksi resep:", error)
    return errorResponse("Tidak dapat memuat koleksi resep pengguna.", 500)
  }
}
