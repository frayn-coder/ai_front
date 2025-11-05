export type Role = 'user' | 'assistant' | 'system' | 'tool'

export type BlockType =
  | 'text'
  | 'code'
  | 'chart'
  | 'table'
  | 'image'
  | 'audio'
  | 'file'
  | 'trace'

export interface BlockBase<T extends BlockType = BlockType> {
  id: string
  type: T
  createdAt: number
  updatedAt: number
  meta?: Record<string, unknown>
}

export interface TextBlock extends BlockBase<'text'> {
  text: string
}

export interface CodeBlock extends BlockBase<'code'> {
  language: string
  code: string
  runnable?: boolean
}

export interface ChartBlock extends BlockBase<'chart'> {
  schema: Record<string, unknown>
}

export interface TableBlock extends BlockBase<'table'> {
  rows: Array<Record<string, unknown>>
  columns: string[]
}

export interface ImageBlock extends BlockBase<'image'> {
  url: string
  alt?: string
}

export interface AudioBlock extends BlockBase<'audio'> {
  url: string
  duration?: number
}

export interface FileBlock extends BlockBase<'file'> {
  url: string
  name: string
  size?: number
  mime?: string
}

export interface TraceBlock extends BlockBase<'trace'> {
  steps: Array<Record<string, unknown>>
}

export type Block =
  | TextBlock
  | CodeBlock
  | ChartBlock
  | TableBlock
  | ImageBlock
  | AudioBlock
  | FileBlock
  | TraceBlock

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  status: 'pending' | 'running' | 'done' | 'failed'
  result?: unknown
  error?: string
}

export interface Message {
  id: string
  sessionId: string
  role: Role
  status: 'pending' | 'streaming' | 'done' | 'failed'
  createdAt: number
  updatedAt: number
  blocks: Block[]
  toolCalls: ToolCall[]
  meta?: Record<string, unknown>
  lastSeq: number
}

export interface MessageDelta {
  messageId: string
  sessionId: string
  seq: number
  block: Partial<Block> & Pick<Block, 'id' | 'type'>
  done?: boolean
}

export interface Session {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  model: string
  systemPrompt?: string
  pinnedTools: string[]
  participants: string[]
}

export interface SendMessagePayload {
  sessionId: string
  prompt: string
  attachments?: File[]
  tools?: string[]
  meta?: Record<string, unknown>
}
