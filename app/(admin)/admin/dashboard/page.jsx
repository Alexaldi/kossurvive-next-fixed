import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import DashboardShell from "../components/DashboardShell"
import { listRecords } from "../api/_helpers"
import { requireAdminUser } from "@/lib/supabase/server-admin"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  try {
    await requireAdminUser(cookies())
  } catch (error) {
    if (process.env.NODE_ENV === "development" && error?.message) {
      console.warn("Admin dashboard guard:", error.message)
    }
    redirect("/admin/login")
  }

  const records = await listRecords()

  return <DashboardShell initialData={records} />
}
