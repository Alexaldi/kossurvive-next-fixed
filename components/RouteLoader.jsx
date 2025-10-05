"use client"

import { useEffect, useRef, useState } from "react"
import Router from "next/router"
import { AnimatePresence, motion } from "framer-motion"

const MIN_DISPLAY_MS = 520

export default function RouteLoader() {
    const [isVisible, setIsVisible] = useState(false)
    const startTimeRef = useRef(Date.now())

    useEffect(() => {
        let initialTimer
        let hideTimer

        const ensureMinimumDisplay = () => {
            const elapsed = Date.now() - startTimeRef.current
            const remaining = Math.max(MIN_DISPLAY_MS - elapsed, 0)

            clearTimeout(hideTimer)
            hideTimer = setTimeout(() => {
                setIsVisible(false)
            }, remaining)
        }

        const handleStart = () => {
            clearTimeout(initialTimer)
            clearTimeout(hideTimer)
            startTimeRef.current = Date.now()
            setIsVisible(true)
        }

        const handleStop = () => {
            ensureMinimumDisplay()
        }

        startTimeRef.current = Date.now()
        setIsVisible(true)
        initialTimer = setTimeout(() => {
            setIsVisible(false)
        }, MIN_DISPLAY_MS)

        Router.events.on("routeChangeStart", handleStart)
        Router.events.on("routeChangeComplete", handleStop)
        Router.events.on("routeChangeError", handleStop)

        return () => {
            clearTimeout(initialTimer)
            clearTimeout(hideTimer)
            Router.events.off("routeChangeStart", handleStart)
            Router.events.off("routeChangeComplete", handleStop)
            Router.events.off("routeChangeError", handleStop)
        }
    }, [])

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
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                            Loading
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
