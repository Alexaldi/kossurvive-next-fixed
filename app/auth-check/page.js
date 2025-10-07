import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AuthCheckPage() {
    let supabase

    try {
        supabase = createClient()
    } catch (error) {
        console.error("Supabase client init failed:", error)
        return (
            <pre>{JSON.stringify({ user: null, error: error.message }, null, 2)}</pre>
        )
    }

    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser()

        return <pre>{JSON.stringify({ user, error }, null, 2)}</pre>
    } catch (error) {
        console.error("Supabase session check failed:", error)
        return (
            <pre>{JSON.stringify({ user: null, error: error.message }, null, 2)}</pre>
        )
    }
}
