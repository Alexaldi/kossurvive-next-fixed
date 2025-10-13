import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { createAdminClientFromCookies } from "@/lib/supabase/server-admin"

export async function DELETE() {
  const cookieStore = cookies()
  const supabase = createAdminClientFromCookies(cookieStore)

  if (!supabase) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi." }, { status: 400 })
  }

  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
