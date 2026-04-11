import { useMemo, useRef, useState } from 'react'

const USER_NAME_STORAGE_KEY = 'spaceflow.chat.username'
const DEFAULT_USER_NAME = 'Purnav'

const validateFileType = (file) => {
  if (!file) {
    return true
  }

  const isPdf = file.type === 'application/pdf'
  const isImage = file.type.startsWith('image/')
  return isPdf || isImage
}

function MessageInput({ onSend, isSending = false, isDisabled = false }) {
  const initialUserName = useMemo(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_USER_NAME
    }

    const stored = localStorage.getItem(USER_NAME_STORAGE_KEY)
    return stored?.trim() || DEFAULT_USER_NAME
  }, [])

  const [userName, setUserName] = useState(initialUserName)
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [inputError, setInputError] = useState('')
  const fileInputRef = useRef(null)

  const handlePickFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }

    if (!validateFileType(file)) {
      setInputError('Only PDF and image files are allowed.')
      setSelectedFile(null)
      return
    }

    setInputError('')
    setSelectedFile(file)
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedUserName = userName.trim()
    const trimmedMessage = messageText.trim()

    if (!trimmedUserName) {
      setInputError('User name is required.')
      return
    }

    if (!trimmedMessage && !selectedFile) {
      setInputError('Type a message or attach a file.')
      return
    }

    if (selectedFile && !validateFileType(selectedFile)) {
      setInputError('Only PDF and image files are allowed.')
      return
    }

    setInputError('')

    try {
      await onSend({
        userName: trimmedUserName,
        message: trimmedMessage,
        file: selectedFile,
      })
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Unable to send message.')
      return
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_NAME_STORAGE_KEY, trimmedUserName)
    }

    setMessageText('')
    clearFile()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-900/65 p-4"
    >
      <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">User Name</span>
          <input
            type="text"
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-800/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            disabled={isDisabled || isSending}
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs uppercase tracking-[0.12em] text-slate-400">Message</span>
          <textarea
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            placeholder="Ask a question about this task..."
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700/80 bg-slate-800/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/60"
            disabled={isDisabled || isSending}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled || isSending}
        />

        <button
          type="button"
          onClick={handlePickFile}
          className="rounded-lg border border-slate-700/80 bg-slate-800/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-200 transition hover:border-cyan-400/45 hover:text-cyan-100"
          disabled={isDisabled || isSending}
        >
          Attach File
        </button>

        {selectedFile ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-100">
            {selectedFile.name}
            <button
              type="button"
              onClick={clearFile}
              className="font-semibold text-cyan-200 hover:text-cyan-100"
              disabled={isDisabled || isSending}
            >
              x
            </button>
          </span>
        ) : null}

        <button
          type="submit"
          className="ml-auto rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isDisabled || isSending}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {inputError ? <p className="text-xs text-rose-200">{inputError}</p> : null}
    </form>
  )
}

export default MessageInput
