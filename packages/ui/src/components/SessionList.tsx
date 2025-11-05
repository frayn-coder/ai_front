'use client'

import clsx from 'clsx'
import { useMemo } from 'react'

import { useSessionStore } from '@ai-front/domain'

export interface SessionListProps {
  onCreate?: () => void
}

export const SessionList = ({ onCreate }: SessionListProps) => {
  const sessions = useSessionStore((state) => state.sessions)
  const activeId = useSessionStore((state) => state.activeId)
  const setActive = useSessionStore((state) => state.setActive)

  const sorted = useMemo(() => sessions.slice().sort((a, b) => b.updatedAt - a.updatedAt), [sessions])

  return (
    <div className="flex h-full flex-col gap-4">
      <button
        type="button"
        className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        onClick={onCreate}
      >
        New session
      </button>
      <ul className="flex-1 space-y-1 overflow-y-auto pr-2 text-sm">
        {sorted.map((session) => (
          <li key={session.id}>
            <button
              type="button"
              className={clsx(
                'w-full rounded-md px-3 py-2 text-left transition-colors',
                activeId === session.id ? 'bg-slate-800 text-emerald-300' : 'hover:bg-slate-800/60'
              )}
              onClick={() => setActive(session.id)}
            >
              <div className="font-semibold">{session.title}</div>
              <div className="text-xs text-slate-400">{new Date(session.updatedAt).toLocaleString()}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
