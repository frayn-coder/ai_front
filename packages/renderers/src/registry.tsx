'use client'

import type { ReactNode } from 'react'

import type { Block } from '@ai-front/domain'

export type BlockRenderer<Props = any> = (props: Props) => ReactNode

type Registry = Record<string, BlockRenderer>

const registry: Registry = {}

export const registerRenderer = (type: string, renderer: BlockRenderer) => {
  registry[type] = renderer
}

const TextBlockRenderer: BlockRenderer<{ text?: string }> = ({ text }) => (
  <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-50">{text}</p>
)

const CodeBlockRenderer: BlockRenderer<{ language?: string; code?: string }> = ({ language, code }) => (
  <pre className="overflow-x-auto rounded-lg bg-slate-900/80 p-4 text-sm text-emerald-200">
    <div className="mb-2 text-xs uppercase text-slate-400">{language ?? 'code'}</div>
    <code>{code}</code>
  </pre>
)

registerRenderer('text', TextBlockRenderer)
registerRenderer('code', CodeBlockRenderer)

export interface RenderBlockProps {
  block: Block
}

export const RenderBlock = ({ block }: RenderBlockProps) => {
  const renderer = registry[block.type]
  if (!renderer) {
    return (
      <pre className="rounded border border-dashed border-slate-700 bg-slate-900/50 p-4 text-xs text-slate-400">
        Unsupported block: {block.type}
      </pre>
    )
  }
  return <>{renderer(block as never)}</>
}

export const getRegisteredTypes = () => Object.keys(registry)
