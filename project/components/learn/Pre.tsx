'use client'

import { ReactNode } from 'react'
import CodeBlockCopyButton from './CodeBlockCopyButton'

interface PreProps {
  children: ReactNode
  raw?: string
  [key: string]: any
}

function extractCodeFromChildren(children: ReactNode): string {
  if (typeof children === 'string') return children
  
  if (Array.isArray(children)) {
    return children.map(extractCodeFromChildren).join('')
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    const childProps = (children as any).props
    if (childProps.children) {
      return extractCodeFromChildren(childProps.children)
    }
  }
  
  return ''
}

export default function Pre({ children, raw, ...props }: PreProps) {
  const code = raw || extractCodeFromChildren(children)
  
  return (
    <pre {...props} className="group">
      <CodeBlockCopyButton code={code} />
      {children}
    </pre>
  )
}
