#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const repo = process.argv.find((arg) => !arg.startsWith('--') && arg !== process.argv[1] && arg !== process.argv[0]) ?? process.cwd()
const json = process.argv.includes('--json')

const SOURCE_ROOTS = ['app/routes', 'app/components', 'app/styles', 'stories']
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.css'])
const SKIP_PARTS = new Set(['node_modules', '.git', 'coverage', 'build', 'storybook-static', 'test-results', 'playwright-report'])

function walk(dir, files = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return files
  }
  for (const entry of entries) {
    if (SKIP_PARTS.has(entry)) continue
    const path = join(dir, entry)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      walk(path, files)
    } else if ([...SOURCE_EXTENSIONS].some((ext) => path.endsWith(ext))) {
      files.push(path)
    }
  }
  return files
}

function count(pattern, content) {
  return content.match(pattern)?.length ?? 0
}

function importTargets(content) {
  return [...content.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
}

function analyzeFile(absPath) {
  const rel = relative(repo, absPath)
  const content = readFileSync(absPath, 'utf8')
  const lines = content.split(/\r?\n/)
  const imports = importTargets(content)
  const findings = []

  const metrics = {
    path: rel,
    lines: lines.length,
    imports: imports.length,
    rawButtons: count(/<button\b/g, content),
    rawAnchors: count(/<a\b/g, content),
    rawInputs: count(/<input\b(?![^>]*type=["']hidden["'])/g, content),
    inlineStyles: count(/\bstyle=\{/g, content),
    roundedFull: count(/rounded-full/g, content),
    arbitraryRadii: count(/rounded-\[/g, content),
    trackingClasses: count(/\btracking-/g, content),
    negativeTracking: count(/tracking-\[-/g, content),
    hardcodedHex: count(/#[0-9a-fA-F]{3,8}\b/g, content),
    legacyColorClasses: count(/\b(?:bg|text|border|ring|from|to|via)-(?:zinc|slate|gray|blue|green|purple|orange|yellow|red)-\d{2,3}\b/g, content),
    copiedButtonShells: count(/\bbutton(?:Base|Solid|Action|Red|Outline)Styles\b|before:rounded-\[calc\(var\(--radius-lg\)-1px\)\]|after:rounded-\[calc\(var\(--radius-lg\)-1px\)\]/g, content),
    cardWords: count(/\bcard\b|sj-card|shadow-\[/gi, content),
  }

  if (metrics.copiedButtonShells > 0) findings.push('copied-button-shell')
  if (metrics.inlineStyles > 0) findings.push('inline-style')
  if (metrics.hardcodedHex > 0) findings.push('hardcoded-hex')
  if (metrics.legacyColorClasses > 0) findings.push('legacy-tailwind-color')
  if (metrics.negativeTracking > 0) findings.push('negative-letter-spacing')
  if (metrics.rawButtons > 0 && !content.includes('Button')) findings.push('raw-buttons-without-button-primitive')
  if (metrics.roundedFull > 0) findings.push('rounded-full-review')

  return { ...metrics, imports, findings }
}

const files = SOURCE_ROOTS.flatMap((root) => walk(join(repo, root)))
const analyses = files.map(analyzeFile).sort((a, b) => a.path.localeCompare(b.path))
const totals = analyses.reduce(
  (acc, file) => {
    acc.files += 1
    acc.lines += file.lines
    for (const key of [
      'rawButtons',
      'rawAnchors',
      'rawInputs',
      'inlineStyles',
      'roundedFull',
      'arbitraryRadii',
      'trackingClasses',
      'negativeTracking',
      'hardcodedHex',
      'legacyColorClasses',
      'copiedButtonShells',
      'cardWords',
    ]) {
      acc[key] += file[key]
    }
    for (const finding of file.findings) {
      acc.findings[finding] = (acc.findings[finding] ?? 0) + 1
    }
    return acc
  },
  {
    files: 0,
    lines: 0,
    rawButtons: 0,
    rawAnchors: 0,
    rawInputs: 0,
    inlineStyles: 0,
    roundedFull: 0,
    arbitraryRadii: 0,
    trackingClasses: 0,
    negativeTracking: 0,
    hardcodedHex: 0,
    legacyColorClasses: 0,
    copiedButtonShells: 0,
    cardWords: 0,
    findings: {},
  }
)

const output = { repo, generatedAt: new Date().toISOString(), totals, files: analyses }

if (json) {
  console.log(JSON.stringify(output, null, 2))
} else {
  console.log(`# UI Inventory\n`)
  console.log(`Repo: ${repo}`)
  console.log(`Files: ${totals.files}`)
  console.log(`Lines: ${totals.lines}`)
  console.log(`Raw buttons: ${totals.rawButtons}`)
  console.log(`Rounded full occurrences: ${totals.roundedFull}`)
  console.log(`Legacy Tailwind colors: ${totals.legacyColorClasses}`)
  console.log(`Copied button shells: ${totals.copiedButtonShells}`)
  console.log(`Hardcoded hex colors: ${totals.hardcodedHex}`)
  console.log(`\n## Files With Findings\n`)
  for (const file of analyses.filter((item) => item.findings.length > 0)) {
    console.log(`- ${file.path}: ${file.findings.join(', ')}`)
  }
}
