import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { produce } from 'immer'

import type { Session } from '../types'

type SessionState = {
  sessions: Session[]
  activeId: string | null
  createSession: (title?: string) => Session
  setActive: (sessionId: string) => void
  upsert: (session: Session) => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeId: null,
  createSession(title) {
    const session: Session = {
      id: nanoid(),
      title: title ?? 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: 'gpt-4',
      systemPrompt: undefined,
      pinnedTools: [],
      participants: []
    }
    set((state) =>
      produce(state, (draft) => {
        draft.sessions.unshift(session)
        draft.activeId = session.id
      })
    )
    return session
  },
  setActive(sessionId) {
    set((state) =>
      produce(state, (draft) => {
        draft.activeId = sessionId
        const session = draft.sessions.find((s) => s.id === sessionId)
        if (session) {
          session.updatedAt = Date.now()
        }
      })
    )
  },
  upsert(session) {
    set((state) =>
      produce(state, (draft) => {
        const idx = draft.sessions.findIndex((s) => s.id === session.id)
        if (idx >= 0) {
          draft.sessions[idx] = session
        } else {
          draft.sessions.unshift(session)
        }
      })
    )
  }
}))
