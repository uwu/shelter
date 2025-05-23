import { readdir, readFile } from "node:fs/promises";
import { join } from "pathe";
import { sql } from "drizzle-orm";
import { useDrizzle } from "./drizzle";
import type { H3Event } from "h3";
import { consola } from "consola";

const logger = consola.withTag("migrations");

// Create migrations table query
export const CreateMigrationsTableQuery = sql`CREATE TABLE IF NOT EXISTS _migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

// Get applied migrations query
export const AppliedMigrationsQuery = sql`SELECT id, name, applied_at FROM _migrations ORDER BY id`;

// Split SQL queries helper
export function splitSqlQueries(sqlFileContent: string): string[] {
  const queries: string[] = [];
  let inString = false;
  let stringFence = "";
  let result = "";

  let currentGeneralWord = "";
  let previousGeneralWord = "";
  let inTrigger = false;

  let currentTriggerWord = "";
  let triggerBlockNestingLevel = 0;

  for (let i = 0; i < sqlFileContent.length; i += 1) {
    const char = sqlFileContent[i];
    const nextChar = sqlFileContent[i + 1];

    // Handle string literals
    if ((char === "'" || char === '"') && (i === 0 || sqlFileContent[i - 1] !== "\\")) {
      if (!inString) {
        inString = true;
        stringFence = char;
      } else if (char === stringFence) {
        inString = false;
      }
    }

    // Only remove comments when not inside a string
    if (!inString) {
      // Handle -- comments
      if (char === "-" && nextChar === "-") {
        while (i < sqlFileContent.length && sqlFileContent[i] !== "\n") {
          i += 1;
        }
        continue;
      }

      // Handle /* */ comments
      if (char === "/" && nextChar === "*") {
        i += 2;
        while (i < sqlFileContent.length && !(sqlFileContent[i] === "*" && sqlFileContent[i + 1] === "/")) {
          i += 1;
        }
        i += 2;
        continue;
      }

      // Track general keywords for CREATE TRIGGER detection
      if (/\w/.test(char)) {
        currentGeneralWord += char.toLowerCase();
      } else {
        if (previousGeneralWord === "create" && currentGeneralWord === "trigger") {
          inTrigger = true;
        }
        previousGeneralWord = currentGeneralWord;
        currentGeneralWord = "";
      }

      // If in trigger, track BEGIN/END
      if (inTrigger) {
        if (/\w/.test(char)) {
          currentTriggerWord += char.toLowerCase();
        } else {
          if (currentTriggerWord === "begin") {
            triggerBlockNestingLevel++;
          } else if (currentTriggerWord === "end") {
            triggerBlockNestingLevel = Math.max(triggerBlockNestingLevel - 1, 0);
          }
          currentTriggerWord = "";
        }
      }

      // Handle semicolon
      if (char === ";" && sqlFileContent[i - 1] !== "\\") {
        if (inTrigger) {
          if (triggerBlockNestingLevel === 0) {
            result += char;
            const trimmedResult = result.trim();
            if (trimmedResult !== "") {
              queries.push(trimmedResult);
            }
            result = "";
            inTrigger = false;
            triggerBlockNestingLevel = 0;
            continue;
          } else {
            result += char;
          }
        } else {
          result += char;
          const trimmedResult = result.trim();
          if (trimmedResult !== "") {
            queries.push(trimmedResult);
          }
          result = "";
          continue;
        }
      }
    }

    result += char;
  }

  const finalTrimmed = result.trim();
  if (finalTrimmed !== "") {
    queries.push(finalTrimmed);
  }

  return queries
    .map((query) => {
      if (query.includes("TRIGGER") && query.includes("BEGIN")) {
        query = query.replace(/;+(?=\s+(?:END|\S|$))/g, ";");
      }
      return query.replace(/;+$/, ";");
    })
    .filter((query) => query !== ";" && query.trim() !== "");
}

// Get migration files
export async function getMigrationFiles() {
  const migrationsDir = join(process.cwd(), "database/migrations");
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith(".sql")).sort();
}

// Apply migrations
export async function applyMigrations(event: H3Event) {
  const db = useDrizzle(event);
  const d1 = db.$client;

  // Create migrations table if not exists
  await db.run(CreateMigrationsTableQuery);

  // Get applied migrations
  type Migration = { name: string };
  const appliedMigrations = (await d1.prepare("SELECT name FROM _migrations ORDER BY id").all()).results as Migration[];
  const appliedNames = appliedMigrations.map((m) => m.name);

  // Get local migration files
  const migrationFiles = await getMigrationFiles();
  const pendingMigrations = migrationFiles.filter((file) => !appliedNames.includes(file.replace(".sql", "")));

  if (!pendingMigrations.length) {
    logger.info("Database migrations up to date");
    return;
  }

  // Apply pending migrations
  for (const migration of pendingMigrations) {
    const migrationPath = join(process.cwd(), "database/migrations", migration);
    let query = await readFile(migrationPath, "utf-8");

    // Add migration record
    query += `
      INSERT INTO _migrations (name) VALUES ('${migration.replace(".sql", "")}');
    `;

    const queries = splitSqlQueries(query);

    try {
      for (const q of queries) {
        await db.run(sql.raw(q));
      }
      logger.info(`Applied migration: ${migration}`);
    } catch (error: any) {
      logger.error(`Failed to apply migration ${migration}:`, error?.message);
      if (error?.message?.includes("already exists")) {
        logger.info("If your database already contains the migration, you may need to manually mark it as applied.");
      }
      throw error;
    }
  }
}
