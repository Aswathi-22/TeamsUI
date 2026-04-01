import { useMemo } from 'react'
import {
  TASK_STATUS_BACKLOG,
  TASK_STATUS_COMPLETED,
  TASK_STATUS_IN_PROGRESS,
  TASK_STATUS_TODO,
} from '../constants/taskStatus'

const parseISODate = (value) => new Date(`${value}T00:00:00`)

const dayDifference = (startDate, endDate) =>
  Math.round((endDate.getTime() - startDate.getTime()) / 86400000)

const formatDate = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

const statusClasses = {
  [TASK_STATUS_BACKLOG]: 'from-slate-500 to-slate-400',
  [TASK_STATUS_TODO]: 'from-indigo-500 to-sky-400',
  [TASK_STATUS_IN_PROGRESS]: 'from-teal-500 to-cyan-400',
  [TASK_STATUS_COMPLETED]: 'from-emerald-500 to-lime-400',
}

function TimelineView({ tasks }) {
  const timelineModel = useMemo(() => {
    const withDates = tasks
      .filter((task) => task.startDate && task.dueDate)
      .map((task) => {
        const parsedStartDate = parseISODate(task.startDate)
        const parsedDueDate = parseISODate(task.dueDate)

        return {
          ...task,
          parsedStartDate: parsedStartDate <= parsedDueDate ? parsedStartDate : parsedDueDate,
          parsedDueDate: parsedDueDate >= parsedStartDate ? parsedDueDate : parsedStartDate,
        }
      })
      .sort(
        (firstTask, secondTask) =>
          firstTask.parsedStartDate.getTime() - secondTask.parsedStartDate.getTime(),
      )

    if (withDates.length === 0) {
      return null
    }

    const rangeStart = new Date(
      Math.min(...withDates.map((task) => task.parsedStartDate.getTime())),
    )
    const rangeEnd = new Date(
      Math.max(...withDates.map((task) => task.parsedDueDate.getTime())),
    )
    const totalDays = Math.max(1, dayDifference(rangeStart, rangeEnd) + 1)

    const markers = Array.from({ length: 6 }, (_, index) => {
      const ratio = index / 5
      const markerDate = new Date(rangeStart)
      markerDate.setDate(markerDate.getDate() + Math.round((totalDays - 1) * ratio))

      return {
        label: formatDate(markerDate),
        left: `${ratio * 100}%`,
      }
    })

    return {
      tasks: withDates,
      rangeStart,
      totalDays,
      markers,
    }
  }, [tasks])

  if (!timelineModel) {
    return (
      <section className="animate-fadeIn rounded-2xl border border-slate-700/70 bg-slate-900/50 p-6 text-center">
        <h3 className="font-display text-xl text-slate-50">Timeline</h3>
        <p className="mt-2 text-sm text-slate-400">
          Create tasks with start and due dates to render the timeline.
        </p>
      </section>
    )
  }

  return (
    <section className="animate-fadeIn rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 md:p-5">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Timeline</p>
        <h3 className="mt-1 font-display text-xl text-slate-50">Workspace delivery window</h3>
      </header>

      <div className="relative mt-6 grid grid-cols-[190px_1fr] gap-3 text-[11px] text-slate-500">
        <div />
        <div className="relative h-5">
          {timelineModel.markers.map((marker) => (
            <span
              key={`${marker.left}-${marker.label}`}
              className="absolute -translate-x-1/2"
              style={{ left: marker.left }}
            >
              {marker.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-1 space-y-3">
        {timelineModel.tasks.map((task) => {
          const offsetDays = dayDifference(timelineModel.rangeStart, task.parsedStartDate)
          const durationDays = Math.max(
            1,
            dayDifference(task.parsedStartDate, task.parsedDueDate) + 1,
          )
          const leftPercent = (offsetDays / timelineModel.totalDays) * 100
          const rawWidthPercent = (durationDays / timelineModel.totalDays) * 100
          const widthPercent = Math.min(Math.max(rawWidthPercent, 3), 100 - leftPercent)

          return (
            <article
              key={task.id}
              className="grid items-center gap-3 md:grid-cols-[190px_1fr]"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{task.title}</p>
                <p className="text-xs text-slate-500">
                  {formatDate(task.parsedStartDate)} - {formatDate(task.parsedDueDate)}
                </p>
              </div>

              <div className="relative h-11 rounded-xl border border-slate-800/80 bg-slate-950/70">
                <div
                  className={`absolute top-1/2 h-7 -translate-y-1/2 rounded-lg bg-gradient-to-r px-2 py-1 text-[11px] font-semibold text-slate-950 shadow-lg ${statusClasses[task.status] ?? statusClasses[TASK_STATUS_BACKLOG]}`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                  title={`${task.title}: ${durationDays} day${durationDays > 1 ? 's' : ''}`}
                >
                  <span className="truncate">{durationDays}d</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default TimelineView
