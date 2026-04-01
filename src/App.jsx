import { Navigate, Route, Routes } from 'react-router-dom'
import Workspace from './pages/Workspace'
import { useWorkspaceStore } from './store/useWorkspaceStore'

function App() {
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const defaultWorkspace = workspaces[0]

  if (!defaultWorkspace) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="glass-panel max-w-md rounded-3xl p-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
            Workspace System
          </p>
          <h1 className="mt-3 font-display text-3xl text-slate-50">
            No workspace found
          </h1>
        </section>
      </main>
    )
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`/workspace/${defaultWorkspace.id}`} replace />}
      />
      <Route path="/workspace/:workspaceId" element={<Workspace />} />
      <Route
        path="*"
        element={<Navigate to={`/workspace/${defaultWorkspace.id}`} replace />}
      />
    </Routes>
  )
}

export default App
