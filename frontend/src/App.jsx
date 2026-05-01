import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectForm from './pages/ProjectForm'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import TaskForm from './pages/TaskForm'

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout><Projects /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/projects/new" element={
        <AdminRoute>
          <Layout><ProjectForm /></Layout>
        </AdminRoute>
      } />
      <Route path="/projects/:id/edit" element={
        <AdminRoute>
          <Layout><ProjectForm /></Layout>
        </AdminRoute>
      } />
      <Route path="/projects/:id" element={
        <ProtectedRoute>
          <Layout><ProjectDetail /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <Layout><Tasks /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/tasks/new" element={
        <AdminRoute>
          <Layout><TaskForm /></Layout>
        </AdminRoute>
      } />

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { fontSize: '14px' },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
