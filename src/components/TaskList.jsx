import { useEffect, useState } from 'react'

const SPACE_LEAN_TASKS_URL =
  'https://cad.spaceaiapp.com/lean/api/data?projectKey=default'

const PRIORITY_BADGE_STYLES = {
  low: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  medium: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  high: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
}

const FALLBACK_PRIORITY_STYLE =
  'border-indigo-400/35 bg-indigo-500/10 text-indigo-100'

const normalizeTask = (task, index) => {
  const normalizedPriority = String(task?.priority ?? 'medium').toLowerCase()

  return {
    id: `${task?.title ?? 'task'}-${index}`,
    title: task?.title?.trim() || 'Untitled task',
    description: task?.description?.trim() || 'No description provided.',
    priority: normalizedPriority,
    estimatedDuration: Number(task?.estimatedDuration) || 0,
  }
}

const fetchSpaceLeanTasks = async (signal) => {
  const response = await fetch(SPACE_LEAN_TASKS_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks (${response.status})`)
  }

  const payload = await response.json()
  const tasks = payload?.snapshot?.tasks

  if (!Array.isArray(tasks)) {
    throw new Error('Invalid response format: snapshot.tasks is missing.')
  }

  return tasks.map(normalizeTask)
}

const getPriorityClassName = (priority) =>
  PRIORITY_BADGE_STYLES[priority] ?? FALLBACK_PRIORITY_STYLE

function TaskList() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    const loadTasks = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const nextTasks = await fetchSpaceLeanTasks(controller.signal)
        setTasks(nextTasks)
      } catch (error) {
        if (error?.name === 'AbortError') {
          return
        }

        setTasks([])
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load tasks from Space Lean.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <section className="space-y-4 rounded-3xl border border-slate-700/70 bg-slate-900/55 p-4 md:p-5">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">
            Space Lean
          </p>
          <h3 className="mt-1 font-display text-xl text-slate-50">Task List</h3>
        </div>
        {!isLoading && !errorMessage ? (
          <span className="rounded-full border border-cyan-400/30 bg-cyan-500/12 px-3 py-1 text-xs font-medium text-cyan-200">
            {tasks.length} tasks
          </span>
        ) : null}
      </header>

      {isLoading ? (
        <p className="rounded-2xl border border-slate-700/70 bg-slate-900/65 px-4 py-3 text-sm text-slate-300">
          Loading...
        </p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="rounded-2xl border border-rose-400/45 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && tasks.length === 0 ? (
        <p className="rounded-2xl border border-slate-700/70 bg-slate-900/65 px-4 py-3 text-sm text-slate-300">
          No tasks available.
        </p>
      ) : null}

      {!isLoading && !errorMessage && tasks.length > 0 ? (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-2xl border border-slate-700/80 bg-slate-900/60 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h4 className="font-display text-lg text-slate-50">{task.title}</h4>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] ${getPriorityClassName(task.priority)}`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">{task.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-teal-200">
                Estimated Duration: {task.estimatedDuration}h
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default TaskList
