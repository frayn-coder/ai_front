'use client'

import { PropsWithChildren, ReactNode } from 'react'

export type ChatLayoutProps = PropsWithChildren<{
  sidebar: ReactNode
  header?: ReactNode
  footer?: ReactNode
}>

export const ChatLayout = ({ sidebar, header, footer, children }: ChatLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50">
      <aside className="hidden w-80 flex-none border-r border-slate-800 bg-slate-900 p-4 lg:flex lg:flex-col">
        {sidebar}
      </aside>
      <main className="flex flex-1 flex-col">
        {header ? <header className="border-b border-slate-800 bg-slate-900/80 p-4 backdrop-blur">{header}</header> : null}
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
        {footer ? <footer className="border-t border-slate-800 bg-slate-900/80 p-4 backdrop-blur">{footer}</footer> : null}
      </main>
    </div>
  )
}
