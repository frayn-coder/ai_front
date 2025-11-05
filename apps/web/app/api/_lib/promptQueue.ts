const globalSymbol = Symbol.for('ai-front.prompt-queue')

export type PromptJob = {
  sessionId: string
  prompt: string
}

type PromptState = {
  queues: Map<string, PromptJob[]>
}

const getGlobalState = (): PromptState => {
  const existing = (globalThis as any)[globalSymbol] as PromptState | undefined
  if (existing) {
    return existing
  }
  const state: PromptState = { queues: new Map() }
  ;(globalThis as any)[globalSymbol] = state
  return state
}

export const enqueuePrompt = (sessionId: string, prompt: string) => {
  const state = getGlobalState()
  const queue = state.queues.get(sessionId) ?? []
  queue.push({ sessionId, prompt })
  state.queues.set(sessionId, queue)
}

export const dequeuePrompt = (sessionId: string) => {
  const state = getGlobalState()
  const queue = state.queues.get(sessionId) ?? []
  const job = queue.shift() ?? null
  if (queue.length === 0) {
    state.queues.delete(sessionId)
  } else {
    state.queues.set(sessionId, queue)
  }
  return job
}
