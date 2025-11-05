'use client'

import { useMemo, useRef, useEffect } from 'react'

import { useMessageStore } from '@ai-front/domain'
import { RenderBlock } from '@ai-front/renderers'

export const MessageList = () => {
  const order = useMessageStore((state) => state.order)
  const byId = useMessageStore((state) => state.byId)
  const endRef = useRef<HTMLDivElement | null>(null)

  const messages = useMemo(() => order.map((id) => byId[id]).filter(Boolean), [order, byId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {messages.map((message) => (
          <article key={message.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
            <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
              <span>{message.role}</span>
              <span>{new Date(message.updatedAt).toLocaleTimeString()}</span>
            </header>
            <div className="space-y-3">
              {message.blocks.map((block) => (
                <RenderBlock key={block.id} block={block} />
              ))}
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}
