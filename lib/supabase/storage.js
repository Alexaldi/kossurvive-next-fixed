import { createClient } from "@/lib/supabase/client"

const FALLBACK_SVG =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%231f2937'/><stop offset='50%' stop-color='%2322243a'/><stop offset='100%' stop-color='%23111b2b'/></linearGradient></defs><rect width='400' height='300' fill='url(%23g)'/><g fill='%236ee7b7' fill-opacity='0.3'><circle cx='60' cy='40' r='26'/><circle cx='360' cy='90' r='18'/><circle cx='120' cy='250' r='22'/><circle cx='300' cy='230' r='30'/></g><g fill='none' stroke='%236ee7b7' stroke-opacity='0.4' stroke-width='8'><path d='M80 180c30-40 70-60 120-60s90 20 120 60'/><path d='M100 120c20-30 50-45 100-45s80 15 100 45'/></g><g fill='%23bae6fd' fill-opacity='0.4'><circle cx='200' cy='160' r='18'/><circle cx='260' cy='110' r='12'/><circle cx='150' cy='90' r='14'/></g></svg>"

export const FALLBACK_IMAGE_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(FALLBACK_SVG)}`

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i

const imageUrlCache = typeof Map !== "undefined" ? new Map() : null

const defaultBucket = () =>
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || null

const normalizeSource = (source, options = {}) => {
    const fallbackBucket =
        options.bucket ?? options.defaultBucket ?? defaultBucket()

    if (!source) {
        return { type: "fallback" }
    }

    if (typeof source === "string") {
        const trimmed = source.trim()

        if (!trimmed) {
            return { type: "fallback" }
        }

        if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith("data:")) {
            return { type: "absolute", value: trimmed }
        }

        let bucket = fallbackBucket
        let path = trimmed.replace(/^\/+/, "")

        if (trimmed.includes("::")) {
            const [maybeBucket, ...rest] = trimmed.split("::")
            bucket = maybeBucket?.trim() || bucket
            path = rest.join("::").trim().replace(/^\/+/, "")
        } else if (!bucket && trimmed.includes("/")) {
            const [maybeBucket, ...rest] = trimmed.split("/")
            bucket = maybeBucket?.trim() || bucket
            path = rest.join("/").trim()
        }

        return bucket && path
            ? { type: "storage", bucket, path }
            : { type: "fallback" }
    }

    if (typeof source === "object") {
        const absoluteCandidate =
            source.publicUrl ?? source.public_url ?? source.url ?? null

        if (
            typeof absoluteCandidate === "string" &&
            (ABSOLUTE_URL_PATTERN.test(absoluteCandidate) ||
                absoluteCandidate.startsWith("data:"))
        ) {
            return { type: "absolute", value: absoluteCandidate.trim() }
        }

        const bucket =
            source.bucket ?? source.storageBucket ?? source.storage_bucket ?? fallbackBucket

        const pathCandidate =
            source.path ??
            source.file ??
            source.image_path ??
            source.imagePath ??
            source.image_url ??
            source.imageUrl ??
            source.src ??
            ""

        if (typeof pathCandidate === "string") {
            const trimmed = pathCandidate.trim()
            if (ABSOLUTE_URL_PATTERN.test(trimmed) || trimmed.startsWith("data:")) {
                return { type: "absolute", value: trimmed }
            }

            const path = trimmed.replace(/^\/+/, "")
            if (bucket && path) {
                return { type: "storage", bucket, path }
            }
        }
    }

    return { type: "fallback" }
}

const cacheKeyFor = (bucket, path) => `${bucket}::${path}`

const cacheSet = (bucket, path, value) => {
    if (!imageUrlCache) return
    try {
        imageUrlCache.set(cacheKeyFor(bucket, path), value)
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.warn("Gagal menyimpan cache URL Supabase:", error)
        }
    }
}

const cacheGet = (bucket, path) => {
    if (!imageUrlCache) return null
    return imageUrlCache.get(cacheKeyFor(bucket, path)) ?? null
}

export const clearSupabaseImageCache = () => {
    imageUrlCache?.clear?.()
}

export const resolveSupabaseImageUrl = (source, options = {}) => {
    const fallback = options.fallback ?? FALLBACK_IMAGE_DATA_URL
    const normalized = normalizeSource(source, options)

    if (normalized.type === "absolute") {
        return normalized.value
    }

    if (normalized.type !== "storage") {
        return fallback
    }

    const { bucket, path } = normalized

    const cached = cacheGet(bucket, path)
    if (cached) {
        return cached
    }

    const supabase = options.supabase ?? createClient()

    if (!supabase) {
        return fallback
    }

    try {
        const { data, error } = supabase.storage.from(bucket).getPublicUrl(path)

        if (error) {
            throw error
        }

        const publicUrl = data?.publicUrl ?? fallback
        cacheSet(bucket, path, publicUrl)
        return publicUrl
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.warn("Gagal mendapatkan URL publik Supabase:", error)
        }
        cacheSet(bucket, path, fallback)
        return fallback
    }
}

