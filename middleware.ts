import { NextResponse, type NextRequest } from "next/server"
import * as SupabaseSSR from "@supabase/ssr"

import {
  getPublicSupabaseConfig,
  warnMissingSupabaseConfig,
} from "@/lib/env/public"
import { ADMIN_COOKIE_NAME, USER_COOKIE_NAME } from "@/lib/supabase/cookies"

const PUBLIC_USER_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/auth/callback",
])
const AUTH_ONLY_PATHS = new Set(["/login", "/register"])

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const { url, anonKey, isConfigured } = getPublicSupabaseConfig()

  if (!isConfigured) {
    warnMissingSupabaseConfig()
    return response
  }

  const createServerClient = SupabaseSSR?.createServerClient

  if (typeof createServerClient !== "function") {
    return response
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin")

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value
      },
      set(name, value, options) {
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        response.cookies.set({ name, value: "", ...options })
      },
    },
    cookieOptions: {
      name: isAdminRoute ? ADMIN_COOKIE_NAME : USER_COOKIE_NAME,
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAdminRoute) {
    if (!user || user.user_metadata?.role !== "admin") {
      if (request.nextUrl.pathname !== "/admin/login") {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = "/admin/login"
        if (
          request.nextUrl.pathname &&
          request.nextUrl.pathname !== "/admin/login"
        ) {
          redirectUrl.searchParams.set("next", request.nextUrl.pathname)
        }
        return NextResponse.redirect(redirectUrl)
      }
      return response
    }

    if (request.nextUrl.pathname === "/admin/login") {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = "/admin/dashboard"
      return NextResponse.redirect(redirectUrl)
    }

    return response
  }

  if (!user && !PUBLIC_USER_PATHS.has(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    if (request.nextUrl.pathname && request.nextUrl.pathname !== "/login") {
      redirectUrl.searchParams.set("next", request.nextUrl.pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  if (
    user &&
    (AUTH_ONLY_PATHS.has(request.nextUrl.pathname) ||
      request.nextUrl.pathname === "/")
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/home"
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/public).*)"],
}
