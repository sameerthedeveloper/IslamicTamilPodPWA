import React from 'react'

function StatCard({ label, value, icon: Icon }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
        {Icon && <Icon size={16} style={{ color: 'var(--accent)' }} />}
      </div>
      <p className="mt-2 font-data text-3xl font-semibold" style={{ color: 'var(--ink)' }}>
        {value}
      </p>
    </div>
  )
}

export default StatCard
