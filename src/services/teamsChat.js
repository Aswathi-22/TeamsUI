const DEFAULT_APP_ID = 'c1a9b8f2-7d4e-4a8b-9c1f-123456789abc'
const DEFAULT_ENTITY_ID = 'spaceflow'
const DEFAULT_APP_BASE_URL = 'https://project-mh4zv.vercel.app'

const getAppBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_APP_BASE_URL
  if (configuredBaseUrl) {
    return configuredBaseUrl
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  return DEFAULT_APP_BASE_URL
}

const parseLeadUsers = (usersConfig) =>
  `${usersConfig ?? ''}`
    .split(',')
    .map((user) => user.trim())
    .filter(Boolean)

export const buildTaskEntityDeepLink = ({ workspaceId, taskId, taskTitle }) => {
  const appId = import.meta.env.VITE_TEAMS_APP_ID ?? DEFAULT_APP_ID
  const entityId = import.meta.env.VITE_TEAMS_APP_ENTITY_ID ?? DEFAULT_ENTITY_ID

  const webUrl = new URL(`/workspace/${workspaceId}`, getAppBaseUrl())
  webUrl.searchParams.set('tab', 'tasks')
  webUrl.searchParams.set('task', taskId)

  const context = {
    subEntityId: `task:${taskId}`,
    taskId,
    workspaceId,
  }

  const query = new URLSearchParams({
    webUrl: webUrl.toString(),
    label: taskTitle,
    context: JSON.stringify(context),
  })

  return `https://teams.microsoft.com/l/entity/${encodeURIComponent(appId)}/${encodeURIComponent(
    entityId,
  )}?${query.toString()}`
}

const buildChatMessage = ({ taskTitle, workspaceName, query, taskDeepLink }) =>
  [
    `Task query: ${taskTitle}`,
    workspaceName ? `Workspace: ${workspaceName}` : null,
    `Question: ${query}`,
    `Open in SpaceFlow: ${taskDeepLink}`,
  ]
    .filter(Boolean)
    .join('\n')

export const openTaskQueryInTeamsChat = ({
  task,
  query,
  workspaceId,
  workspaceName,
}) => {
  if (typeof window === 'undefined') {
    return null
  }

  const normalizedQuery = `${query ?? ''}`.trim()
  if (!task?.id || !workspaceId || !normalizedQuery) {
    return null
  }

  const taskDeepLink = buildTaskEntityDeepLink({
    workspaceId,
    taskId: task.id,
    taskTitle: task.title ?? 'Task',
  })

  const chatMessage = buildChatMessage({
    taskTitle: task.title ?? 'Task',
    workspaceName,
    query: normalizedQuery,
    taskDeepLink,
  })

  const chatParams = new URLSearchParams({
    message: chatMessage,
    topicName: `Task Query: ${task.title ?? 'Task'}`,
  })

  const leadUsers = parseLeadUsers(import.meta.env.VITE_TEAMS_LEAD_USERS)
  if (leadUsers.length > 0) {
    chatParams.set('users', leadUsers.join(','))
  }

  const chatDeepLink = `https://teams.microsoft.com/l/chat/0/0?${chatParams.toString()}`

  const popup = window.open(chatDeepLink, '_blank', 'noopener,noreferrer')
  if (!popup) {
    window.location.assign(chatDeepLink)
  }

  return {
    chatDeepLink,
    taskDeepLink,
  }
}
