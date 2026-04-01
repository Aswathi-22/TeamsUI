import { useEffect, useMemo, useState } from 'react'
import {
  TASK_STATUS_BACKLOG,
  TASK_STATUS_COMPLETED,
  TASK_STATUS_META,
} from '../constants/taskStatus'

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const toISODate = (date) => date.toISOString().slice(0, 10)

const buildInitialFormState = () => {
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const dueDate = new Date(startDate)
  dueDate.setDate(dueDate.getDate() + 3)

  return {
    title: '',
    description: '',
    priority: 'medium',
    startDate: toISODate(startDate),
    dueDate: toISODate(dueDate),
    dependencies: [],
  }
}

function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  workspaceId,
  availableTasks,
}) {
  const [formState, setFormState] = useState(buildInitialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(buildInitialFormState())
    setErrorMessage('')
  }, [isOpen, workspaceId])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [isOpen, isSubmitting, onClose])

  const dependencyOptions = useMemo(
    () => availableTasks.filter((task) => task.status !== TASK_STATUS_COMPLETED),
    [availableTasks],
  )

  const onInputChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const onDependencyChange = (event) => {
    const dependencyId = event.target.value
    setFormState((current) => ({
      ...current,
      dependencies: dependencyId ? [dependencyId] : [],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!formState.title.trim()) {
      setErrorMessage('Title is required.')
      return
    }

    if (formState.dueDate < formState.startDate) {
      setErrorMessage('Due date must be after the start date.')
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        ...formState,
        status: TASK_STATUS_BACKLOG,
        title: formState.title.trim(),
        description: formState.description.trim(),
        workspaceId,
      })
      onClose()
    } catch {
      setErrorMessage('Unable to create task right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-panel animate-fadeIn md:p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Create Task</p>
            <h2 className="mt-2 font-display text-2xl text-slate-50">
              New workspace task
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700/80 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              name="title"
              value={formState.title}
              onChange={onInputChange}
              placeholder="Design launch sprint board"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              name="description"
              value={formState.description}
              onChange={onInputChange}
              rows={4}
              placeholder="Describe the task scope and key deliverables."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formState.priority}
                onChange={onInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="task-start-date">
                Start Date
              </label>
              <input
                id="task-start-date"
                type="date"
                name="startDate"
                value={formState.startDate}
                onChange={onInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="task-due-date">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                value={formState.dueDate}
                onChange={onInputChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-400">Initial Status</p>
            <p className="mt-1 text-sm text-slate-100">
              {TASK_STATUS_META[TASK_STATUS_BACKLOG].label} (default)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="task-dependency">
              Dependency
            </label>
            <select
              id="task-dependency"
              value={formState.dependencies[0] ?? ''}
              onChange={onDependencyChange}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            >
              <option value="">No dependency</option>
              {dependencyOptions.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700/80 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
