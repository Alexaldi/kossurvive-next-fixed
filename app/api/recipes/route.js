import prisma from "@/lib/prisma"
import { successResponse, errorResponse } from "@/lib/api/response"
import { getDatabaseConfig } from "@/lib/env/server"

export async function GET(request) {
  const { isConfigured, missingMessage } = getDatabaseConfig()
  if (!isConfigured) {
    return errorResponse(missingMessage, 503)
  }

  const { searchParams } = new URL(request.url)
  const categoryParam = searchParams.get("category")
  const category = typeof categoryParam === "string" ? categoryParam.trim() : ""

  try {
    const recipes = await prisma.recipe.findMany({
      where: category
        ? {
            categories: {
              has: category,
            },
          }
        : undefined,
      orderBy: { createdAt: "asc" },
    })

    return successResponse("Daftar resep berhasil dimuat.", { recipes })
  } catch (error) {
    console.error("Gagal mengambil daftar resep:", error)
    return errorResponse("Tidak dapat memuat daftar resep.", 500)
  }
}
