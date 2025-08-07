'use client'

import React from 'react'
import { renderTipTapContent } from '@/hooks/useRenderTipTapContent'

interface TipTapContentProps {
  content: any
  className?: string
}

const TipTapContent: React.FC<TipTapContentProps> = ({ content, className = '' }) => {
  const htmlContent = renderTipTapContent(content)
  
  return (
    <div 
      className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        // Custom styles for better table rendering
        '--tw-prose-tables': 'rgb(0 0 0)',
        '--tw-prose-th-borders': 'rgb(209 213 219)',
        '--tw-prose-td-borders': 'rgb(209 213 219)',
      } as React.CSSProperties}
    />
  )
}

export default TipTapContent
