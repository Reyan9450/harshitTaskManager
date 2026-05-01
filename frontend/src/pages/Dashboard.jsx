import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges'

function StatCard({ label, value, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
  }
  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-sm mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 py-10 text-center">Loading dashboard…</div>
  if (!data) return <div className="text-gray-400 py-10 text-center">Failed to load dashboard.</div>

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name} 👋</h2>
        <p className="text-gray-500 text-sm mt-1 capitalize">{user?.role} dashboard</p>
      </div>

      {isAdmin ? (
        <>
          {/* Admin stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Projects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total" value={data.projects?.total} color="indigo" />
              <StatCard label="Active" value={data.projects?.active} color="blue" />
              <StatCard label="Completed" value={data.projects?.completed} color="green" />
              <StatCard label="Overdue" value={data.projects?.overdue} color="red" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tasks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total" value={data.tasks?.total} color="indigo" />
              <StatCard label="Completed" value={data.tasks?.completed} color="green" />
              <StatCard label="In Progress" value={data.tasks?.inProgress} color="blue" />
              <StatCard label="Overdue" value={data.tasks?.overdue} color="red" />
            </div>
          </div>

          {/* Team productivity */}
          {data.team?.productivity?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Team Productivity ({data.team.totalMembers} members)
              </h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {data.team.productivity.map((member, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                        {member.name?.[0]}
                      </div>
                      <span className="text-sm text-gray-700">{member.name}</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">{member.completedTasks} completed</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent projects */}
          {data.recentProjects?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Projects</h3>
                <Link to="/projects" className="text-xs text-indigo-600 hover:underline">View all</Link>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {data.recentProjects.map((p) => (
                  <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-800">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Member stats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">My Tasks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total" value={data.tasks?.total} color="indigo" />
              <StatCard label="Completed" value={data.tasks?.completed} color="green" />
              <StatCard label="In Progress" value={data.tasks?.inProgress} color="blue" />
              <StatCard label="Overdue" value={data.tasks?.overdue} color="red" />
            </div>
          </div>

          {/* Upcoming tasks */}
          {data.upcomingTasks?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Deadlines</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {data.upcomingTasks.map((t) => (
                  <div key={t._id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.project?.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.isOverdue && t.status !== 'completed' && <OverdueBadge />}
                      <PriorityBadge priority={t.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My projects */}
          {data.myProjects?.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">My Projects</h3>
                <Link to="/projects" className="text-xs text-indigo-600 hover:underline">View all</Link>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {data.myProjects.map((p) => (
                  <Link key={p._id} to={`/projects/${p._id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-800">{p.title}</span>
                    <StatusBadge status={p.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent tasks */}
      {data.recentTasks?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {data.recentTasks.map((t) => (
              <div key={t._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.project?.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.isOverdue && t.status !== 'completed' && <OverdueBadge />}
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
