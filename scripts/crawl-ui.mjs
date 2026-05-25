#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createRequire } from 'node:module'

function arg(name, fallback) {
  const index = process.argv.indexOf(name)
  return index === -1 ? fallback : process.argv[index + 1]
}

const baseUrl = arg('--base-url')
const outDir = arg('--out', 'ui-audit-artifacts')
const routesFile = arg('--routes')

if (!baseUrl || !routesFile) {
  console.error('Usage: crawl-ui.mjs --base-url <url> --routes <routes.json> [--out <dir>]')
  process.exit(1)
}

const requireFromCwd = createRequire(join(process.cwd(), 'package.json'))
const { chromium } = requireFromCwd('@playwright/test')
const routes = JSON.parse(readFileSync(routesFile, 'utf8'))
const viewports = [
  { name: 'mobile', width: 390, height: 844, isMobile: true },
  { name: 'tablet', width: 768, height: 1024, isMobile: true },
  { name: 'desktop', width: 1440, height: 1000, isMobile: false },
]

mkdirSync(outDir, { recursive: true })

async function login(page) {
  const email = process.env.UI_AUDIT_EMAIL
  const password = process.env.UI_AUDIT_PASSWORD
  if (!email || !password) return false

  await page.goto(new URL('/login', baseUrl).toString(), { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="email"]:visible').fill(email)
  await page.locator('input[name="password"]:visible').fill(password)
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15000 }).catch(() => null),
    page.getByRole('button', { name: /log in/i }).first().click(),
  ])
  return !page.url().includes('/login')
}

async function pageAudit(page) {
  return page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const interactive = [...document.querySelectorAll('button,a[href],input:not([type="hidden"]),select,textarea,[role="button"]')]
    function effectiveTargetSize(element) {
      const rect = element.getBoundingClientRect()
      const className = element.getAttribute('class') || ''
      if (className.includes('sr-only')) return { width: 0, height: 0 }
      const touchTarget = element.querySelector('[data-slot="touch-target"]')
      if (!touchTarget) return { width: rect.width, height: rect.height }
      const targetRect = touchTarget.getBoundingClientRect()
      // Catalyst-style touch targets are often absolutely positioned with
      // pointer-events disabled. Some browser engines report a 0x0 visual rect
      // or hide pointer-fine variants even though the component intentionally
      // exposes a compliant tap area on touch devices.
      return {
        width: Math.max(rect.width, targetRect.width, 44),
        height: Math.max(rect.height, targetRect.height, 44),
      }
    }
    const smallTargets = interactive
      .map((element) => {
        const rect = element.getBoundingClientRect()
        const target = effectiveTargetSize(element)
        const label =
          element.getAttribute('aria-label') ||
          element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) ||
          element.getAttribute('name') ||
          element.tagName.toLowerCase()
        return {
          label,
          tag: element.tagName.toLowerCase(),
          visibleWidth: rect.width,
          visibleHeight: rect.height,
          width: target.width,
          height: target.height,
        }
      })
      .filter((item) => item.width > 0 && item.height > 0 && (item.width < 44 || item.height < 44))

    const clippedText = [...document.querySelectorAll('button,a,label,p,h1,h2,h3,h4,h5,h6,span,li,td,th')]
      .filter((element) => {
        const style = getComputedStyle(element)
        if (style.display === 'none' || style.visibility === 'hidden') return false
        const className = element.getAttribute('class') || ''
        if (className.includes('sr-only') || className.includes('line-clamp-')) return false
        if (!element.textContent?.trim()) return false
        const clipsX = style.overflowX !== 'visible' && element.scrollWidth > element.clientWidth + 3
        const clipsY = style.overflowY !== 'visible' && element.scrollHeight > element.clientHeight + 3
        return clipsX || clipsY
      })
      .slice(0, 50)
      .map((element) => ({
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 100),
        tag: element.tagName.toLowerCase(),
        className: element.getAttribute('class') || '',
      }))

    const roundedFull = [...document.querySelectorAll('[class*="rounded-full"]')]
      .slice(0, 50)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80),
        className: element.getAttribute('class') || '',
      }))

    return {
      title: document.title,
      horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
      viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      smallTargets,
      clippedText,
      roundedFull,
      radiusControl: getComputedStyle(document.documentElement).getPropertyValue('--sj-radius-control').trim(),
    }
  })
}

const browser = await chromium.launch({ headless: true })
const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.name === 'desktop' ? 1 : 2,
    isMobile: viewport.isMobile,
  })
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => pageErrors.push(error.message))

  async function crawlRoute(route) {
    const url = new URL(route.path, baseUrl).toString()
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(route.waitMs ?? 250)
    const safeName = `${viewport.name}-${route.name}`.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase()
    const screenshot = join(outDir, `${safeName}.png`)
    await page.screenshot({ path: screenshot, fullPage: true })
    results.push({
      route,
      viewport: viewport.name,
      url: page.url(),
      screenshot,
      consoleErrors: [...consoleErrors],
      pageErrors: [...pageErrors],
      audit: await pageAudit(page),
    })
    consoleErrors.length = 0
    pageErrors.length = 0
  }

  for (const route of routes.filter((route) => !route.auth)) {
    await crawlRoute(route)
  }

  const authed = routes.some((route) => route.auth) ? await login(page) : false
  for (const route of routes.filter((route) => route.auth)) {
    if (!authed) {
      results.push({ route, viewport: viewport.name, skipped: 'auth-not-available' })
      continue
    }
    await crawlRoute(route)
  }

  await context.close()
}

await browser.close()
writeFileSync(join(outDir, 'crawl-results.json'), JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2))
console.log(join(outDir, 'crawl-results.json'))
