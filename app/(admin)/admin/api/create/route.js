import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { requireAdminUser } from "@/lib/supabase/server-admin"

import { configFor, parseResource, uploadImageToSupabase } from "../_helpers"

export const runtime = "nodejs"

export async function POST(request) {
  try {
    await requireAdminUser(cookies())

    const formData = await request.formData()
    const resource = parseResource(formData.get("resource"))
    const raw = formData.get("data")
    const payload = raw ? JSON.parse(raw) : {}
    const file = formData.get("image")
    const config = configFor(resource)

    const data = { ...config.mapPayload(payload), id: payload.id?.trim?.() || randomUUID() }

    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const imagePath = await uploadImageToSupabase(file)
      if (imagePath) {
        data.image = imagePath
      }
    } else if (payload.image) {
      data.image = payload.image
    }

    const created = await config.model.create({ data })

    return NextResponse.json({ record: config.serialize(created) })
  } catch (error) {
    console.error("Admin create error:", error)
    return NextResponse.json({ error: error.message || "Gagal membuat data." }, { status: 400 })
  }
}
