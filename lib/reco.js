export function defaultScore(categories = []) {
  const score = {}
  for (const category of categories) {
    score[category] = 0
  }
  return score
}

export function bootstrapFromPrefs(prefs = [], categories = []) {
  const base = defaultScore(categories)
  for (const pref of prefs) {
    base[pref] = (base[pref] ?? 0) + 10
  }
  return base
}

export function applyInteraction(score, recipeCategories = [], action = "view") {
  for (const category of recipeCategories) {
    if (!(category in score)) score[category] = 0
    if (action === "like") score[category] += 5
    if (action === "save") score[category] += 4
    if (action === "view") score[category] += 1
  }
  return score
}

export function rankRecipes(score, recipes = []) {
  return [...recipes].sort((a, b) => {
    const scoreA = (a.categories || []).reduce((total, category) => total + (score?.[category] ?? 0), 0)
    const scoreB = (b.categories || []).reduce((total, category) => total + (score?.[category] ?? 0), 0)
    return scoreB - scoreA
  })
}
