import axios from 'axios'
import { TASK_STATUS, normalizeTaskStatus } from '../constants/taskStatus'
import { useWorkspaceStore } from '../store/useWorkspaceStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

const createWorkspaceId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const createWorkspace = async (data) => {
  const name = data.name?.trim() ?? ''
  if (!name) {
    throw new Error('Workspace name is required')
  }

  const newWorkspace = {
    id: createWorkspaceId(),
    name,
    description: data.description?.trim() ?? '',
  }

  // CURRENT (local)
  useWorkspaceStore.getState().addWorkspace(newWorkspace)
  useWorkspaceStore.getState().setActiveWorkspace(newWorkspace.id)

  // FUTURE (Space Lean API)
  // await apiClient.post('/workspaces', data)
  return newWorkspace
}

export const fetchWorkspaces = async () => {
  // currently local
  const localWorkspaces = useWorkspaceStore.getState().workspaces

  // later replace with:
  // const { data } = await apiClient.get('/workspaces')
  // return data
  return localWorkspaces
}

export const createTask = async (task) => {
  const payload = {
    ...task,
    status: TASK_STATUS.BACKLOG,
  }

  // currently local
  useWorkspaceStore.getState().addTask(payload)

  // later replace with:
  // await apiClient.post('/tasks', payload)
  return payload
}

export const updateTaskStatus = async (taskId, status) => {
  const normalizedStatus = normalizeTaskStatus(status)

  // currently local
  useWorkspaceStore.getState().updateTaskStatus(taskId, normalizedStatus)

  // later replace with:
  // await apiClient.patch(`/tasks/${taskId}`, { status: normalizedStatus })
  return normalizedStatus
}

export const fetchTasks = async (workspaceId) => {
  // currently local
  const localTasks = useWorkspaceStore
    .getState()
    .getTasksByWorkspace(workspaceId)
    .map((task) => ({
      ...task,
      status: normalizeTaskStatus(task.status),
    }))

  // later replace with:
  // const { data } = await apiClient.get(`/tasks?workspace=${workspaceId}`)
  // return data.map((task) => ({ ...task, status: normalizeTaskStatus(task.status) }))
  return localTasks
}
