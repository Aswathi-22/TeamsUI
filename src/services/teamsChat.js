const DEFAULT_APP_ID = 'c1a9b8f2-7d4e-4a8b-9c1f-123456789abc'
const DEFAULT_ENTITY_ID = 'spaceflow'
const DEFAULT_APP_BASE_URL = 'https://project-mh4zv.vercel.app'
const RECIPIENT_STORAGE_KEY = 'spaceflow.chatRecipients'
const DEFAULT_RECIPIENT_PROMPT =
  'Enter team lead/manager email(s), comma-separated (for example: lead@company.com):'

let teamsSdkPromise = null

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

const readStoredRecipients = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return []
  }

  return parseLeadUsers(window.localStorage.getItem(RECIPIENT_STORAGE_KEY))
}

const writeStoredRecipients = (recipients) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }

  window.localStorage.setItem(RECIPIENT_STORAGE_KEY, recipients.join(','))
}

const resolveRecipients = () => {
  const configuredUsers = parseLeadUsers(import.meta.env.VITE_TEAMS_LEAD_USERS)
  if (configuredUsers.length > 0) {
    return configuredUsers
  }

  const storedUsers = readStoredRecipients()
  if (storedUsers.length > 0) {
    return storedUsers
  }

  if (typeof window === 'undefined') {
    return []
  }

  const promptedUsers = window.prompt(DEFAULT_RECIPIENT_PROMPT, '')
  if (promptedUsers === null) {
    return null
  }

  const parsedRecipients = parseLeadUsers(promptedUsers)
  if (parsedRecipients.length > 0) {
    writeStoredRecipients(parsedRecipients)
  }

  return parsedRecipients
}

const buildTeamsChatDeepLink = ({ users, topicName, message, tenantId }) => {
  const query = new URLSearchParams({
    users: users.join(','),
    topicName,
    message,
  })

  if (tenantId) {
    query.set('tenantId', tenantId)
  }

  return `https://teams.microsoft.com/l/chat/0/0?${query.toString()}`
}

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

const openExternalTeamsLink = (deepLink) => {
  if (typeof window === 'undefined') {
    return false
  }

  const popup = window.open(deepLink, '_blank', 'noopener,noreferrer')
  if (popup) {
    return true
  }

  try {
    window.location.assign(deepLink)
    return true
  } catch {
    return false
  }
}

const loadTeamsSdk = async () => {
  if (typeof window === 'undefined') {
    return null
  }

  if (!teamsSdkPromise) {
    teamsSdkPromise = (async () => {
      try {
        const teamsSdk = await import('@microsoft/teams-js')
        await teamsSdk.app.initialize()
        return teamsSdk
      } catch {
        return null
      }
    })()
  }

  return teamsSdkPromise
}

const openUsingTeamsSdk = async ({ recipients, topicName, message, chatDeepLink }) => {
  const teamsSdk = await loadTeamsSdk()
  if (!teamsSdk) {
    return false
  }

  try {
    if (teamsSdk.chat?.isSupported()) {
      if (recipients.length === 1) {
        await teamsSdk.chat.openChat({
          user: recipients[0],
          message,
        })
      } else {
        await teamsSdk.chat.openGroupChat({
          users: recipients,
          topic: topicName,
          message,
        })
      }
      return true
    }
  } catch {
    // Fallback to generic openLink and then browser navigation.
  }

  try {
    if (teamsSdk.app?.openLink) {
      await teamsSdk.app.openLink(chatDeepLink)
      return true
    }
  } catch {
    return false
  }

  return false
}

export const openTaskQueryInTeamsChat = async ({
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

  const recipients = resolveRecipients()
  if (recipients === null) {
    return { status: 'cancelled' }
  }

  if (recipients.length === 0) {
    window.alert(
      'Add at least one manager email. Set VITE_TEAMS_LEAD_USERS or enter recipients when prompted.',
    )
    return { status: 'missing-recipients' }
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
  const topicName = `Task Query: ${task.title ?? 'Task'}`
  const tenantId = import.meta.env.VITE_TEAMS_TENANT_ID

  const chatDeepLink = buildTeamsChatDeepLink({
    users: recipients,
    topicName,
    message: chatMessage,
    tenantId,
  })

  const openedInTeams = await openUsingTeamsSdk({
    recipients,
    topicName,
    message: chatMessage,
    chatDeepLink,
  })

  if (!openedInTeams) {
    const openedExternally = openExternalTeamsLink(chatDeepLink)
    if (!openedExternally) {
      window.alert('Unable to open Teams chat. Please open Microsoft Teams and try again.')
      return {
        status: 'failed',
        chatDeepLink,
        taskDeepLink,
      }
    }
  }

  return {
    status: 'opened',
    recipients,
    chatDeepLink,
    taskDeepLink,
  }
}
