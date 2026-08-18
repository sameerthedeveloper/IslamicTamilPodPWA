import { useEffect, useState } from 'react'
import { Mic2, Users2, UsersRound, HardDrive } from 'lucide-react'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import { statsApi } from '../api/client'

function formatBytes(bytes) {
  if (!bytes) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.get().then(setStats).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <TopBar crumb="Overview" title="Dashboard" />
      <main className="px-8 py-6">
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Episodes" value={stats?.episodes ?? 0} icon={Mic2} />
              <StatCard label="Scholars" value={stats?.scholars ?? 0} icon={Users2} />
              <StatCard label="Users" value={stats?.users ?? 0} icon={UsersRound} />
              <StatCard label="Storage" value={formatBytes(stats?.storageBytes)} icon={HardDrive} />
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold" style={{ color: 'var(--ink)' }}>Recent activity</h2>
              <DataTable
                emptyLabel="No activity yet."
                rows={stats?.recentActivity ?? []}
                columns={[
                  { key: 'title', label: 'Episode' },
                  { key: 'scholar', label: 'Scholar' },
                  { key: 'status', label: 'Status', render: (r) => <StatusPill status={r.status} /> },
                  {
                    key: 'updatedAt',
                    label: 'Updated',
                    render: (r) => (
                      <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(r.updatedAt).toLocaleString()}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default Dashboard
