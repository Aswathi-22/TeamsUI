const DEFAULT_APP_ID = 'c1a9b8f2-7d4e-4a8b-9c1f-123456789abc'
const DEFAULT_ENTITY_ID = 'spaceflow'
const DEFAULT_APP_BASE_URL = 'https://project-mh4zv.vercel.app'

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

const buildTeamsBotChatDeepLink = ({ botId, message, tenantId }) => {
  const query = new URLSearchParams({
    users: `28:${botId}`,
    message,
  })

  if (tenantId) {
    query.set('tenantId', tenantId)
  }

  return `https://teams.microsoft.com/l/chat/0/0?${query.toString()}`
}

const buildTeamsAppConversationDeepLink = ({ tenantId }) => {
  const appId = import.meta.env.VITE_TEAMS_APP_ID ?? DEFAULT_APP_ID
  const query = new URLSearchParams()

  if (tenantId) {
    query.set('tenantId', tenantId)
  }

  const queryString = query.toString()
  const encodedAppId = encodeURIComponent(appId)
  return queryString
    ? `https://teams.microsoft.com/l/entity/${encodedAppId}/conversations?${queryString}`
    : `https://teams.microsoft.com/l/entity/${encodedAppId}/conversations`
}

const resolveBotId = () => {
  const configuredBotId = `${import.meta.env.VITE_TEAMS_BOT_ID ?? ''}`.trim()
  return configuredBotId || null
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
    query ? `Question: ${query}` : null,
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

const openUsingTeamsSdk = async ({ botRecipient, message, chatDeepLink }) => {
  const teamsSdk = await loadTeamsSdk()
  if (!teamsSdk) {
    return false
  }

  try {
    if (botRecipient && message && teamsSdk.chat?.isSupported()) {
      await teamsSdk.chat.openChat({
        user: botRecipient,
        message,
      })
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
  if (!task?.id || !workspaceId) {
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
  const tenantId = import.meta.env.VITE_TEAMS_TENANT_ID
  const botId = resolveBotId()

  const chatDeepLink = botId
    ? buildTeamsBotChatDeepLink({
        botId,
        message: chatMessage,
        tenantId,
      })
    : buildTeamsAppConversationDeepLink({ tenantId })

  const openedInTeams = await openUsingTeamsSdk({
    botRecipient: botId ? `28:${botId}` : null,
    message: botId ? chatMessage : null,
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
    mode: botId ? 'bot-chat' : 'app-conversation',
    botId,
    chatDeepLink,
    taskDeepLink,
  }
}
