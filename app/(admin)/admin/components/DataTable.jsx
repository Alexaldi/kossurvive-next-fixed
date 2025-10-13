"use client"

export default function DataTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/40">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/70 text-left text-xs uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-medium">
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-3 text-right text-xs font-medium">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-6 text-center text-slate-500">
                Belum ada data.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-slate-900/60">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-top text-slate-200">
                    {column.render ? column.render(row[column.key], row) : renderValue(row[column.key])}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-200"
                        >
                          Edit
                        </button>
                      ) : null}
                      {onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="rounded-md border border-rose-500/60 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10"
                        >
                          Hapus
                        </button>
                      ) : null}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function renderValue(value) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-300">
        {value.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  if (value && typeof value === "object") {
    return <pre className="whitespace-pre-wrap text-xs text-emerald-200/80">{JSON.stringify(value, null, 2)}</pre>
  }

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak"
  }

  return value ?? "—"
}
