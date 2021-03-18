<p align="center" style="font-size: 5em">🚚</p>

<h1 align="center"> Contentful Migrator</h1>

<h3 align="center">Contentful migration, made easier</h3>

<p align="center">Contentful Migrator is a handy cli tool that extends the existing [contentful-migration](https://www.npmjs.com/package/contentful-migration) tool, allowing you to run multiple migration files.</p>

<p align='center'>
<a href="https://www.npmjs.com/package/@heights/contentful-migrator">
<img src="https://img.shields.io/npm/v/@heights/contentful-migrator">
</a>
</p>

## Usage

You can get this tool up and running in a few easy steps:

**1. Install the Contentful Migrator CLI.**

```
npm install -D @heights/contentful-migrator

or

yarn add -D @heights/contentful-migrator
```

**2. Create your migration file(s).**

First, create a migration file according to https://github.com/contentful/contentful-migration#writing-migrations-in-typescript

You should end up with something like this:

```ts
// 01-dog-content-type.ts
import { MigrationFunction } from "contentful-migration"

// typecast to 'MigrationFunction' to ensure you get type hints in your editor
export = function (migration, { makeRequest, spaceId, accessToken }) {
  const dog = migration.createContentType("dog", {
    name: "Dog",
  })

  const name = dog.createField("name")
  name.name("Name").type("Symbol").required(true)
} as MigrationFunction
```

> **Important note** Files need to be named sequentially, otherwise they will be ignored.

```js
.
+-- src
    +-- migrations
        +-- 01-dog-content-type.ts
        +-- 02-cat-content-type.ts
        +-- 03-add-breed-field.ts
```

**3. Running migrations**

The tool expects a `path` to your migration directory to be provided:

```sh
contentful-migrator <path>

eg.

contentful-migrator src/migrations
```

For each successful migration, this will be logged in a `migration-log.json` file in the root directory.
