"use client"

import { useMemo, useState } from "react"

import { createClient, getSupabaseClientConfig } from "@/lib/supabase/client"

export default function LogoutButton({ className = "" }) {
    const supabase = useMemo(() => createClient(), [])
    const { missingMessage } = getSupabaseClientConfig()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleLogout = async () => {
        if (!supabase) {
            console.warn(`Logout dibatalkan: ${missingMessage}`)
            return
        }

        setIsProcessing(true)
        const { error } = await supabase.auth.signOut()
        setIsProcessing(false)

        if (error) {
            console.error("Logout error:", error.message)
            return
        }

        window.location.href = "/login"
    }

    return (
        <button
            onClick={handleLogout}
            disabled={!supabase || isProcessing}
            className={`px-3 py-1 rounded bg-red-600 text-white transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-red-700 ${className}`}
            title={!supabase ? missingMessage : undefined}
        >
            {isProcessing ? "Memproses..." : "Logout"}
        </button>
    )
}
