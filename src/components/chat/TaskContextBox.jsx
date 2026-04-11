const priorityStyles = {
  low: 'bg-sky-500/15 text-sky-200 border-sky-400/35',
  medium: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/35',
  high: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  critical: 'bg-rose-500/20 text-rose-100 border-rose-400/45',
}

const truncateText = (value, maxLength = 120) => {
  const normalized = `${value ?? ''}`.trim()
  if (normalized.length <= maxLength) {
    return normalized || 'No description'
  }

  return `${normalized.slice(0, maxLength - 3)}...`
}

function TaskContextBox({ task }) {
  return (
    <section className="rounded-2xl border border-cyan-400/35 bg-cyan-500/10 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-200">
        Replying to task
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-display text-lg text-slate-50">{task.title}</h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${priorityStyles[task.priority] ?? priorityStyles.medium}`}
        >
          {task.priority}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-300">{truncateText(task.description)}</p>
    </section>
  )
}

export default TaskContextBox
