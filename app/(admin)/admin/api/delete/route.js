import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { requireAdminUser } from "@/lib/supabase/server-admin"

import { configFor, parseResource } from "../_helpers"

export const runtime = "nodejs"

export async function DELETE(request) {
  try {
    await requireAdminUser(cookies())

    const { searchParams } = new URL(request.url)
    const resource = parseResource(searchParams.get("resource"))
    const id = searchParams.get("id")?.trim()

    if (!id) {
      throw new Error("ID data wajib diisi untuk penghapusan.")
    }

    const config = configFor(resource)

    await config.model.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete error:", error)
    return NextResponse.json({ error: error.message || "Gagal menghapus data." }, { status: 400 })
  }
}
