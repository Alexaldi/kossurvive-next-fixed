"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import AdminTable from "./AdminTable"
import UploadForm from "./UploadForm"

const RESOURCE_TABS = [
  {
    key: "recipes",
    apiPath: "recipes",
    resource: "recipe",
    label: "Resep",
    description: "Kelola resep yang muncul di feed pengguna dan halaman favorit.",
    hasImage: true,
    columns: [
      { key: "name", label: "Nama" },
      {
        key: "estCost",
        label: "Biaya (Rp)",
        render: (value) => (typeof value === "number" ? value.toLocaleString("id-ID") : "—"),
      },
      { key: "categories", label: "Kategori" },
      {
        key: "image",
        label: "Gambar",
        render: (value) => (value ? <span className="break-all text-xs text-emerald-300">{value}</span> : "—"),
      },
    ],
    fields: [
      { key: "name", label: "Nama Resep", type: "text", required: true },
      { key: "estCost", label: "Estimasi Biaya (Rp)", type: "number" },
      { key: "categories", label: "Kategori (pisahkan dengan koma)", type: "text" },
      { key: "ingredients", label: "Bahan (pisahkan dengan koma atau baris baru)", type: "textarea", rows: 3 },
      { key: "howto", label: "Langkah memasak", type: "textarea", rows: 4 },
      { key: "nutrients", label: "Nutrisi (JSON)", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "workouts",
    apiPath: "workouts",
    resource: "workout",
    label: "Workout",
    description: "Atur daftar workout dan gerakan latihan yang tampil di aplikasi.",
    columns: [
      { key: "name", label: "Nama" },
      { key: "moves", label: "Gerakan" },
    ],
    fields: [
      { key: "name", label: "Nama Workout", type: "text", required: true },
      { key: "moves", label: "Gerakan (pisahkan dengan koma atau baris baru)", type: "textarea", rows: 3 },
    ],
  },
  {
    key: "learningResources",
    apiPath: "learning",
    resource: "learningResource",
    label: "Learning Resource",
    description: "Kelola materi belajar yang disajikan kepada pengguna.",
    columns: [
      { key: "title", label: "Judul" },
      { key: "category", label: "Kategori" },
      { key: "type", label: "Tipe" },
      {
        key: "link",
        label: "Tautan",
        render: (value) => (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-emerald-300 underline decoration-dotted"
          >
            {value}
          </a>
        ),
      },
    ],
    fields: [
      { key: "title", label: "Judul", type: "text", required: true },
      { key: "category", label: "Kategori", type: "text" },
      { key: "type", label: "Tipe", type: "text" },
      { key: "summary", label: "Ringkasan", type: "textarea", rows: 3 },
      { key: "link", label: "Tautan", type: "text", required: true },
    ],
  },
]

const INITIAL_DRAFT = {
  name: "",
  estCost: "",
  categories: "",
  ingredients: "",
  howto: "",
  nutrients: "",
  moves: "",
  title: "",
  category: "",
  type: "",
  summary: "",
  link: "",
  image: "",
}

export default function DashboardShell({ initialData }) {
  const [activeTab, setActiveTab] = useState(RESOURCE_TABS[0].key)
  const [records, setRecords] = useState(initialData)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/admin/api/session", { method: "DELETE" })
    } finally {
      window.location.href = "/admin/login"
    }
  }, [])

  const updateResource = useCallback((key, updater) => {
    setRecords((prev) => ({
      ...prev,
      [key]: typeof updater === "function" ? updater(prev[key] ?? []) : updater,
    }))
  }, [])

  const currentTab = useMemo(
    () => RESOURCE_TABS.find((tab) => tab.key === activeTab) ?? RESOURCE_TABS[0],
    [activeTab],
  )

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard Admin</h1>
          <p className="mt-2 text-sm text-slate-400">
            Kelola konten KoSurvive yang tersimpan di database dan Supabase Storage.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="self-start rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-500/70 hover:text-rose-200"
        >
          Logout
        </button>
      </header>

      {toast ? (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {toast}
        </div>
      ) : null}

      <nav className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2 text-sm font-medium text-slate-300">
        {RESOURCE_TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 transition ${
                isActive
                  ? "bg-emerald-500 text-slate-900 shadow"
                  : "bg-slate-900/40 text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      <ResourcePanel
        definition={currentTab}
        rows={records[currentTab.key] ?? []}
        setRows={(updater) => updateResource(currentTab.key, updater)}
        setToast={setToast}
      />
    </div>
  )
}

function ResourcePanel({ definition, rows, setRows, setToast }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState(() => ({ ...INITIAL_DRAFT }))
  const [file, setFile] = useState(null)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const columns = useMemo(() => definition.columns, [definition.columns])

  const openCreate = () => {
    setEditingId(null)
    setDraft({ ...INITIAL_DRAFT })
    setFile(null)
    setError("")
    setIsFormOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row.id)
    setDraft({
      ...INITIAL_DRAFT,
      ...Object.keys(INITIAL_DRAFT).reduce((acc, key) => {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key]
          acc[key] = Array.isArray(value)
            ? value.join("\n")
            : typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value ?? "")
        }
        return acc
      }, {}),
    })
    setFile(null)
    setError("")
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setDraft({ ...INITIAL_DRAFT })
    setFile(null)
    setError("")
    setEditingId(null)
  }

  const handleDelete = async (row) => {
    if (!confirm(`Hapus ${definition.label.toLowerCase()} "${row.name || row.title}"?`)) {
      return
    }

    try {
      setError("")
      const response = await fetch(`/admin/api/${definition.apiPath}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      })
      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || "Gagal menghapus data.")
      }
      setRows((prev) => prev.filter((item) => item.id !== row.id))
      setToast(`${definition.label} berhasil dihapus.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    const payload = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    )

    if (editingId) {
      payload.id = editingId
    }

    const formData = new FormData()
    formData.append("data", JSON.stringify(payload))
    if (file) {
      formData.append("image", file)
    }

    try {
      const endpoint = `/admin/api/${definition.apiPath}`
      const method = editingId ? "PUT" : "POST"
      const response = await fetch(endpoint, { method, body: formData })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal menyimpan data.")
      }

      const record = result.record

      setRows((prev) => {
        if (editingId) {
          return prev.map((item) => (item.id === record.id ? record : item))
        }
        return [record, ...prev]
      })

      setToast(
        editingId
          ? `${definition.label} berhasil diperbarui.`
          : `${definition.label} baru berhasil ditambahkan.`,
      )

      closeForm()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">{definition.label}</h2>
          <p className="text-sm text-slate-400">{definition.description}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="self-start rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400"
        >
          Tambah {definition.label}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
      ) : null}

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-6">
          <h3 className="text-lg font-semibold text-slate-100">
            {editingId ? "Edit" : "Tambah"} {definition.label}
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            {definition.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-2">
                <label htmlFor={`${definition.resource}-${field.key}`} className="text-sm font-medium text-slate-300">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`${definition.resource}-${field.key}`}
                    rows={field.rows || 3}
                    required={field.required}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-emerald-500"
                  />
                ) : (
                  <input
                    id={`${definition.resource}-${field.key}`}
                    type={field.type}
                    required={field.required}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-emerald-500"
                  />
                )}
              </div>
            ))}
          </div>

          {definition.hasImage ? (
            <UploadForm label="Gambar Supabase" onFileChange={setFile} currentValue={draft.image} />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-500/60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500/80"
            >
              Batal
            </button>
          </div>
        </form>
      ) : null}

      <AdminTable columns={columns} rows={rows} onEdit={openEdit} onDelete={handleDelete} />
    </section>
  )
}
