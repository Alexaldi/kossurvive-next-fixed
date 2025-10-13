import { createClient } from "@supabase/supabase-js"

import { getPublicSupabaseConfig } from "@/lib/env/public"
import { getSupabaseServiceRoleConfig } from "@/lib/env/server"

let serviceClient = null

export const getServiceRoleClient = () => {
  if (serviceClient) {
    return serviceClient
  }

  const { url, isConfigured } = getPublicSupabaseConfig()
  const { serviceRoleKey, isConfigured: hasServiceKey, missingMessage } = getSupabaseServiceRoleConfig()

  if (!isConfigured || !hasServiceKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(missingMessage)
    }
    return null
  }

  serviceClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return serviceClient
}
