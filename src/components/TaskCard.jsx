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

function TaskCard({ task, dependencyTitles }) {
  return (
    <article className="group rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 shadow-panel transition duration-300 hover:-translate-y-1 hover:border-cyan-400/45 hover:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-display text-lg text-slate-50">{task.title}</h4>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyles[task.status] ?? statusStyles[TASK_STATUS_BACKLOG]}`}
        >
          {TASK_STATUS_META[task.status]?.label ?? TASK_STATUS_META[TASK_STATUS_BACKLOG].label}
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-slate-300/90">
        {task.description || 'No description'}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-400">
        <div>
          <dt className="uppercase tracking-[0.08em] text-slate-500">Start</dt>
          <dd className="mt-1 text-sm text-slate-200">{formatDate(task.startDate)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-[0.08em] text-slate-500">Due</dt>
          <dd className="mt-1 text-sm text-slate-200">{formatDate(task.dueDate)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Dependencies</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {dependencyTitles.length > 0 ? (
            dependencyTitles.map((dependencyTitle) => (
              <span
                key={dependencyTitle}
                className="rounded-full border border-slate-700/70 bg-slate-800/90 px-2 py-1 text-[11px] text-slate-300"
              >
                {dependencyTitle}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500">No dependencies</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default TaskCard
