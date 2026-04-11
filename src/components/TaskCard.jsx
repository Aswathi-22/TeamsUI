import { useEffect, useRef } from 'react'
import {
  TASK_STATUS_BACKLOG,
  TASK_STATUS_COMPLETED,
  TASK_STATUS_IN_PROGRESS,
  TASK_STATUS_META,
  TASK_STATUS_TODO,
} from '../constants/taskStatus'

const statusStyles = {
  [TASK_STATUS_BACKLOG]: 'bg-slate-800/90 text-slate-200 border-slate-700/80',
  [TASK_STATUS_TODO]: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/40',
  [TASK_STATUS_IN_PROGRESS]: 'bg-teal-500/20 text-teal-200 border-teal-400/40',
  [TASK_STATUS_COMPLETED]: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
}

const priorityStyles = {
  low: 'bg-sky-500/15 text-sky-200 border-sky-400/35',
  medium: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/35',
  high: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  critical: 'bg-rose-500/20 text-rose-100 border-rose-400/45',
}

const formatDate = (isoDate) => {
  if (!isoDate) {
    return 'N/A'
  }

  const parsedDate = new Date(`${isoDate}T00:00:00`)
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function TaskCard({
  task,
  dependencyTitles = [],
  isHighlighted = false,
  onAskInChat,
}) {
  const visibleDependencies = dependencyTitles.slice(0, 2)
  const remainingDependencyCount = Math.max(dependencyTitles.length - visibleDependencies.length, 0)
  const cardRef = useRef(null)

  useEffect(() => {
    if (isHighlighted) {
      cardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [isHighlighted])

  return (
    <article
      ref={cardRef}
      className={`group rounded-xl border bg-slate-900/72 p-3 shadow-panel transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/45 hover:bg-slate-900 ${
        isHighlighted
          ? 'border-cyan-300/80 ring-2 ring-cyan-300/35'
          : 'border-slate-700/60'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display text-base leading-snug text-slate-50 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {task.title}
        </h4>
        <span
          className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${statusStyles[task.status] ?? statusStyles[TASK_STATUS_BACKLOG]}`}
        >
          {TASK_STATUS_META[task.status]?.label ?? TASK_STATUS_META[TASK_STATUS_BACKLOG].label}
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-snug text-slate-300/85 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
        {task.description || 'No description'}
      </p>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
        <span className="rounded-md border border-slate-700/80 bg-slate-800/70 px-2 py-1">
          <span className="mr-1 uppercase tracking-[0.08em] text-slate-500">Start</span>
          {formatDate(task.startDate)}
        </span>
        <span className="rounded-md border border-slate-700/80 bg-slate-800/70 px-2 py-1">
          <span className="mr-1 uppercase tracking-[0.08em] text-slate-500">Due</span>
          {formatDate(task.dueDate)}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
          >
            {task.priority}
          </span>

          {visibleDependencies.length > 0 ? (
            visibleDependencies.map((dependencyTitle) => (
              <span
                key={dependencyTitle}
                className="rounded-full border border-slate-700/70 bg-slate-800/90 px-2 py-0.5 text-[10px] text-slate-300"
              >
                {dependencyTitle}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500">No dependencies</span>
          )}

          {remainingDependencyCount > 0 ? (
            <span className="rounded-full border border-slate-700/70 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-400">
              +{remainingDependencyCount} more
            </span>
          ) : null}
        </div>

        {onAskInChat ? (
          <button
            type="button"
            onPointerDown={(event) => {
              event.stopPropagation()
            }}
            onClick={(event) => {
              event.stopPropagation()
              onAskInChat(task)
            }}
            className="shrink-0 rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-400/20"
            aria-label={`Open chat for ${task.title}`}
          >
            Chat
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default TaskCard
