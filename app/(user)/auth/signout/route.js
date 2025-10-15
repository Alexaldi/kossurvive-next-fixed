import { NextResponse } from "next/server"

import { applyPendingCookies, createUserRouteClient } from "@/lib/supabase/route-client"

export async function POST() {
    const { supabase, pendingCookies, error, missingMessage } = createUserRouteClient()

    if (!supabase) {
        const message = missingMessage ?? error?.message ?? "Supabase belum dikonfigurasi."
        return NextResponse.json({ success: false, message }, { status: 503 })
    }

    const { error: signOutError } = await supabase.auth.signOut()

    if (signOutError) {
        console.error("Supabase sign-out gagal:", signOutError)
    }

    const response = NextResponse.json({ success: !signOutError })

    return applyPendingCookies(response, pendingCookies)
}
