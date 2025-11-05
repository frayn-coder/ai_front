import { NextResponse } from 'next/server'

import { enqueuePrompt } from '../_lib/promptQueue'

export async function POST(request: Request) {
  const body = await request.json()
  const { sessionId, prompt } = body ?? {}

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 })
  }

  enqueuePrompt(sessionId, String(prompt ?? ''))

  return NextResponse.json({ ok: true })
}
