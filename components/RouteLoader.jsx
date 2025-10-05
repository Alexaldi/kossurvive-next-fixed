"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

const MIN_DISPLAY_MS = 520

const RouteLoaderContext = createContext(null)

function RouteLoaderOverlay({ isVisible }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur"
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="flex h-28 w-28 flex-col items-center justify-center gap-3 rounded-3xl border border-emerald-500/40 bg-slate-900/80 text-center shadow-2xl shadow-emerald-500/20"
                    >
                        <span className="inline-flex h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Loading</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export function useRouteLoader() {
    const context = useContext(RouteLoaderContext)
    if (!context) {
        throw new Error("useRouteLoader must be used within a RouteLoaderProvider")
    }
    return context
}

export default function RouteLoaderProvider({ children }) {
    const [isVisible, setIsVisible] = useState(false)
    const startTimeRef = useRef(0)
    const hideTimerRef = useRef(null)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const ensureMinimumDisplay = useCallback(() => {
        const elapsed = Date.now() - startTimeRef.current
        const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0)

        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = setTimeout(() => {
            setIsVisible(false)
        }, remaining)
    }, [])

    const showLoader = useCallback(() => {
        clearTimeout(hideTimerRef.current)
        startTimeRef.current = Date.now()
        setIsVisible(true)
    }, [])

    const hideLoader = useCallback(() => {
        ensureMinimumDisplay()
    }, [ensureMinimumDisplay])

    const navigationKey = useMemo(() => {
        const paramsString = searchParams?.toString() ?? ""
        if (!pathname) return paramsString
        return paramsString ? `${pathname}?${paramsString}` : pathname
    }, [pathname, searchParams])

    useEffect(() => {
        ensureMinimumDisplay()
    }, [navigationKey, ensureMinimumDisplay])

    useEffect(() => {
        // show loader briefly on very first mount to keep transition consistent
        showLoader()
        ensureMinimumDisplay()
    }, [showLoader, ensureMinimumDisplay])

    const value = useMemo(
        () => ({
            showLoader,
            hideLoader,
        }),
        [showLoader, hideLoader]
    )

    return (
        <RouteLoaderContext.Provider value={value}>
            <RouteLoaderOverlay isVisible={isVisible} />
            {children}
        </RouteLoaderContext.Provider>
    )
}
