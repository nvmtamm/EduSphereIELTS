export interface SanitizedPassageSection {
  title: string
  partNumber: number
  partName: string
  paragraphs: { letter?: string; text: string }[]
  rawCleanText: string
}

/**
 * Robust Runtime IELTS Passage Sanitizer & Part Slicer:
 * - Accurately partitions 1, 2, or 3-passage IELTS exams.
 * - Strips all question blocks, options (A-D), headings lists (i-x), and exam instructions.
 * - Formats both lettered paragraphs (Paragraph A-I) and standard prose paragraphs cleanly.
 */
export function sanitizeAndSliceIeltsExams(
  rawContent: string,
  targetPartIndex: number = 0,
  expectedPartsCount: number = 3
): SanitizedPassageSection {
  if (!rawContent || !rawContent.trim()) {
    return {
      title: 'Reading Passage',
      partNumber: targetPartIndex + 1,
      partName: `Part ${targetPartIndex + 1}`,
      paragraphs: [],
      rawCleanText: ''
    }
  }

  // 1. Initial cleanup of page numbers and website watermarks
  let text = rawContent
    .replace(/\[Page\s+\d+\]/gi, '')
    .replace(/(?:^|\n)Page\s+\d+\s+of\s+\d+/gi, '')
    .replace(/(?:^|\n)Page\s+\d+/gi, '')
    .replace(/https?:\/\/[^\s]+/gi, '')
    .trim()

  // 2. Identify discrete passages in the document
  const passageChunks: string[] = []

  // Check Pattern A: Markdown headers (# Reading Passage 1, # Reading Passage 2, # Reading Passage 3)
  const mdSplits = text.split(/(?=(?:^|\n)#+\s*(?:Reading\s+)?Passage\s+\d+)/i).map(s => s.trim()).filter(Boolean)
  if (mdSplits.length >= 2) {
    passageChunks.push(...mdSplits)
  } else {
    // Check Pattern B: Horizontal divider (--- or ===)
    const hrSplits = text.split(/\n\s*(?:---+|===+)\s*\n/).map(s => s.trim()).filter(Boolean)
    if (hrSplits.length >= 2) {
      passageChunks.push(...hrSplits)
    } else {
      // Check Pattern C: Plain text "READING PASSAGE 1/2/3" or "PASSAGE 1/2/3" or "Inside the mind of the consumer"
      const plainSplits = text.split(/(?=(?:^|\n)\s*(?:READING\s+)?PASSAGE\s+\d+[\:\s\-\–\—])/i).map(s => s.trim()).filter(Boolean)
      if (plainSplits.length >= 2) {
        passageChunks.push(...plainSplits)
      } else {
        // Check Pattern D: Known article title transitions in multi-exam PDFs
        const titleBoundaryPattern = /(?=(?:^|\n)\s*(?:Inside the mind of the consumer|The accidental rainforest|Worldly Wealth|A song on the brain|Sustainable architecture))/i
        const titleSplits = text.split(titleBoundaryPattern).map(s => s.trim()).filter(Boolean)
        if (titleSplits.length >= 2) {
          passageChunks.push(...titleSplits)
        }
      }
    }
  }

  // Fallback if not partitioned
  if (passageChunks.length === 0) {
    passageChunks.push(text)
  }

  // Select the chunk corresponding to the active part
  const rawChunk = passageChunks[Math.min(targetPartIndex, passageChunks.length - 1)] || passageChunks[0] || text

  // 3. STRIP ALL QUESTION BLOCKS from the passage chunk
  let pureArticleText = rawChunk

  // Remove leading question instructions or Headings lists
  pureArticleText = pureArticleText.replace(/^(?:List\s+of\s+Headings[\s\S]*?(?:x|ix|viii|vii|vi|v|iv|iii|ii|i)\s+[^\n]+\n+)/i, '')
  pureArticleText = pureArticleText.replace(/^(?:has\s+\w+\s+paragraphs\s+labelled\s+[A-I][\s\S]*?(?:1[0-9]|\d)\.\s+[^\n]+[\s\S]*?\n\n)/i, '')
  pureArticleText = pureArticleText.replace(/^(?:Questions?\s+\d+[\s\-\–\—to]+\d+[\s\S]*?(?:1[0-9]|\d)\.\s+[^\n]+[\s\S]*?\n\n)/i, '')

  // Remove trailing question blocks
  const questionStartMatch = pureArticleText.match(/(?:^|\n)\s*(?:Questions?\s+\d+[\s\-\–\—to]+\d+|Questions?\s+\d+\:|Choose\s+the\s+correct\s+answer|Look\s+at\s+the\s+following\s+theories|Do\s+the\s+following\s+statements|Complete\s+the\s+summary|Complete\s+the\s+sentences|Which\s+paragraph\s+contains|List\s+of\s+Headings|Which\s+three\s+parts)/i)
  if (questionStartMatch && questionStartMatch.index !== undefined && questionStartMatch.index > 120) {
    pureArticleText = pureArticleText.substring(0, questionStartMatch.index).trim()
  }

  // Also remove embedded question lists like "14. Paragraph B ... 19. Paragraph G"
  pureArticleText = pureArticleText.replace(/(?:^|\n)\s*(?:1[4-9]|[2-4]\d)\.\s+Paragraph\s+[A-J][\s\S]*?(?=\n\n|$)/gi, '')
  pureArticleText = pureArticleText.replace(/(?:^|\n)\s*List\s+of\s+Headings[\s\S]*?(?=\n\n[A-Z]|$)/gi, '')

  // 4. Extract Article Title
  let title = `Reading Passage ${targetPartIndex + 1}`
  let processedText = pureArticleText

  // Remove test header prefix like "IELTS READING TEST 12"
  const testPrefixMatch = processedText.match(/^IELTS\s+READING\s+TEST\s+\d+\s*/i)
  if (testPrefixMatch) {
    processedText = processedText.substring(testPrefixMatch[0].length).trim()
  }

  // Extract primary title line
  const titleLineMatch = processedText.match(/^(?:#+\s*(?:Reading\s+Passage\s+\d+[\:\s\-\–]*)?)?([A-Z][A-Za-z0-9\s\,\'\’\-\–\—]{3,70})(?=\n\n|\n[A-Z]|\s+A\s+[A-Z]|$)/)
  if (titleLineMatch && titleLineMatch[1]) {
    const candidateTitle = titleLineMatch[1].trim()
    if (!candidateTitle.startsWith('Paragraph') && !candidateTitle.startsWith('Questions') && candidateTitle.length > 3) {
      title = candidateTitle
      processedText = processedText.substring(titleLineMatch[0].length).trim()
    }
  }

  // 5. Structure Paragraphs
  const paragraphs: { letter?: string; text: string }[] = []

  // Check if passage uses lettered paragraphs (A, B, C, D...)
  const letterMatches = Array.from(processedText.matchAll(/(?:^|\n\n?|(?<=[.!?]["']?\s+))\s*(?:###\s*)?(?:\[?([A-J])\]?[\.\:\s]\s*|Paragraph\s+([A-J])[\:\s]*)/g))

  if (letterMatches.length >= 2) {
    for (let i = 0; i < letterMatches.length; i++) {
      const currentMatch = letterMatches[i]
      const letter = currentMatch[1] || currentMatch[2]
      const startIndex = (currentMatch.index || 0) + currentMatch[0].length
      const endIndex = i + 1 < letterMatches.length ? (letterMatches[i + 1].index || processedText.length) : processedText.length

      const pText = processedText.substring(startIndex, endIndex).trim()
      if (pText.length > 15) {
        paragraphs.push({
          letter: letter.toUpperCase(),
          text: pText
        })
      }
    }
  } else {
    // Standard prose paragraphs without letters (e.g. Sustainable architecture on Page 1)
    const rawParagraphs = processedText.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 20)
    rawParagraphs.forEach((p) => {
      // Check if starts with a letter like "A " or "B "
      const startLetterMatch = p.match(/^([A-J])\s+([A-Z].*)/s)
      if (startLetterMatch) {
        paragraphs.push({
          letter: startLetterMatch[1].toUpperCase(),
          text: startLetterMatch[2].trim()
        })
      } else {
        paragraphs.push({
          text: p
        })
      }
    })
  }

  return {
    title,
    partNumber: targetPartIndex + 1,
    partName: `Part ${targetPartIndex + 1}`,
    paragraphs,
    rawCleanText: pureArticleText
  }
}
