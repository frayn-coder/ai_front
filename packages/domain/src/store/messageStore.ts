import { nanoid } from 'nanoid'
import { produce } from 'immer'
import { create } from 'zustand'

import type { Block, Message, MessageDelta } from '../types'

type MessageMap = Record<string, Message>

type MessageState = {
  byId: MessageMap
  order: string[]
  upsert: (message: Omit<Message, 'lastSeq'> & { lastSeq?: number }) => void
  appendDelta: (delta: MessageDelta) => void
  reset: (sessionId: string) => void
}

const ensureBlock = (blocks: Block[], patch: MessageDelta['block']): Block => {
  const existing = blocks.find((b) => b.id === patch.id)
  const timestamp = Date.now()
  if (!existing) {
    const base: Block = {
      id: patch.id,
      type: patch.type,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(patch as Partial<Block>)
    } as Block
    blocks.push(base)
    return base
  }
  Object.assign(existing, patch, { updatedAt: timestamp })
  return existing
}

export const useMessageStore = create<MessageState>((set, get) => ({
  byId: {},
  order: [],
  upsert(message) {
    const withDefaults: Message = {
      lastSeq: message.lastSeq ?? -1,
      ...message
    }
    set((state) =>
      produce(state, (draft) => {
        draft.byId[withDefaults.id] = withDefaults
        if (!draft.order.includes(withDefaults.id)) {
          draft.order.unshift(withDefaults.id)
        }
      })
    )
  },
  appendDelta(delta) {
    set((state) =>
      produce(state, (draft) => {
        const existing = draft.byId[delta.messageId]
        if (!existing) {
          const now = Date.now()
          draft.byId[delta.messageId] = {
            id: delta.messageId,
            sessionId: delta.sessionId,
            role: 'assistant',
            status: delta.done ? 'done' : 'streaming',
            createdAt: now,
            updatedAt: now,
            blocks: [],
            toolCalls: [],
            lastSeq: -1
          }
          draft.order.unshift(delta.messageId)
        }
        const message = draft.byId[delta.messageId]
        if (!message || delta.seq <= message.lastSeq) {
          return
        }
        ensureBlock(message.blocks, delta.block)
        message.lastSeq = delta.seq
        message.updatedAt = Date.now()
        if (delta.done) {
          message.status = 'done'
        } else {
          message.status = 'streaming'
        }
      })
    )
  },
  reset(sessionId) {
    set((state) =>
      produce(state, (draft) => {
        draft.order = draft.order.filter((id) => draft.byId[id]?.sessionId !== sessionId)
        Object.keys(draft.byId).forEach((id) => {
          if (draft.byId[id]?.sessionId === sessionId) {
            delete draft.byId[id]
          }
        })
      })
    )
  }
}))

export const createUserMessage = (sessionId: string, text: string): Message => {
  const timestamp = Date.now()
  return {
    id: nanoid(),
    sessionId,
    role: 'user',
    status: 'done',
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSeq: -1,
    blocks: [
      {
        id: nanoid(),
        type: 'text',
        text,
        createdAt: timestamp,
        updatedAt: timestamp
      } as Block
    ],
    toolCalls: []
  }
}
