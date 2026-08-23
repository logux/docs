#!/usr/bin/env node

import { glob, readFile } from 'node:fs/promises'
import { dirname, join, sep } from 'node:path'

let root = dirname(import.meta.dirname)

async function check(): Promise<void> {
  let [orderJSON, files] = await Promise.all([
    readFile(join(root, 'order.json'), 'utf8'),
    Array.fromAsync(glob('*/**/*.md', { cwd: root, exclude: ['node_modules'] }))
  ])
  let order: Record<string, string[]> = JSON.parse(orderJSON)
  for (let file of files) {
    let category = file.split(sep, 1)[0]!
    let rest = file.slice(category.length + 1, -3).replaceAll(sep, '/')
    if (!order[category]?.includes(rest)) {
      throw new Error(`Add ${file} to order.json`)
    }
  }
  for (let category in order) {
    for (let i of order[category]!) {
      let rest = i.replaceAll('/', sep)
      let file = join(category, `${rest}.md`)
      if (!files.includes(file)) {
        throw new Error(`Remove ${file} from order.json`)
      }
    }
  }
}

check().catch((e: Error) => {
  if (e.message.includes('order.json')) {
    process.stderr.write(e.message + '\n')
  } else {
    process.stderr.write(e.stack + '\n')
  }
  process.exit(1)
})
