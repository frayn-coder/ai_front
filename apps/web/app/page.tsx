'use client'

import { useEffect, useMemo } from 'react'

import { ChatLayout, MessageComposer, MessageList, SessionList } from '@ai-front/ui'
import { useSessionStore } from '@ai-front/domain'

export default function HomePage() {
  const sessions = useSessionStore((state) => state.sessions)
  const activeId = useSessionStore((state) => state.activeId)
  const createSession = useSessionStore((state) => state.createSession)
  const setActive = useSessionStore((state) => state.setActive)

  const activeSession = useMemo(() => sessions.find((session) => session.id === activeId) ?? null, [sessions, activeId])

  useEffect(() => {
    if (!activeSession && sessions.length === 0) {
      const session = createSession('General chat')
      setActive(session.id)
    }
  }, [activeSession, sessions.length, createSession, setActive])

  return (
    <ChatLayout
      sidebar={<SessionList onCreate={() => setActive(createSession('Untitled conversation').id)} />}
      header={
        activeSession ? (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-50">{activeSession.title}</h1>
              <p className="text-sm text-slate-400">Model · {activeSession.model}</p>
            </div>
            <div className="text-xs text-slate-500">Session ID: {activeSession.id}</div>
          </div>
        ) : null
      }
      footer={<MessageComposer />}
    >
      <MessageList />
    </ChatLayout>
  )
}
