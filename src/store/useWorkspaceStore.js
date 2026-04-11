import { create } from 'zustand'
import { TASK_STATUS, normalizeTaskStatus } from '../constants/taskStatus'
import { mockTasks, mockWorkspaces } from '../data/mockData'

const createTaskId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const createWorkspaceId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const normalizeDependencies = (dependencies, workspaceId, tasks) => {
  if (!Array.isArray(dependencies) || dependencies.length === 0) {
    return []
  }

  const workspaceTaskIds = new Set(
    tasks
      .filter((task) => task.workspaceId === workspaceId)
      .map((task) => task.id),
  )

  return dependencies.filter((dependencyId) => workspaceTaskIds.has(dependencyId))
}

export const useWorkspaceStore = create((set, get) => ({
  workspaces: mockWorkspaces,
  tasks: mockTasks.map((task) => ({
    ...task,
    status: normalizeTaskStatus(task.status),
  })),
  activeWorkspaceId: mockWorkspaces[0]?.id ?? null,
  selectedTask: null,

  addWorkspace: (workspaceInput) =>
    set((state) => {
      const name = workspaceInput.name?.trim() ?? ''
      if (!name) {
        return state
      }

      const workspace = {
        id: workspaceInput.id ?? createWorkspaceId(),
        name,
        description: workspaceInput.description?.trim() ?? '',
      }

      const alreadyExists = state.workspaces.some(
        (existingWorkspace) => existingWorkspace.id === workspace.id,
      )

      if (alreadyExists) {
        return state
      }

      return {
        workspaces: [...state.workspaces, workspace],
      }
    }),

  setActiveWorkspace: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
  setActiveWorkspaceId: (workspaceId) => set({ activeWorkspaceId: workspaceId }),
  setSelectedTask: (task) =>
    set({
      selectedTask: task
        ? {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority,
          }
        : null,
    }),
  clearSelectedTask: () => set({ selectedTask: null }),

  addTask: (taskInput) =>
    set((state) => {
      const workspaceId = taskInput.workspaceId ?? state.activeWorkspaceId

      if (!workspaceId) {
        return state
      }

      const task = {
        id: taskInput.id ?? createTaskId(),
        title: taskInput.title?.trim() ?? '',
        description: taskInput.description?.trim() ?? '',
        status: normalizeTaskStatus(taskInput.status ?? TASK_STATUS.BACKLOG),
        priority: taskInput.priority ?? 'medium',
        startDate: taskInput.startDate ?? '',
        dueDate: taskInput.dueDate ?? '',
        dependencies: normalizeDependencies(
          taskInput.dependencies,
          workspaceId,
          state.tasks,
        ),
        workspaceId,
      }

      return {
        tasks: [task, ...state.tasks],
      }
    }),
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task
        }

        return {
          ...task,
          status: normalizeTaskStatus(newStatus),
        }
      }),
    })),

  getTasksByWorkspace: (workspaceId) =>
    get().tasks.filter((task) => task.workspaceId === workspaceId),

  getTasksByStatus: (workspaceId, status) => {
    const normalizedStatus = normalizeTaskStatus(status)

    return get().tasks.filter(
      (task) =>
        task.workspaceId === workspaceId &&
        normalizeTaskStatus(task.status) === normalizedStatus,
    )
  },
}))
