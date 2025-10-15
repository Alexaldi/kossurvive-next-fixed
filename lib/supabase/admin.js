import { createClient } from "@supabase/supabase-js"

import { getPublicSupabaseConfig } from "@/lib/env/public"
import { getSupabaseServiceRoleConfig } from "@/lib/env/server"

let adminClient = null

export const getAdminSupabaseClient = () => {
  if (adminClient) {
    return adminClient
  }

  const { url, isConfigured } = getPublicSupabaseConfig()
  const { serviceRoleKey, isConfigured: hasServiceKey, missingMessage } = getSupabaseServiceRoleConfig()

  if (!isConfigured || !hasServiceKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(missingMessage)
    }
    return null
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return adminClient
}
