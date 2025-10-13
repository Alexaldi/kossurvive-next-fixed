"use client"

import { useRef } from "react"

export default function UploadForm({ label = "Gambar", onFileChange, currentValue }) {
  const inputRef = useRef(null)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0]
            onFileChange?.(file || null)
          }}
          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-500 file:px-3 file:py-2 file:font-semibold file:text-slate-900 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
        />
        {currentValue ? (
          <button
            type="button"
            onClick={() => {
              onFileChange?.(null)
              if (inputRef.current) {
                inputRef.current.value = ""
              }
            }}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-rose-500/60 hover:text-rose-200"
          >
            Hapus
          </button>
        ) : null}
      </div>
      {currentValue ? (
        <p className="text-xs text-slate-400">Saat ini: {currentValue}</p>
      ) : (
        <p className="text-xs text-slate-500">Pilih file untuk mengunggah ke Supabase Storage.</p>
      )}
    </div>
  )
}
