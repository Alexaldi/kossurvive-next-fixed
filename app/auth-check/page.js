import { createClient, getSupabaseServerConfig } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AuthCheckPage() {
    const supabase = createClient()

    if (!supabase) {
        return (
            <pre>
                {JSON.stringify(
                    { user: null, error: getSupabaseServerConfig().missingMessage },
                    null,
                    2
                )}
            </pre>
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
