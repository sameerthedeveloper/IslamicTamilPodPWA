import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, Inbox } from 'lucide-react'

const PAGE_SIZE = 10

function DataTable({
  columns, rows, rowKey = 'id', emptyLabel = 'No records yet.',
  selectable = false, selectedIds, onToggleRow, onToggleRows,
}) {
  const [sortKey, setSortKey] = useState(null)
  const [sortDir, setSortDir] = useState(1)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    if (!sortKey) return rows
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      return av > bv ? sortDir : av < bv ? -sortDir : 0
    })
  }, [rows, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => -d)
    } else {
      setSortKey(key)
      setSortDir(1)
    }
  }

  const pageIds = pageRows.map((r) => r[rowKey])
  const allOnPageSelected = selectable && pageIds.length > 0 && pageIds.every((id) => selectedIds?.has(id))

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-2xl py-16"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Inbox size={22} style={{ color: 'var(--muted)' }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {selectable && (
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={() => onToggleRows?.(pageIds, !allOnPageSelected)}
                    aria-label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`px-5 py-3 text-left text-xs font-medium uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  style={{ color: 'var(--muted)' }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 1 ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const id = row[rowKey]
              return (
                <tr
                  key={id}
                  className="transition-colors hover:bg-[var(--base)]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  {selectable && (
                    <td className="px-5 py-3 align-middle">
                      <input
                        type="checkbox"
                        checked={!!selectedIds?.has(id)}
                        onChange={() => onToggleRow?.(id)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3 align-middle">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3 text-xs"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}
        >
          <span>Page {safePage} of {pageCount}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded px-2 py-1 font-medium disabled:opacity-40"
              style={{ border: '1px solid var(--border)' }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
              className="rounded px-2 py-1 font-medium disabled:opacity-40"
              style={{ border: '1px solid var(--border)' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
