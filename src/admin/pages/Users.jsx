import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import DataTable from '../components/DataTable'
import StatusPill from '../components/StatusPill'
import { usersApi } from '../api/client'

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersApi.list().then(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <TopBar crumb="People" title="Users" />
      <main className="px-8 py-6">
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
        ) : (
          <DataTable
            rows={users}
            emptyLabel="No users yet."
            columns={[
              { key: 'name', label: 'Name', sortable: true },
              { key: 'email', label: 'Email', render: (r) => <span className="font-data text-xs">{r.email}</span> },
              { key: 'role', label: 'Role', render: (r) => <StatusPill status={r.role} /> },
              {
                key: 'createdAt',
                label: 'Joined',
                sortable: true,
                render: (r) => <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</span>,
              },
              {
                key: 'lastActiveAt',
                label: 'Last active',
                render: (r) => (
                  <span className="font-data text-xs" style={{ color: 'var(--muted)' }}>
                    {r.lastActiveAt ? new Date(r.lastActiveAt).toLocaleDateString() : '—'}
                  </span>
                ),
              },
            ]}
          />
        )}
      </main>
    </>
  )
}

export default Users
