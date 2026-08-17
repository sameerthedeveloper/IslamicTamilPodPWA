import React from 'react'

const TONES = {
  PUBLISHED: 'accent',
  READY: 'accent',
  AUTHORIZED: 'accent',
  ACTIVE: 'accent',
  DRAFT: 'muted',
  PENDING: 'muted',
  PROCESSING: 'warning',
  EXPIRING: 'warning',
  UNPUBLISHED: 'muted',
  INACTIVE: 'muted',
  ARCHIVED: 'muted',
  EXPIRED: 'danger',
  REVOKED: 'danger',
  ADMIN: 'accent',
  USER: 'muted',
}

const COLORS = {
  accent: 'var(--accent)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  muted: 'var(--muted)',
}

function StatusPill({ status }) {
  const tone = TONES[status] ?? 'muted'
  const color = COLORS[tone]

  return (
    <span
      className="inline-flex items-center gap-2 py-0.5 pl-2.5 pr-2 text-xs font-medium font-data uppercase tracking-wide"
      style={{ borderLeft: `2.5px solid ${color}`, color }}
    >
      {status}
    </span>
  )
}

export default StatusPill
