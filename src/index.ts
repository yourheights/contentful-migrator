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

const cli = meow()

const getFiles = (dir: string) => {
  const files = fs.readdirSync(dir)
  return files.filter((file) => file.match(/^\d/))
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
  return runMigration({
    ...config,
    filePath: path.join(__dirname, config.filePath),
  }).then(() => {
    console.log("ran migration:", config.filePath)
    fs.writeFileSync(defaultLogPath, JSON.stringify(migrations, null, 2))
  })
}

const migrations = async (dir: string) => {
  if (!dir) {
    console.error("please include the path to the migrations directory")
  }
  Promise.all(
    getFiles(dir).map((filePath) =>
      logMigration({
        ...options,
        ...{ filePath },
      })
    )
  )
}

console.log(cli.input[0])

migrations(cli.input[0])
