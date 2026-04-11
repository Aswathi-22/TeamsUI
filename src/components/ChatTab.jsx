import { useCallback, useEffect, useState } from 'react'
import { fetchTaskMessages, sendTaskMessage, uploadTaskChatFile } from '../services/taskChatApi'
import { useWorkspaceStore } from '../store/useWorkspaceStore'
import MessageInput from './chat/MessageInput'
import MessageList from './chat/MessageList'
import TaskContextBox from './chat/TaskContextBox'

const getErrorMessage = (error, fallback) =>
  error instanceof Error ? error.message : fallback

function ChatTab({ workspaceName }) {
  const selectedTask = useWorkspaceStore((state) => state.selectedTask)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadMessages = useCallback(async (taskId, signal) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const nextMessages = await fetchTaskMessages(taskId, signal)
      setMessages(nextMessages)
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }

      setMessages([])
      setErrorMessage(getErrorMessage(error, 'Unable to load chat messages.'))
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!selectedTask?.id) {
      setMessages([])
      setErrorMessage('')
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    void loadMessages(selectedTask.id, controller.signal)

    return () => {
      controller.abort()
    }
  }, [loadMessages, selectedTask?.id])

  const handleSend = async ({ userName, message, file }) => {
    if (!selectedTask?.id) {
      throw new Error('Select a task to start chat.')
    }

    setIsSending(true)
    setErrorMessage('')

    try {
      let fileUrl = null
      let fileName = null
      let contentType = null
      if (file) {
        const uploadResult = await uploadTaskChatFile(file)
        fileUrl = uploadResult.fileUrl
        fileName = uploadResult.fileName
        contentType = uploadResult.contentType
      }

      await sendTaskMessage({
        taskId: selectedTask.id,
        userName,
        message,
        fileUrl,
        fileName,
        contentType,
      })

      await loadMessages(selectedTask.id)
    } catch (error) {
      const nextError = getErrorMessage(error, 'Unable to send message.')
      setErrorMessage(nextError)
      throw error
    } finally {
      setIsSending(false)
    }
  }

  if (!selectedTask) {
    return (
      <section className="rounded-2xl border border-slate-700/80 bg-slate-950/55 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Task Chat</p>
        <h3 className="mt-2 font-display text-xl text-slate-50">No task selected</h3>
        <p className="mt-2 text-sm text-slate-400">Select a task to start chat.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-950/55 p-5">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Task Chat</p>
        <h2 className="mt-2 font-display text-xl text-slate-50">{selectedTask.title}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {workspaceName ? `Shared workspace chat - ${workspaceName}` : 'Shared workspace chat'}
        </p>
      </header>

      <TaskContextBox task={selectedTask} />
      <MessageList messages={messages} isLoading={isLoading} errorMessage={errorMessage} />
      <MessageInput
        onSend={handleSend}
        isSending={isSending}
        isDisabled={!selectedTask?.id}
      />
    </section>
  )
}

export default ChatTab
