import prisma from "@/lib/prisma"

export const resolveDisplayName = (user, fallbackName = null) =>
  fallbackName ??
  user?.user_metadata?.full_name ??
  user?.user_metadata?.name ??
  user?.user_metadata?.display_name ??
  user?.email?.split("@")[0] ??
  null

export const ensureProfile = async (user, overrides = {}) => {
  if (!user) throw new Error("User session tidak ditemukan")

  const displayName = resolveDisplayName(user, overrides.displayName)

  return prisma.userProfile.upsert({
    where: { supabaseId: user.id },
    update: {
      email: overrides.email ?? user.email ?? null,
      role: user.user_metadata?.role ?? "user",
      displayName,
      ...(overrides.preferences ? { preferences: overrides.preferences } : {}),
    },
    create: {
      supabaseId: user.id,
      email: overrides.email ?? user.email ?? null,
      role: user.user_metadata?.role ?? "user",
      displayName,
      preferences: overrides.preferences ?? [],
    },
  })
}

export const profileToClientPayload = (profile) => ({
  id: profile.id,
  name: profile.displayName ?? null,
  email: profile.email ?? null,
  prefs: profile.preferences ?? [],
})
