import { useEffect, useMemo, useRef } from 'react'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg']

const formatTimestamp = (value) => {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const resolveFileName = (message) => {
  if (message.fileName) {
    return message.fileName
  }

  if (typeof message.fileUrl !== 'string' || !message.fileUrl) {
    return 'Attachment'
  }

  const [pathPart] = message.fileUrl.split('?')
  const segments = pathPart.split('/')
  return decodeURIComponent(segments[segments.length - 1] || 'Attachment')
}

const isImageAttachment = (message) => {
  if (message.contentType?.startsWith('image/')) {
    return true
  }

  if (typeof message.fileUrl !== 'string') {
    return false
  }

  const normalized = message.fileUrl.toLowerCase()
  return IMAGE_EXTENSIONS.some((extension) => normalized.includes(extension))
}

function MessageList({ messages, isLoading, errorMessage }) {
  const bottomRef = useRef(null)

  const normalizedMessages = useMemo(
    () => (Array.isArray(messages) ? messages : []),
    [messages],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [normalizedMessages, isLoading])

  return (
    <section className="max-h-[420px] min-h-[260px] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4">
      {isLoading ? (
        <p className="text-sm text-slate-300">Loading...</p>
      ) : null}

      {!isLoading && errorMessage ? (
        <p className="rounded-xl border border-rose-400/45 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && normalizedMessages.length === 0 ? (
        <p className="text-sm text-slate-400">No discussions yet for this task.</p>
      ) : null}

      {!isLoading && !errorMessage && normalizedMessages.length > 0 ? (
        <ul className="space-y-3">
          {normalizedMessages.map((message) => (
            <li
              key={message.id ?? `${message.userName}-${message.createdAt}`}
              className="rounded-xl border border-slate-700/80 bg-slate-800/80 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-100">{message.userName}</p>
                <p className="text-xs text-slate-400">{formatTimestamp(message.createdAt)}</p>
              </div>

              {message.message ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {message.message}
                </p>
              ) : null}

              {message.fileUrl ? (
                <div className="mt-3 rounded-lg border border-cyan-400/30 bg-cyan-500/10 p-2.5">
                  {isImageAttachment(message) ? (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <img
                        src={message.fileUrl}
                        alt={resolveFileName(message)}
                        className="max-h-56 w-auto rounded-md border border-cyan-400/30 object-contain"
                      />
                    </a>
                  ) : null}

                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="mt-2 inline-flex rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/70 hover:bg-cyan-400/20"
                  >
                    {resolveFileName(message)}
                  </a>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div ref={bottomRef} />
    </section>
  )
}

export default MessageList

