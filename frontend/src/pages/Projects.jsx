import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, OverdueBadge } from '../components/Badges'

function ProjectCard({ project, isAdmin, onDelete }) {
  const progress = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/projects/${project._id}`} className="text-base font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2">
          {project.title}
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          {project.isOverdue && <OverdueBadge />}
          <StatusBadge status={project.status} />
        </div>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}</span>
        {deadline && <span>Due {deadline}</span>}
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <Link
            to={`/projects/${project._id}/edit`}
            className="flex-1 text-center text-xs text-indigo-600 border border-indigo-200 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(project._id)}
            className="flex-1 text-xs text-red-600 border border-red-200 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchProjects = () => {
    api.get('/projects')
      .then((res) => setProjects(res.data.data || []))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      setProjects((prev) => prev.filter((p) => p._id !== id))
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const filtered = projects.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter ? p.status === statusFilter : true
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} total</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/projects/new')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + New Project
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>
      </div>

      {loading ? (
        <div className="text-gray-400 text-center py-10">Loading projects…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-400 text-center py-10">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p._id} project={p} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
