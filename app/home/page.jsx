import AuthenticatedHome from "@/components/home/AuthenticatedHome"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  let supabase

  try {
    supabase = createClient()
  } catch (error) {
    console.error("Supabase client init failed:", error)
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
