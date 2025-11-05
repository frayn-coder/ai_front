'use client'

import { FormEvent, useState } from 'react'

import { createUserMessage, useMessageStore, useSessionStore } from '@ai-front/domain'
import type { SendMessagePayload } from '@ai-front/domain'
import { useMessageStream } from '@ai-front/transport'

export interface MessageComposerProps {
  onSend?: (payload: SendMessagePayload) => Promise<void> | void
}

const ensureActiveSession = () => {
  const store = useSessionStore.getState()
  if (store.activeId) {
    return store.activeId
  }
  const session = store.createSession('New conversation')
  store.setActive(session.id)
  return session.id
}

export const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const activeId = useSessionStore((state) => state.activeId)
  const upsertMessage = useMessageStore((state) => state.upsert)
  const [input, setInput] = useState('')

  const { start } = useMessageStream(activeId)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) {
      return
    }

    const sessionId = ensureActiveSession()
    const userMessage = createUserMessage(sessionId, input.trim())
    upsertMessage(userMessage)

    const payload: SendMessagePayload = {
      sessionId,
      prompt: input.trim()
    }

    setInput('')

    if (onSend) {
      await onSend(payload)
    }

    await start(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <textarea
        className="min-h-[3rem] flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 shadow-inner focus:border-emerald-400 focus:outline-none"
        placeholder="Ask anything..."
        value={input}
        rows={1}
        onChange={(event) => setInput(event.target.value)}
      />
      <button
        type="submit"
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400"
      >
        Send
      </button>
    </form>
  )
}
