import { useCallback, useEffect, useRef } from 'react'

import type { MessageDelta, SendMessagePayload } from '@ai-front/domain'
import { useMessageStore } from '@ai-front/domain'

export interface StreamOptions {
  autoStart?: boolean
}

export const useMessageStream = (sessionId?: string, options: StreamOptions = {}) => {
  const appendDelta = useMessageStore((state) => state.appendDelta)
  const controllerRef = useRef<AbortController | null>(null)
  const sourceRef = useRef<EventSource | null>(null)

  const stop = useCallback(() => {
    controllerRef.current?.abort()
    sourceRef.current?.close()
    controllerRef.current = null
    sourceRef.current = null
  }, [])

  const start = useCallback(
    async (payload: SendMessagePayload) => {
      if (!payload.sessionId) {
        throw new Error('Session id is required to start streaming')
      }
      stop()
      controllerRef.current = new AbortController()

      await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controllerRef.current.signal
      })

      const es = new EventSource(`/api/sessions/${payload.sessionId}/stream`)
      sourceRef.current = es

      es.onmessage = (event) => {
        const delta: MessageDelta = JSON.parse(event.data)
        appendDelta(delta)
      }

      es.onerror = () => {
        es.close()
      }

      return () => {
        es.close()
      }
    },
    [appendDelta, stop]
  )

  useEffect(() => {
    if (options.autoStart && sessionId) {
      start({ sessionId, prompt: '' }).catch(() => {
        /* noop */
      })
    }
    return () => {
      stop()
    }
  }, [sessionId, start, stop, options.autoStart])

  return { start, stop }
}
