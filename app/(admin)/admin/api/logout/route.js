import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { createAdminClientFromCookies } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

export async function POST() {
  const cookieStore = cookies()
  const supabase = createAdminClientFromCookies(cookieStore)

  if (!supabase) {
    return NextResponse.json({ success: true })
  }

  await supabase.auth.signOut()

  return NextResponse.json({ success: true })
}
