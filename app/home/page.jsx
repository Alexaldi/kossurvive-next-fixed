import AuthenticatedHome from "@/components/home/AuthenticatedHome"
import { createClient, getSupabaseServerConfig } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const supabase = createClient()

  if (!supabase) {
    console.warn(getSupabaseServerConfig().missingMessage)
    redirect("/")
  }

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      redirect("/")
    }

    return <AuthenticatedHome />
  } catch (error) {
    console.error("Supabase session check failed:", error)
    redirect("/")
  }
}
