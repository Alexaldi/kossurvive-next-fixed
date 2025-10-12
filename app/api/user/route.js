import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { ensureProfile, profileToClientPayload } from "@/lib/profile"

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
    return successResponse("Profil pengguna berhasil dimuat.", profileToClientPayload(profile))
  } catch (error) {
    console.error("Gagal memuat profil:", error)
    return errorResponse("Tidak dapat memuat profil pengguna.", 500)
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

  let body = null
  try {
    body = await request.json()
  } catch (error) {
    return errorResponse("Body request tidak valid.", 400)
  }

  const prefs = Array.isArray(body?.prefs)
    ? Array.from(
        new Set(
          body.prefs
            .map((pref) => (typeof pref === "string" ? pref.trim() : ""))
            .filter(Boolean)
        )
      )
    : []

  const overrides = {
    email: typeof body?.email === "string" ? body.email.trim() || null : null,
    displayName: typeof body?.name === "string" ? body.name.trim() || null : null,
    preferences: prefs,
  }

  try {
    const profile = await ensureProfile(user, overrides)
    return successResponse("Profil pengguna berhasil diperbarui.", profileToClientPayload(profile))
  } catch (error) {
    console.error("Gagal memperbarui profil:", error)
    return errorResponse("Tidak dapat menyimpan profil pengguna.", 500)
  }
}
