import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { requireAdminUser } from "@/lib/supabase/server-admin"
import { createRecord, deleteRecord, extractPayload, listResource, updateRecord } from "../_helpers"

const RESOURCE = "workout"

const handleError = (error, fallbackMessage) => {
  console.error(`Admin ${RESOURCE} error:`, error)
  return NextResponse.json({ error: error.message || fallbackMessage }, { status: 400 })
}

export async function GET() {
  try {
    await requireAdminUser(cookies())
    const records = await listResource(RESOURCE)
    return NextResponse.json({ records })
  } catch (error) {
    return handleError(error, "Gagal mengambil data.")
  }
}

export async function POST(request) {
  try {
    await requireAdminUser(cookies())
    const { payload } = await extractPayload(request)
    const record = await createRecord(RESOURCE, payload)
    return NextResponse.json({ record })
  } catch (error) {
    return handleError(error, "Gagal membuat data.")
  }
}

export async function PUT(request) {
  try {
    await requireAdminUser(cookies())
    const { payload } = await extractPayload(request)
    const record = await updateRecord(RESOURCE, payload)
    return NextResponse.json({ record })
  } catch (error) {
    return handleError(error, "Gagal memperbarui data.")
  }
}

export async function DELETE(request) {
  try {
    await requireAdminUser(cookies())
    const body = await request.json()
    await deleteRecord(RESOURCE, body?.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error, "Gagal menghapus data.")
  }
}
