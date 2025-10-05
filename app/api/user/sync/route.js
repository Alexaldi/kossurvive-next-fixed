import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST() {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => cookies().getAll(),
                setAll: (arr) =>
                    arr.forEach(({ name, value, options }) =>
                        cookies().set(name, value, options)
                    ),
            },
        }
    )

    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error || !user) {
        console.error("❌ Supabase getUser error:", error)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // kalau user belum ada role di metadata → isi "user"
    if (!user.user_metadata?.role) {
        await supabase.auth.updateUser({ data: { role: "user" } })
    }

    const displayName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.display_name ??
        null

    // upsert ke Prisma
    await prisma.userProfile.upsert({
        where: { supabaseId: user.id },
        update: {
            email: user.email ?? null,
            role: "user",
            displayName,
        },
        create: {
            supabaseId: user.id,
            email: user.email ?? null,
            role: "user",
            displayName,
        },
    })

    console.log("✅ Synced user:", user.email)
    return NextResponse.json({ message: "OK" })
}
