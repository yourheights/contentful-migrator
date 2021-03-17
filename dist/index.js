#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const meow = require("meow");
const contentful_migration_1 = require("contentful-migration");
const options = {
    filePath: "",
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_PERSONAL_ACCESS_TOKEN,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT || "master",
};
const cli = meow();
const getFiles = (dir) => {
    const files = fs.readdirSync(dir);
    return files.filter((file) => file.match(/^\d/));
};
const logPath = `migration-log.json`;
const getCompletedMigrations = () => {
    if (!fs.existsSync(logPath)) {
        return {};
    }
    const rawData = fs.readFileSync(logPath, "utf-8");
    return JSON.parse(rawData);
};
const logMigration = (config) => {
    const completedMigrations = getCompletedMigrations();
    const { environmentId } = options;
    if (!environmentId) {
        console.log("missing environmentId");
        return;
    }
    const migrations = Object.assign(Object.assign({}, completedMigrations), { [environmentId]: [
            ...(completedMigrations[environmentId] || []),
            config.filePath,
        ] });
    if ((completedMigrations[environmentId] || []).includes(config.filePath)) {
        console.log("skipping migration", config.filePath);
        return;
    }
    return contentful_migration_1.runMigration(Object.assign(Object.assign({}, config), { filePath: path.join(__dirname, config.filePath) })).then(() => {
        console.log("ran migration:", config.filePath);
        fs.writeFileSync(logPath, JSON.stringify(migrations, null, 2));
    });
};
const migrations = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    Promise.all(getFiles(dir).map((filePath) => logMigration(Object.assign(Object.assign({}, options), { filePath }))));
});
console.log(cli.input[0]);
migrations(cli.input[0]);
//# sourceMappingURL=index.js.map