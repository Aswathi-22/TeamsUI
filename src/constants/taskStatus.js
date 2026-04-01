export const TASK_STATUS = Object.freeze({
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'inprogress',
  COMPLETED: 'completed',
})

export const TASK_STATUS_BACKLOG = TASK_STATUS.BACKLOG
export const TASK_STATUS_TODO = TASK_STATUS.TODO
export const TASK_STATUS_IN_PROGRESS = TASK_STATUS.IN_PROGRESS
export const TASK_STATUS_COMPLETED = TASK_STATUS.COMPLETED

export const TASK_STATUS_ORDER = [
  TASK_STATUS.BACKLOG,
  TASK_STATUS.TODO,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.COMPLETED,
]

export const TASK_STATUS_META = Object.freeze({
  [TASK_STATUS.BACKLOG]: {
    label: 'Backlog',
  },
  [TASK_STATUS.TODO]: {
    label: 'To Do',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'In Progress',
  },
  [TASK_STATUS.COMPLETED]: {
    label: 'Completed',
  },
})

const STATUS_ALIAS_MAP = Object.freeze({
  backlog: TASK_STATUS.BACKLOG,
  todo: TASK_STATUS.TODO,
  inprogress: TASK_STATUS.IN_PROGRESS,
  completed: TASK_STATUS.COMPLETED,
  done: TASK_STATUS.COMPLETED,
})

export const normalizeTaskStatus = (rawStatus) => {
  if (typeof rawStatus !== 'string') {
    return TASK_STATUS.BACKLOG
  }

  const normalized = rawStatus.trim().toLowerCase().replace(/[\s_-]/g, '')
  return STATUS_ALIAS_MAP[normalized] ?? TASK_STATUS.BACKLOG
}
