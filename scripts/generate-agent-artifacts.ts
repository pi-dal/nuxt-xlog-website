import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import fs from 'fs-extra'
import { collectCanonicalRouteEntries } from '~/logics/agent-readiness-build'
import { siteConfig } from '~/site/config'

const rootDir = process.env.CONTENT_ROOT_DIR || process.cwd()
const distDir = process.env.PUBLISH_DIST_DIR || './dist'

function sha256(value: string) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

async function generateAgentSkillsIndex() {
  const skillPath = resolve(rootDir, 'public/.well-known/agent-skills/site-navigation.md')
  const content = await fs.readFile(skillPath, 'utf8')

  const payload = {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [
      {
        name: 'site-navigation',
        type: 'skill-md',
        description: 'Navigate the pi-dal site and discover machine-readable resources.',
        url: `${siteConfig.url}/.well-known/agent-skills/site-navigation.md`,
        digest: sha256(content),
      },
    ],
  }

  const outputPath = resolve(distDir, '.well-known/agent-skills/index.json')
  await fs.ensureDir(resolve(distDir, '.well-known/agent-skills'))
  await fs.writeJson(outputPath, payload, { spaces: 2 })
}

async function generateRouteManifest() {
  const entries = await collectCanonicalRouteEntries({ rootDir })
  const outputPath = resolve(distDir, '.well-known/agent-routes.json')
  await fs.ensureDir(resolve(distDir, '.well-known'))
  await fs.writeJson(outputPath, {
    routes: entries.map(entry => ({
      path: entry.path,
      title: entry.title,
      type: entry.type,
      url: `${siteConfig.url}${entry.path === '/' ? '' : entry.path}`,
    })),
  }, { spaces: 2 })
}

async function run() {
  await generateAgentSkillsIndex()
  await generateRouteManifest()
}

void run()
