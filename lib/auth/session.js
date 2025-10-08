import { cookies } from "next/headers"

import { createClientFromCookies, getSupabaseServerConfig } from "@/lib/supabase/server"
import { errorResponse } from "@/lib/api/response"

export const requireUserSession = async () => {
    const cookieStore = cookies()
    const supabase = createClientFromCookies(cookieStore)

    if (!supabase) {
        const { missingMessage } = getSupabaseServerConfig()
        return { user: null, response: errorResponse(missingMessage, 503) }
    }

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        const message = error?.message ?? "Sesi tidak valid. Silakan login ulang."
        return { user: null, response: errorResponse(message, 401) }
    }

    return { user, supabase }
}
