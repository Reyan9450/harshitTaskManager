import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges'

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ])
      setProject(projRes.data.data)
      setTasks(taskRes.data.data || [])
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status })
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status } : t))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  if (loading) return <div className="text-gray-400 text-center py-10">Loading…</div>
  if (!project) return <div className="text-gray-400 text-center py-10">Project not found.</div>

  const deadline = project.deadline ? new Date(project.deadline).toLocaleDateString() : null
  const progress = project.taskCount > 0
    ? Math.round((project.completedTaskCount / project.taskCount) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate('/projects')} className="text-gray-400 hover:text-gray-600 text-sm">← Projects</button>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
          {project.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {project.isOverdue && <OverdueBadge />}
          <StatusBadge status={project.status} />
          {isAdmin && (
            <Link
              to={`/projects/${id}/edit`}
              className="text-sm border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Created by</p>
          <p className="font-medium text-gray-700">{project.createdBy?.name}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Deadline</p>
          <p className="font-medium text-gray-700">{deadline || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Members</p>
          <p className="font-medium text-gray-700">{project.members?.map((m) => m.name).join(', ') || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tasks ({tasks.length})</h3>
          {isAdmin && (
            <Link
              to={`/tasks/new?projectId=${id}`}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              + Add Task
            </Link>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-gray-400 text-center py-8 bg-white rounded-xl border border-gray-200">No tasks yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {tasks.map((task) => (
              <div key={task._id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400">{task.assignedTo?.name || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {task.isOverdue && task.status !== 'completed' && <OverdueBadge />}
                  <PriorityBadge priority={task.priority} />
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
