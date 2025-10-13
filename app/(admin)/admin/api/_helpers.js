import { randomUUID } from "crypto"

import prisma from "@/lib/prisma"
import { getAdminSupabaseClient } from "@/lib/supabase/admin"

const DEFAULT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "public"

const RESOURCE_CONFIG = {
  recipe: {
    model: prisma.recipe,
    hasImage: true,
    mapPayload(input) {
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

export const listResource = async (resource) => {
  const config = configFor(resource)
  const records = await config.model.findMany({ orderBy: { updatedAt: "desc" } })
  return records.map(config.serialize)
}

export const extractPayload = async (request) => {
  const contentType = request.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    const payload = await request.json()
    return { payload, file: null }
  }

  const formData = await request.formData()
  const raw = formData.get("data")
  const payload = raw ? JSON.parse(raw) : {}
  const file = formData.get("image")
  return {
    payload,
    file: file && typeof file === "object" && "arrayBuffer" in file ? file : null,
  }
}

export const uploadImageToSupabase = async (file) => {
  if (!file) return null

  const supabase = getAdminSupabaseClient()

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

export const createRecord = async (resource, payload, file) => {
  const config = configFor(resource)
  const data = { ...config.mapPayload(payload), id: payload.id?.trim?.() || randomUUID() }

  if (config.hasImage) {
    if (file) {
      const imagePath = await uploadImageToSupabase(file)
      if (imagePath) data.image = imagePath
    } else if (payload.image) {
      data.image = payload.image
    }
  }

  const created = await config.model.create({ data })
  return config.serialize(created)
}

export const updateRecord = async (resource, payload, file) => {
  const config = configFor(resource)
  const id = String(payload.id ?? "").trim()

  if (!id) {
    throw new Error("ID tidak ditemukan untuk pembaruan.")
  }

  const data = { ...config.mapPayload(payload) }

  if (config.hasImage) {
    if (file) {
      const imagePath = await uploadImageToSupabase(file)
      if (imagePath) {
        data.image = imagePath
      }
    } else if (payload.image) {
      data.image = payload.image
    }
  }

  const updated = await config.model.update({ where: { id }, data })
  return config.serialize(updated)
}

export const deleteRecord = async (resource, id) => {
  const config = configFor(resource)
  const recordId = String(id ?? "").trim()

  if (!recordId) {
    throw new Error("ID tidak ditemukan untuk penghapusan.")
  }

  await config.model.delete({ where: { id: recordId } })
  return { success: true }
}
