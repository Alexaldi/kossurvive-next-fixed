"use client"

import { useFormState, useFormStatus } from "react-dom"

const initialState = { error: "" }

export default function LoginForm({ action }) {
  const [state, formAction] = useFormState(action, initialState)
  const { pending } = useFormStatus()

  return (
    <form action={formAction} className="mx-auto mt-12 w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-xl shadow-slate-950/40">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Masuk Admin</h1>
        <p className="mt-1 text-sm text-slate-400">Gunakan email dan password admin yang sudah terdaftar.</p>
      </div>

      {state?.error ? (
        <div className="rounded-md border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{state.error}</div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="admin@kossurvive.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-emerald-500"
          placeholder="••••••"
        />
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
        disabled={pending}
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  )
}

export { initialState }
