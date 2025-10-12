import { successResponse, errorResponse } from "@/lib/api/response"
import { requireUserSession } from "@/lib/auth/session"
import { getDatabaseConfig } from "@/lib/env/server"
import { buildRecommendation, ensureProfile } from "./helpers"

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
    const recommendation = await buildRecommendation(profile)
    return successResponse("Rekomendasi berhasil dihitung.", recommendation)
  } catch (error) {
    console.error("Gagal menghitung rekomendasi:", error)
    return errorResponse("Tidak dapat memuat rekomendasi.", 500)
  }
}
