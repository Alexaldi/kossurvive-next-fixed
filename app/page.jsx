import AuthenticatedHome from "@/components/home/AuthenticatedHome"
import LandingPage from "@/components/home/LandingPage"
import { createClient, getSupabaseServerConfig } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function Home() {
  const supabase = createClient()

  if (!supabase) {
    console.warn(getSupabaseServerConfig().missingMessage)
    return <LandingPage />
  }

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
      return <LandingPage />
    }

    return <AuthenticatedHome />
  } catch (error) {
    console.error("Supabase session check failed:", error)
    return <LandingPage />
  }
}
