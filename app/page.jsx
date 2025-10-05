import AuthenticatedHome from "@/components/home/AuthenticatedHome"
import LandingPage from "@/components/home/LandingPage"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  let supabase

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Supabase client init failed:", error)
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
