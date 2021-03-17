#!/usr/bin/env node

import * as fs from "fs"
import * as path from "path"
import * as meow from "meow"
import { runMigration, RunMigrationConfig } from "contentful-migration"

interface MigrationFiles {
  [index: string]: string[]
}

const options: RunMigrationConfig = {
  filePath: "",
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_PERSONAL_ACCESS_TOKEN,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT || "master",
}

const getFiles = (dir: string) => {
  console.log("reading dir", dir)
  const files = fs.readdirSync(dir)
  return files
    .filter((file) => file.match(/^\d/))
    .map((file) => path.join(process.cwd(), dir, file))
}

const defaultLogPath = `migration-log.json`

const getCompletedMigrations = (): MigrationFiles => {
  if (!fs.existsSync(defaultLogPath)) {
    return {}
  }
  const rawData = fs.readFileSync(defaultLogPath, "utf-8")
  return JSON.parse(rawData)
}

const logMigration = (config: RunMigrationConfig) => {
  const completedMigrations = getCompletedMigrations()
  const { environmentId } = options
  if (!environmentId) {
    console.log("missing environmentId")
    return
  }
  const migrations = {
    ...completedMigrations,
    [environmentId]: [
      ...(completedMigrations[environmentId] || []),
      config.filePath,
    ],
  }

  if ((completedMigrations[environmentId] || []).includes(config.filePath)) {
    console.log("skipping migration", config.filePath)
    return
  }
  console.log("running migration", config.filePath)
  return runMigration({
    ...config,
    filePath: path.resolve(config.filePath),
  }).then(() => {
    console.log("ran migration", config.filePath)
    fs.writeFileSync(defaultLogPath, JSON.stringify(migrations, null, 2))
  })
}

const migrations = () => async () => {
  const cli = meow()
  const dir = cli.input[0]
  if (!dir) {
    console.error("please include the path to the migrations directory")
  }
  getFiles(dir).reduce(
    (p, filePath) =>
      p.then(() =>
        logMigration({
          ...options,
          ...{ filePath },
        })
      ),
    Promise.resolve()
  )
}

export default migrations()
