import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import {
  TASK_STATUS_BACKLOG,
  TASK_STATUS_COMPLETED,
  TASK_STATUS_IN_PROGRESS,
  TASK_STATUS_META,
  TASK_STATUS_ORDER,
  TASK_STATUS_TODO,
  normalizeTaskStatus,
} from '../constants/taskStatus'
import TaskCard from './TaskCard'

const COLUMN_TONE_CLASSES = {
  [TASK_STATUS_BACKLOG]: {
    chip: 'border-slate-600/80 bg-slate-800/85 text-slate-300',
    accent: 'bg-slate-500',
  },
  [TASK_STATUS_TODO]: {
    chip: 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100',
    accent: 'bg-indigo-400',
  },
  [TASK_STATUS_IN_PROGRESS]: {
    chip: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
    accent: 'bg-cyan-400',
  },
  [TASK_STATUS_COMPLETED]: {
    chip: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
    accent: 'bg-emerald-400',
  },
}

const getColumnDropId = (status) => `column:${status}`

const getStatusFromDropId = (dropId) => {
  if (typeof dropId !== 'string' || !dropId.startsWith('column:')) {
    return null
  }

  return normalizeTaskStatus(dropId.slice('column:'.length))
}

const resolveDropStatus = (over) => {
  if (!over) {
    return null
  }

  const overStatus = over.data?.current?.status
  if (typeof overStatus === 'string') {
    return normalizeTaskStatus(overStatus)
  }

  return getStatusFromDropId(over.id)
}

function DraggableTaskCard({
  task,
  dependencyTitles,
  isHighlighted = false,
  onTaskChatRequest,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: 'task',
        taskId: task.id,
        status: task.status,
      },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-35' : 'opacity-100'
      }`}
    >
      <TaskCard
        task={task}
        dependencyTitles={dependencyTitles}
        isHighlighted={isHighlighted}
        onAskInChat={onTaskChatRequest}
      />
    </div>
  )
}

function StatusColumn({
  status,
  tasks,
  dependencyTitleMap,
  highlightedTaskId,
  onTaskChatRequest,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: getColumnDropId(status),
    data: {
      type: 'column',
      status,
    },
  })

  const tone = COLUMN_TONE_CLASSES[status] ?? COLUMN_TONE_CLASSES[TASK_STATUS_BACKLOG]

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border bg-slate-900/60 p-2.5 transition duration-200 md:p-3 ${
        isOver
          ? 'border-cyan-300/70 shadow-[0_0_0_1px_rgba(34,211,238,0.45)]'
          : 'border-slate-700/70'
      }`}
    >
      <header className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${tone.accent}`} />
          <h3 className="font-display text-base text-slate-50">
            {TASK_STATUS_META[status]?.label ?? 'Backlog'}
          </h3>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${tone.chip}`}>
          {tasks.length}
        </span>
      </header>

      <div className="space-y-2.5">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              isHighlighted={task.id === highlightedTaskId}
              onTaskChatRequest={onTaskChatRequest}
              dependencyTitles={task.dependencies
                .map((dependencyId) => dependencyTitleMap.get(dependencyId))
                .filter(Boolean)}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-slate-700/80 p-3 text-xs text-slate-500">
            Drop tasks here.
          </p>
        )}
      </div>
    </section>
  )
}

function KanbanBoard({
  tasksByStatus,
  dependencyTitleMap,
  onTaskStatusChange,
  highlightedTaskId,
  onTaskChatRequest,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )
  const [activeTaskId, setActiveTaskId] = useState(null)

  const allTasks = useMemo(
    () =>
      TASK_STATUS_ORDER.flatMap((status) => {
        const statusTasks = tasksByStatus[status] ?? []
        return statusTasks
      }),
    [tasksByStatus],
  )

  const activeTask = useMemo(
    () => allTasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, allTasks],
  )

  const handleDragStart = (event) => {
    const draggedTaskId = event.active?.data?.current?.taskId
    if (draggedTaskId) {
      setActiveTaskId(draggedTaskId)
    }
  }

  const handleDragCancel = () => {
    setActiveTaskId(null)
  }

  const handleDragEnd = (event) => {
    const taskId = event.active?.data?.current?.taskId
    const fromStatus = normalizeTaskStatus(event.active?.data?.current?.status)
    const toStatus = resolveDropStatus(event.over)

    if (taskId && toStatus && fromStatus !== toStatus) {
      onTaskStatusChange(taskId, toStatus)
    }

    setActiveTaskId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="animate-fadeIn grid gap-3.5 xl:grid-cols-4 md:grid-cols-2">
        {TASK_STATUS_ORDER.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] ?? []}
            dependencyTitleMap={dependencyTitleMap}
            highlightedTaskId={highlightedTaskId}
            onTaskChatRequest={onTaskChatRequest}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-[280px] rotate-[1.2deg] opacity-95">
            <TaskCard
              task={activeTask}
              dependencyTitles={activeTask.dependencies
                .map((dependencyId) => dependencyTitleMap.get(dependencyId))
                .filter(Boolean)}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard
