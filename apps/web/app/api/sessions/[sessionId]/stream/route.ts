import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import { dequeuePrompt } from '../../../_lib/promptQueue'

export const runtime = 'nodejs'

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const job = dequeuePrompt(sessionId)
      const prompt = job?.prompt ?? 'Hello! Ask me something and I will respond.'
      const messageId = nanoid()
      const blockId = nanoid()

      const thoughts = [
        `Echoing: ${prompt}`,
        'I am a mock AI responding from the frontend demo.',
        'You can replace this streaming API with your real backend.'
      ]

      let aggregated = ''
      let seq = 0

      for (const line of thoughts) {
        aggregated += (aggregated ? '\n\n' : '') + line
        const payload = {
          messageId,
          sessionId,
          seq,
          block: {
            id: blockId,
            type: 'text',
            text: aggregated
          }
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        seq += 1
        await new Promise((resolve) => setTimeout(resolve, 350))
      }

      const finalPayload = {
        messageId,
        sessionId,
        seq,
        block: {
          id: blockId,
          type: 'text',
          text: aggregated
        },
        done: true
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalPayload)}\n\n`))
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}
