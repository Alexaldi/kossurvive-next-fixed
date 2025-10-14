import * as SupabaseSSR from "@supabase/ssr"
import { cookies as nextCookies } from "next/headers"

import { getPublicSupabaseConfig, warnMissingSupabaseConfig } from "@/lib/env/public"
import { ADMIN_COOKIE_NAME } from "@/lib/supabase/cookies"

const resolveCookieValue = (cookie) => {
  if (!cookie) return undefined
  if (typeof cookie === "string") return cookie
  return cookie.value
}

const instantiateAdminClient = (cookieStore) => {
  const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

  if (!isConfigured) {
    warnMissingSupabaseConfig()
    return null
  }

  const store = cookieStore ?? nextCookies()
  const createServerClient = SupabaseSSR?.createServerClient

  if (typeof createServerClient !== "function") {
    console.warn(
      "Supabase createServerClient tidak ditemukan. Pastikan paket @supabase/ssr kompatibel dengan runtime server.",
    )
    return null
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return resolveCookieValue(store.get(name))
      },
      set(name, value, options) {
        try {
          store.set?.({ name, value, ...options })
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Tidak bisa menyetel cookie Supabase admin di konteks ini:", error?.message)
          }
        }
      },
      remove(name, options) {
        try {
          store.set?.({ name, value: "", ...options })
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Tidak bisa menghapus cookie Supabase admin di konteks ini:", error?.message)
          }
        }
      },
    },
    cookieOptions: {
      name: ADMIN_COOKIE_NAME,
    },
  })
}

export const createAdminClient = () => instantiateAdminClient()
export const createAdminClientFromCookies = (cookieStore) => instantiateAdminClient(cookieStore)

export const requireAdminUser = async (cookieStore) => {
  const supabase = instantiateAdminClient(cookieStore)

  if (!supabase) {
    throw new Error("Supabase belum dikonfigurasi untuk akses admin.")
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || user.user_metadata?.role !== "admin") {
    throw new Error(error?.message || "Sesi admin tidak valid.")
  }

  return { supabase, user }
}
