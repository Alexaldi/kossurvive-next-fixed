import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { requireAdminUser } from "@/lib/supabase/server-admin"

import { configFor, parseResource, uploadImageToSupabase } from "../_helpers"

export const runtime = "nodejs"

export async function PUT(request) {
  try {
    await requireAdminUser(cookies())

    const formData = await request.formData()
    const resource = parseResource(formData.get("resource"))
    const raw = formData.get("data")
    const payload = raw ? JSON.parse(raw) : {}
    const file = formData.get("image")
    const config = configFor(resource)

    const id = payload.id?.trim?.()

    if (!id) {
      throw new Error("ID data wajib diisi untuk pembaruan.")
    }

    const data = config.mapPayload(payload, { isUpdate: true })

    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const imagePath = await uploadImageToSupabase(file)
      if (imagePath) {
        data.image = imagePath
      }
    } else if (Object.prototype.hasOwnProperty.call(payload, "image")) {
      data.image = payload.image
    }

    const updated = await config.model.update({ where: { id }, data })

    return NextResponse.json({ record: config.serialize(updated) })
  } catch (error) {
    console.error("Admin update error:", error)
    return NextResponse.json({ error: error.message || "Gagal memperbarui data." }, { status: 400 })
  }
}
