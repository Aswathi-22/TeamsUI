import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import CalendarView from '../components/CalendarView'
import CreateTaskModal from '../components/CreateTaskModal'
import CreateWorkspaceModal from '../components/CreateWorkspaceModal'
import KanbanBoard from '../components/KanbanBoard'
import TimelineView from '../components/TimelineView'
import { TASK_STATUS_ORDER } from '../constants/taskStatus'
import {
  createWorkspace,
  createTask,
  fetchWorkspaces,
  fetchTasks,
  updateTaskStatus as syncTaskStatus,
} from '../services/api'
import { openTaskQueryInTeamsChat } from '../services/teamsChat'
import { useWorkspaceStore } from '../store/useWorkspaceStore'

const tabItems = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'timeline', label: 'Timeline' },
]
const DEFAULT_TASK_QUERY = 'Can you review this task and share guidance on blockers?'

function Workspace() {
  const navigate = useNavigate()
  const { workspaceId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] =
    useState(false)

  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const tasks = useWorkspaceStore((state) => state.tasks)
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const getTasksByStatus = useWorkspaceStore((state) => state.getTasksByStatus)
  const setActiveWorkspace = useWorkspaceStore((state) => state.setActiveWorkspace)

  const rawTab = searchParams.get('tab')
  const selectedTaskId = searchParams.get('task')?.trim() ?? ''
  const activeTab = tabItems.some((tabItem) => tabItem.id === rawTab)
    ? rawTab
    : 'tasks'

  useEffect(() => {
    if (!workspaces.length) {
      return
    }

    const matchedWorkspace =
      workspaces.find((workspace) => workspace.id === workspaceId) ?? workspaces[0]

    if (workspaceId !== matchedWorkspace.id) {
      navigate(`/workspace/${matchedWorkspace.id}?tab=${activeTab}`, { replace: true })
      return
    }

    if (activeWorkspaceId !== matchedWorkspace.id) {
      setActiveWorkspace(matchedWorkspace.id)
    }
  }, [
    activeTab,
    activeWorkspaceId,
    navigate,
    setActiveWorkspace,
    workspaceId,
    workspaces,
  ])

  useEffect(() => {
    // Local for now, backend-driven when Space Lean endpoints are connected.
    void fetchWorkspaces()
  }, [])

  useEffect(() => {
    if (!activeWorkspaceId) {
      return
    }

    // This call is local today and becomes backend sync once APIs are connected.
    void fetchTasks(activeWorkspaceId)
  }, [activeWorkspaceId])

  const activeWorkspace =
    workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
    workspaces[0]

  const workspaceTasks = useMemo(
    () => tasks.filter((task) => task.workspaceId === activeWorkspace?.id),
    [activeWorkspace?.id, tasks],
  )

  const dependencyTitleMap = useMemo(
    () => new Map(workspaceTasks.map((task) => [task.id, task.title])),
    [workspaceTasks],
  )

  const highlightedTaskId = useMemo(() => {
    if (!selectedTaskId) {
      return null
    }

    return workspaceTasks.some((task) => task.id === selectedTaskId)
      ? selectedTaskId
      : null
  }, [selectedTaskId, workspaceTasks])

  const tasksByStatus = TASK_STATUS_ORDER.reduce((result, status) => {
    result[status] = activeWorkspace?.id
      ? getTasksByStatus(activeWorkspace.id, status)
      : []
    return result
  }, {})

  const handleWorkspaceChange = (nextWorkspaceId) => {
    setActiveWorkspace(nextWorkspaceId)
    navigate(`/workspace/${nextWorkspaceId}?tab=${activeTab}`)
  }

  const handleTabChange = (nextTab) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', nextTab)
    if (nextTab !== 'tasks') {
      nextParams.delete('task')
    }
    setSearchParams(nextParams)
  }

  const handleCreateTask = async (taskInput) => {
    await createTask({
      ...taskInput,
      workspaceId: activeWorkspace?.id,
    })
  }

  const handleTaskStatusChange = async (taskId, nextStatus) => {
    await syncTaskStatus(taskId, nextStatus)
  }

  const handleTaskChatRequest = async (task) => {
    if (!activeWorkspace?.id || !task) {
      return
    }

    const question = window.prompt(
      'Ask your team lead or manager about this task:',
      DEFAULT_TASK_QUERY,
    )

    if (question === null) {
      return
    }

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', 'tasks')
    nextParams.set('task', task.id)
    setSearchParams(nextParams)

    await openTaskQueryInTeamsChat({
      task,
      query: trimmedQuestion,
      workspaceId: activeWorkspace.id,
      workspaceName: activeWorkspace.name,
    })
  }

  const handleCreateWorkspace = async (workspaceInput) => {
    const createdWorkspace = await createWorkspace(workspaceInput)
    navigate(`/workspace/${createdWorkspace.id}?tab=${activeTab}`)
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-6 lg:flex-row">
        <aside className="glass-panel flex w-full flex-col rounded-3xl border border-slate-700/70 p-5 lg:w-[290px] lg:self-start">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-teal-300">
                Space Lean UI
              </p>
              <h1 className="mt-2 font-display text-2xl text-slate-50">Workspaces</h1>
              <p className="mt-1 text-sm text-slate-400">
                Tasks, calendar, and timeline scoped by workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateWorkspaceModalOpen(true)}
              className="rounded-xl border border-slate-600/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-100"
            >
              + Create Workspace
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspace?.id
              return (
                <button
                  key={workspace.id}
                  type="button"
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? 'border-teal-400/55 bg-teal-500/12 text-teal-100'
                      : 'border-slate-700/70 bg-slate-900/60 text-slate-300 hover:border-slate-500/80 hover:text-slate-100'
                  }`}
                >
                  <p className="font-display text-base">{workspace.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{workspace.description}</p>
                </button>
              )
            })}
          </div>
        </aside>

        <section className="w-full space-y-4">
          <header className="glass-panel rounded-3xl border border-slate-700/70 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Active Workspace</p>
                <h2 className="mt-2 font-display text-3xl text-slate-50">
                  {activeWorkspace?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{activeWorkspace?.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
              >
                + Create Task
              </button>
            </div>

            <nav className="mt-5 flex flex-wrap gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-2">
              {tabItems.map((tabItem) => {
                const isActive = tabItem.id === activeTab
                return (
                  <button
                    key={tabItem.id}
                    type="button"
                    onClick={() => handleTabChange(tabItem.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-500/20 text-teal-100 shadow-inner shadow-teal-500/15'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {tabItem.label}
                  </button>
                )
              })}
            </nav>
          </header>

          <section className="rounded-3xl border border-slate-700/70 bg-slate-900/45 p-4 md:p-5">
            {activeTab === 'tasks' ? (
              <KanbanBoard
                tasksByStatus={tasksByStatus}
                dependencyTitleMap={dependencyTitleMap}
                onTaskStatusChange={handleTaskStatusChange}
                highlightedTaskId={highlightedTaskId}
                onTaskChatRequest={handleTaskChatRequest}
              />
            ) : null}

            {activeTab === 'calendar' ? <CalendarView tasks={workspaceTasks} /> : null}
            {activeTab === 'timeline' ? <TimelineView tasks={workspaceTasks} /> : null}
          </section>
        </section>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onCreate={handleCreateTask}
        workspaceId={activeWorkspace?.id}
        availableTasks={workspaceTasks}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceModalOpen}
        onClose={() => setIsCreateWorkspaceModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />
    </main>
  )
}

export default Workspace
