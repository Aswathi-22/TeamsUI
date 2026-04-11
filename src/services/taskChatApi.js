const CHAT_API_BASE_URL = (
  import.meta.env.VITE_CHAT_API_BASE_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '')

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(value)

const normalizeFileUrl = (fileUrl) => {
  if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
    return null
  }

  const normalized = fileUrl.trim()
  if (isAbsoluteHttpUrl(normalized)) {
    return normalized
  }

  if (normalized.startsWith('/')) {
    return `${CHAT_API_BASE_URL}${normalized}`
  }

  return `${CHAT_API_BASE_URL}/${normalized}`
}

const parseJsonSafely = async (response) => {
  try {
    return await response.json()
  } catch {
    return null
  }
}

const buildErrorFromResponse = async (response, fallbackMessage) => {
  const payload = await parseJsonSafely(response)
  const apiMessage = payload?.detail ?? payload?.message
  const message =
    typeof apiMessage === 'string' && apiMessage.trim()
      ? apiMessage
      : fallbackMessage
  return new Error(message)
}

const mapMessage = (item) => ({
  id: item.id,
  taskId: item.task_id,
  userName: item.user_name ?? 'Unknown',
  message: item.message ?? '',
  fileUrl: normalizeFileUrl(item.file_url),
  createdAt: item.created_at,
  fileName: item.file_name ?? null,
  contentType: item.content_type ?? null,
})

export const fetchTaskMessages = async (taskId, signal) => {
  const response = await fetch(
    `${CHAT_API_BASE_URL}/chat/${encodeURIComponent(taskId)}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal,
    },
  )

  if (!response.ok) {
    throw await buildErrorFromResponse(response, 'Unable to load chat messages.')
  }

  const payload = await response.json()
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map(mapMessage)
}

export const sendTaskMessage = async ({
  taskId,
  userName,
  message,
  fileUrl,
  fileName,
  contentType,
}) => {
  const response = await fetch(`${CHAT_API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      user_name: userName,
      message,
      file_url: fileUrl,
      file_name: fileName,
      content_type: contentType,
    }),
  })

  if (!response.ok) {
    throw await buildErrorFromResponse(response, 'Unable to send message.')
  }

  const payload = await response.json()
  return mapMessage(payload)
}

export const uploadTaskChatFile = async (file) => {
  if (!(file instanceof File)) {
    throw new Error('A file is required.')
  }

  const isPdf = file.type === 'application/pdf'
  const isImage = file.type.startsWith('image/')
  if (!isPdf && !isImage) {
    throw new Error('Only PDF and image files are allowed.')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${CHAT_API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw await buildErrorFromResponse(response, 'Unable to upload file.')
  }

  const payload = await response.json()
  return {
    fileUrl: normalizeFileUrl(payload.file_url),
    fileName: payload.file_name ?? file.name,
    contentType: payload.content_type ?? file.type,
  }
}
