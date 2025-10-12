import prisma from "@/lib/prisma"
import { bootstrapFromPrefs, rankRecipes } from "@/lib/reco"
import { ensureProfile as ensureUserProfile } from "@/lib/profile"

export const ensureProfile = ensureUserProfile

export const buildRecommendation = async (profile) => {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      interactions: {
        where: { userId: profile.id },
        take: 1,
      },
    },
  })

  const categoriesSet = new Set()
  for (const recipe of recipes) {
    for (const category of recipe.categories ?? []) {
      categoriesSet.add(category)
    }
  }

  const categories = Array.from(categoriesSet)
  const scoreBase = bootstrapFromPrefs(profile.preferences ?? [], categories)
  const score = { ...scoreBase }

  for (const recipe of recipes) {
    const interaction = recipe.interactions?.[0]
    for (const category of recipe.categories ?? []) {
      if (!(category in score)) {
        score[category] = 0
      }

      if (!interaction) continue

      const delta =
        (interaction.viewCount ?? 0) +
        (interaction.liked ? 5 : 0) +
        (interaction.saved ? 4 : 0)

      if (delta > 0) {
        score[category] += delta
      }
    }
  }

  const sanitizedRecipes = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    estCost: recipe.estCost,
    categories: recipe.categories,
    nutrients: recipe.nutrients,
    ingredients: recipe.ingredients,
    howto: recipe.howto,
    image: recipe.image,
    liked: recipe.interactions?.[0]?.liked ?? false,
    saved: recipe.interactions?.[0]?.saved ?? false,
    viewCount: recipe.interactions?.[0]?.viewCount ?? 0,
  }))

  const ranked = rankRecipes(score, sanitizedRecipes).map((recipe) => ({
    ...recipe,
    preferenceScore: (recipe.categories ?? []).reduce(
      (total, category) => total + (score?.[category] ?? 0),
      0
    ),
  }))

  return { score, categories, recipes: ranked }
}
