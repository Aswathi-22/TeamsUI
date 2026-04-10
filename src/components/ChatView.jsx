function ChatView({ task, workspaceName }) {
  if (!task) {
    return (
      <section className="rounded-2xl border border-slate-700/80 bg-slate-950/55 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Chat</p>
        <h3 className="mt-2 font-display text-xl text-slate-50">No task selected</h3>
        <p className="mt-2 text-sm text-slate-400">
          Open the Tasks tab and click a task's <span className="font-semibold text-cyan-200">Chat</span>{' '}
          button to start a focused conversation here.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-700/80 bg-slate-950/55 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Chat</p>
        <h3 className="mt-2 font-display text-xl text-slate-50">{task.title}</h3>
        <p className="mt-1 text-sm text-slate-400">
          {workspaceName ? `Workspace: ${workspaceName}` : 'Workspace conversation'}
        </p>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-900/70 p-4">
        <div className="max-w-[80%] rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm text-cyan-100">
          Focused chat opened for this task.
        </div>
        <div className="max-w-[80%] rounded-xl border border-slate-700/80 bg-slate-800/80 p-3 text-sm text-slate-200">
          {task.description || 'No task description available.'}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700/80 bg-slate-900/65 p-3">
        <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Composer</p>
        <p className="mt-2 text-sm text-slate-300">
          This chat tab is now connected to task context in-app. We can wire this to Teams/bot APIs next.
        </p>
      </div>
    </section>
  )
}

export default ChatView
