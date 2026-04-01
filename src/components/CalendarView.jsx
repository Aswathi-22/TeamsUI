import { useMemo, useState } from 'react'

const weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toISODate = (date) => date.toISOString().slice(0, 10)

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function CalendarView({ tasks }) {
  const [viewDate, setViewDate] = useState(() => new Date())

  const monthStart = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1),
    [viewDate],
  )

  const monthTitle = useMemo(
    () =>
      monthStart.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [monthStart],
  )

  const calendarDays = useMemo(() => {
    const firstDayIndex = (monthStart.getDay() + 6) % 7
    const gridStart = addDays(monthStart, -firstDayIndex)

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  }, [monthStart])

  const tasksByDueDate = useMemo(
    () =>
      tasks.reduce((accumulator, task) => {
        if (!task.dueDate) {
          return accumulator
        }

        if (!accumulator[task.dueDate]) {
          accumulator[task.dueDate] = []
        }

        accumulator[task.dueDate].push(task)
        return accumulator
      }, {}),
    [tasks],
  )

  return (
    <section className="animate-fadeIn rounded-2xl border border-slate-700/70 bg-slate-900/50 p-4 md:p-5">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Calendar</p>
          <h3 className="mt-1 font-display text-xl text-slate-50">{monthTitle}</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
              )
            }
            className="rounded-xl border border-slate-700/80 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setViewDate(
                (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
              )
            }
            className="rounded-xl border border-slate-700/80 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            Next
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.12em] text-slate-500">
        {weekDayLabels.map((weekDay) => (
          <span key={weekDay} className="rounded-lg bg-slate-800/50 py-2">
            {weekDay}
          </span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {calendarDays.map((date) => {
          const isoDate = toISODate(date)
          const dayTasks = tasksByDueDate[isoDate] ?? []
          const isCurrentMonth = date.getMonth() === monthStart.getMonth()

          return (
            <article
              key={isoDate}
              className={`min-h-24 rounded-xl border p-2 transition md:min-h-32 ${
                isCurrentMonth
                  ? 'border-slate-700/70 bg-slate-900/65'
                  : 'border-slate-800/70 bg-slate-900/35'
              }`}
            >
              <p
                className={`text-xs ${
                  isCurrentMonth ? 'text-slate-200' : 'text-slate-600'
                }`}
              >
                {date.getDate()}
              </p>

              <div className="mt-2 space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border border-cyan-400/30 bg-cyan-500/12 px-2 py-1 text-[11px] text-cyan-100"
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 ? (
                  <p className="text-[11px] text-slate-400">
                    +{dayTasks.length - 2} more tasks
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default CalendarView
