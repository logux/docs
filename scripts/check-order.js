#!/usr/bin/env node

import { dirname, join, sep } from 'path'
import { readFile } from "fs/promises"
import globby from 'globby'

let root = dirname(dirname(new URL(import.meta.url).pathname))

async function check () {
  let [orderJSON, files] = await Promise.all([
    readFile(join(root, "order.json")),
    globby("*/**/*.md", { cwd: root, ignore: ["node_modules"] }),
  ])
  let order = JSON.parse(orderJSON)
  for (let file of files) {
    let category = file.split(sep, 1)[0]
    let rest = file.slice(category.length + 1, -3).replace(/\\/g, '/')
    if (!order[category].includes(rest)) {
      throw new Error(`Add ${ file } to order.json`)
    }
  }
  for (let category in order) {
    for (let i of order[category]) {
      let rest = i.replace(/\//g, sep)
      let file = join(category, `${rest}.md`)
      if (!files.includes(file)) {
        throw new Error(`Remove ${ file } from order.json`)
      }
    }
  }
}

check().catch(e => {
  if (e.message.includes('order.json')) {
    process.stderr.write(e.message + '\n')
  } else {
    process.stderr.write(e.stack + '\n')
  }
  process.exit(1)
})
