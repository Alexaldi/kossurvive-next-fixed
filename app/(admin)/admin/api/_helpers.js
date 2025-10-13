import { randomUUID } from "crypto"

import prisma from "@/lib/prisma"
import { getServiceRoleClient } from "@/lib/supabase/service"

const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "public"

const RESOURCE_CONFIG = {
  recipe: {
    model: prisma.recipe,
    mapPayload(input, { isUpdate = false } = {}) {
      const base = {
        name: input.name?.trim() ?? "",
        estCost: Number.parseInt(input.estCost ?? "0", 10) || 0,
        categories: Array.isArray(input.categories)
          ? input.categories
          : String(input.categories ?? "")
              .split(/[\n,]+/)
              .map((value) => value.trim())
              .filter(Boolean),
        nutrients: (() => {
          const raw = input.nutrients
          if (!raw) return {}
          if (typeof raw === "object") return raw
          try {
            return JSON.parse(raw)
          } catch (error) {
            return {}
          }
        })(),
        ingredients: Array.isArray(input.ingredients)
          ? input.ingredients
          : String(input.ingredients ?? "")
              .split(/\r?\n|,/)
              .map((value) => value.trim())
              .filter(Boolean),
        howto: input.howto?.trim() ?? "",
      }

      if (!base.name) {
        throw new Error("Nama resep wajib diisi.")
      }

      if (!base.howto) {
        throw new Error("Langkah memasak wajib diisi.")
      }

      if (!base.ingredients.length) {
        throw new Error("Minimal satu bahan diperlukan.")
      }

      return base
    },
    serialize(record) {
      return {
        id: record.id,
        name: record.name,
        estCost: record.estCost,
        categories: record.categories,
        image: record.image ?? "",
        howto: record.howto,
        ingredients: record.ingredients,
        nutrients: record.nutrients,
        updatedAt: record.updatedAt,
      }
    },
  },
  workout: {
    model: prisma.workout,
    mapPayload(input) {
      const name = input.name?.trim()
      const moves = Array.isArray(input.moves)
        ? input.moves
        : String(input.moves ?? "")
            .split(/\r?\n|,/)
            .map((value) => value.trim())
            .filter(Boolean)

      if (!name) {
        throw new Error("Nama workout wajib diisi.")
      }

      if (!moves.length) {
        throw new Error("Minimal satu gerakan diperlukan.")
      }

      return { name, moves }
    },
    serialize(record) {
      return {
        id: record.id,
        name: record.name,
        moves: record.moves,
        updatedAt: record.updatedAt,
      }
    },
  },
  learningResource: {
    model: prisma.learningResource,
    mapPayload(input) {
      const title = input.title?.trim()
      const category = input.category?.trim() ?? "General"
      const type = input.type?.trim() ?? "video"
      const summary = input.summary?.trim() ?? ""
      const link = input.link?.trim() ?? ""

      if (!title) {
        throw new Error("Judul materi wajib diisi.")
      }

      if (!link) {
        throw new Error("Tautan materi wajib diisi.")
      }

      return { title, category, type, summary, link }
    },
    serialize(record) {
      return {
        id: record.id,
        title: record.title,
        category: record.category,
        type: record.type,
        summary: record.summary,
        link: record.link,
        updatedAt: record.updatedAt,
      }
    },
  },
}

export const parseResource = (value) => {
  const raw = String(value ?? "").trim()
  const alias = raw.toLowerCase()
  const resource =
    alias === "recipes"
      ? "recipe"
      : alias === "workouts"
        ? "workout"
        : alias === "learningresources" || alias === "learning_resource"
          ? "learningResource"
          : raw

  if (!resource || !RESOURCE_CONFIG[resource]) {
    throw new Error("Resource tidak dikenal.")
  }

  return resource
}

export const uploadImageToSupabase = async (file) => {
  if (!file) return null

  const supabase = getServiceRoleClient()

  if (!supabase) {
    throw new Error("Service role Supabase belum dikonfigurasi.")
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const extension = file.name?.split?.(".").pop() || "jpg"
  const path = `admin/${randomUUID()}.${extension}`
  const bucket = DEFAULT_BUCKET

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  })

  if (error) {
    throw error
  }

  return `${bucket}::${path}`
}

export const configFor = (resource) => RESOURCE_CONFIG[resource]

export const listRecords = async () => {
  const [recipes, workouts, learningResources] = await Promise.all([
    prisma.recipe.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.workout.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.learningResource.findMany({ orderBy: { updatedAt: "desc" } }),
  ])

  return {
    recipes: recipes.map(RESOURCE_CONFIG.recipe.serialize),
    workouts: workouts.map(RESOURCE_CONFIG.workout.serialize),
    learningResources: learningResources.map(RESOURCE_CONFIG.learningResource.serialize),
  }
}

