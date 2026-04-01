import { useEffect, useState } from 'react'

const buildInitialFormState = () => ({
  name: '',
  description: '',
})

function CreateWorkspaceModal({ isOpen, onClose, onCreate }) {
  const [formState, setFormState] = useState(buildInitialFormState)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormState(buildInitialFormState())
    setErrorMessage('')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const onEscape = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [isOpen, isSubmitting, onClose])

  const onInputChange = (event) => {
    const { name, value } = event.target
    setFormState((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmedName = formState.name.trim()
    if (!trimmedName) {
      setErrorMessage('Workspace name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate({
        name: trimmedName,
        description: formState.description.trim(),
      })
      onClose()
    } catch {
      setErrorMessage('Unable to create workspace right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl border border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-panel animate-fadeIn md:p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">
              Create Workspace
            </p>
            <h2 className="mt-2 font-display text-2xl text-slate-50">
              New workspace
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-700/80 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </header>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="workspace-name">
              Workspace Name
            </label>
            <input
              id="workspace-name"
              name="name"
              value={formState.name}
              onChange={onInputChange}
              placeholder="Growth Sprint"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="workspace-description">
              Description
            </label>
            <textarea
              id="workspace-description"
              name="description"
              value={formState.description}
              onChange={onInputChange}
              rows={4}
              placeholder="Optional context about this workspace."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700/80 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateWorkspaceModal
