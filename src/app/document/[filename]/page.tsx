'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface DocumentContent {
  content: string
  title: string
  filename: string
}

export default function WhimsyDocumentPage() {
  const params = useParams()
  const [document, setDocument] = useState<DocumentContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        const filename = decodeURIComponent(params.filename as string)
        
        // Fetch the markdown content from the API
        const response = await fetch(`/api/document/${encodeURIComponent(filename)}`)
        
        if (!response.ok) {
          throw new Error('Document not found')
        }
        
        const content = await response.text()
        
        // Extract title from the first heading
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : filename.replace('.md', '')
        
        setDocument({
          content,
          title,
          filename
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    if (params.filename) {
      fetchDocument()
    }
  }, [params.filename])

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactElement[] = []
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let inTable = false
    let tableRows: string[][] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={`code-${i}`} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto">
              <code className="text-sm text-gray-800 dark:text-gray-200">
                {codeBlockContent.join('\n')}
              </code>
            </pre>
          )
          inCodeBlock = false
          codeBlockContent = []
        } else {
          // Start code block
          inCodeBlock = true
        }
        continue
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line)
        continue
      }
      
      // Handle tables
      if (line.includes('|') && line.trim().length > 0 && !line.startsWith('|')) {
        const cells = line.split('|').filter(cell => cell.trim().length > 0)
        if (cells.length > 1) {
          if (!inTable) {
            inTable = true
            tableRows = []
          }
          tableRows.push(cells.map(cell => cell.trim()))
        }
        continue
      } else if (inTable) {
        // End table
        if (tableRows.length > 0) {
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-4">
              <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg">
                <tbody>
                  {tableRows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-200 dark:border-gray-700">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        inTable = false
        tableRows = []
      }
      
      // Handle headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 first:mt-0">
            {renderInlineMarkdown(line.substring(2))}
          </h1>
        )
        continue
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-6">
            {renderInlineMarkdown(line.substring(3))}
          </h2>
        )
        continue
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-xl font-semibold text-gray-900 dark:text-white mb-3 mt-5">
            {renderInlineMarkdown(line.substring(4))}
          </h3>
        )
        continue
      }
      if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
            {renderInlineMarkdown(line.substring(5))}
          </h4>
        )
        continue
      }
      
      // Handle blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 rounded-r">
            <p className="text-gray-700 dark:text-gray-300 italic">
              {renderInlineMarkdown(line.substring(2))}
            </p>
          </blockquote>
        )
        continue
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-2"></div>)
        continue
      }
      
      // Handle regular paragraphs
      elements.push(
        <p key={i} className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      )
    }
    
    return elements
  }
  
  const renderInlineMarkdown = (text: string): React.ReactElement[] => {
    const elements: React.ReactElement[] = []
    let currentText = text
    let keyIndex = 0
    
    // Handle bold text
    while (currentText.includes('**')) {
      const parts = currentText.split('**')
      if (parts.length >= 3) {
        elements.push(<span key={keyIndex++}>{parts[0]}</span>)
        elements.push(<strong key={keyIndex++}>{parts[1]}</strong>)
        currentText = parts.slice(2).join('**')
      } else {
        break
      }
    }
    
    if (currentText) {
      // Handle italic text (but not if it's already been processed as bold)
      let italicText = currentText
      const italicElements: React.ReactElement[] = []
      
      while (italicText.includes('*') && !italicText.startsWith('*')) {
        const parts = italicText.split('*')
        if (parts.length >= 3) {
          italicElements.push(<span key={keyIndex++}>{parts[0]}</span>)
          italicElements.push(<em key={keyIndex++}>{parts[1]}</em>)
          italicText = parts.slice(2).join('*')
        } else {
          break
        }
      }
      
      if (italicText) {
        italicElements.push(<span key={keyIndex++}>{italicText}</span>)
      }
      
      elements.push(...italicElements)
    }
    
    return elements.length > 0 ? elements : [<span key={keyIndex}>{text}</span>]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Document Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            href="/library"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/library"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200 mb-2"
              >
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Library
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{document.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{document.filename}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 prose prose-lg max-w-none dark:prose-invert">
          {renderMarkdown(document.content)}
        </div>
      </div>
    </div>
  )
}
