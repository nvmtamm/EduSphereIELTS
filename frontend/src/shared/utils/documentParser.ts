// Polyfill Symbol.asyncIterator and .values() on ReadableStream for Safari / WebKit
if (typeof ReadableStream !== 'undefined') {
  const rsProto = ReadableStream.prototype as any
  if (!rsProto[Symbol.asyncIterator]) {
    rsProto[Symbol.asyncIterator] = async function* () {
      const reader = this.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return undefined
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    }
  }
  if (!rsProto.values) {
    rsProto.values = rsProto[Symbol.asyncIterator]
  }
}

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'

// Configure worker for pdfjs-dist using local bundled legacy worker from Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true
      })
      const pdf = await loadingTask.promise
      let fullText = ''

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        // Filter and sort items by vertical position (Y descending) then horizontal (X ascending)
        const items = (textContent.items as any[]).filter(
          (item) => typeof item.str === 'string' && item.str.trim().length > 0
        )

        items.sort((a, b) => {
          const yA = a.transform?.[5] ?? 0
          const yB = b.transform?.[5] ?? 0
          // Group items on approximately the same line (~5px threshold)
          if (Math.abs(yA - yB) > 5) {
            return yB - yA // Top to bottom
          }
          const xA = a.transform?.[4] ?? 0
          const xB = b.transform?.[4] ?? 0
          return xA - xB // Left to right
        })

        let lastY: number | null = null
        let pageText = ''

        for (const item of items) {
          const currentY = item.transform?.[5] ?? 0
          if (lastY !== null && Math.abs(currentY - lastY) > 6) {
            pageText += '\n'
          } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' '
          }
          pageText += item.str.trim()
          lastY = currentY
        }

        if (pageText.trim().length > 0) {
          fullText += `[Page ${pageNum}]\n${pageText.trim()}\n\n`
        }
      }

      return fullText.trim()
    } catch (err: any) {
      console.error('PDF extraction failed:', err)
      throw new Error(`Failed to extract text from PDF: ${err?.message || 'Unknown error'}`)
    }
  }

  if (extension === 'docx') {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value.trim()
    } catch (err: any) {
      console.error('DOCX extraction failed:', err)
      throw new Error(`Failed to extract text from DOCX: ${err?.message || 'Unknown error'}`)
    }
  }

  // Plain text (.txt, .md, etc.)
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve((event.target?.result as string) || '')
    }
    reader.onerror = () => reject(new Error('Failed to read plain text file.'))
    reader.readAsText(file)
  })
}
