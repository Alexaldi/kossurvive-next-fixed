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
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // update role di metadata supabase
    if (!user.user_metadata?.role) {
        await supabase.auth.updateUser({ data: { role: "user" } })
    }

    // sync ke prisma
    await prisma.userProfile.upsert({
        where: { supabaseId: user.id },
        update: { email: user.email, role: "user" },
        create: { supabaseId: user.id, email: user.email, role: "user" },
    })

    return NextResponse.json({ message: "Synced", user })
}
