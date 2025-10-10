import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { getDatabaseConfig } from "@/lib/env/server"

export async function GET() {
  const { isConfigured, missingMessage } = getDatabaseConfig()
  if (!isConfigured) {
    return errorResponse(missingMessage, 503)
  }

  try {
    const workouts = await prisma.workout.findMany({
      orderBy: { createdAt: "asc" },
    })
    return successResponse("Daftar workout berhasil dimuat.", { workouts })
  } catch (error) {
    console.error("Gagal memuat workout:", error)
    return errorResponse("Tidak dapat memuat workout.", 500)
  }
}
