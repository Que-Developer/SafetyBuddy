/**
 * Export live SafetyBuddy dummy data to server/sync-dummy-data.sql
 * Run: node server/export-dummy-data.js
 */
const fs = require("fs");
const path = require("path");

// Load server/.env without dotenv
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const { getPool } = require("./db");

const TABLES = [
  { name: "users", identity: true },
  { name: "CampusZone", identity: true },
  { name: "HelpContact", identity: true },
  { name: "SupportService", identity: true },
  { name: "SafetyResource", identity: true },
  { name: "PrivacySection", identity: true },
  { name: "ReportCategory", identity: true },
  { name: "MapMarker", identity: true },
  { name: "Student", identity: true },
  { name: "TrustedContact", identity: true },
  { name: "StudentTrustedContact", identity: false },
  { name: "Responder", identity: true },
  { name: "SafetyAlert", identity: true },
  { name: "SafetyAlertZone", identity: false },
  { name: "EmergencyAlert", identity: true },
  { name: "IncidentReport", identity: true },
  { name: "EmergencyAlertIncident", identity: false },
  { name: "AlertLocationPing", identity: true },
  { name: "AlertNotification", identity: true },
  { name: "WalkSession", identity: true },
  { name: "WalkLocationPing", identity: true },
  { name: "SupportReferral", identity: true },
  { name: "SafetyAlertReceipt", identity: false },
  { name: "RolePrivilege", identity: true },
];

const DELETE_ORDER = [
  "WalkLocationPing",
  "WalkSession",
  "AlertLocationPing",
  "AlertNotification",
  "SupportReferral",
  "SafetyAlertReceipt",
  "RolePrivilege",
  "EmergencyAlertIncident",
  "SafetyAlertZone",
  "StudentTrustedContact",
  "IncidentReport",
  "EmergencyAlert",
  "SafetyAlert",
  "TrustedContact",
  "Responder",
  "Student",
  "MapMarker",
  "ReportCategory",
  "PrivacySection",
  "SafetyResource",
  "SupportService",
  "HelpContact",
  "CampusZone",
  "users",
];

function quoteIdent(name) {
  return `[${String(name).replace(/]/g, "]]")}]`;
}

function sqlLiteral(val, type) {
  if (val === null || val === undefined) return "NULL";

  const typeName = String(type || "").toLowerCase();

  if (typeName === "bit") {
    if (typeof val === "boolean") return val ? "1" : "0";
    return Number(val) ? "1" : "0";
  }

  if (
    /int|decimal|numeric|float|real|money|tinyint|smallint|bigint/.test(
      typeName
    )
  ) {
    const n = Number(val);
    if (Number.isNaN(n)) return "NULL";
    return String(n);
  }

  if (val instanceof Date) {
    const iso = val.toISOString().replace("T", " ").replace("Z", "");
    return `N'${iso}'`;
  }

  if (
    /date|time/.test(typeName) &&
    typeof val === "string" &&
    /^\d{4}-\d{2}-\d{2}/.test(val)
  ) {
    return `N'${val.replace("T", " ").replace("Z", "").replace(/'/g, "''")}'`;
  }

  if (typeof val === "boolean") return val ? "1" : "0";
  if (typeof val === "number") {
    if (Number.isNaN(val)) return "NULL";
    return String(val);
  }
  if (Buffer.isBuffer(val)) {
    return `0x${val.toString("hex").toUpperCase()}`;
  }

  return `N'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  const pool = await getPool();
  const lines = [];
  const stamp = new Date().toISOString();

  lines.push(`/*
==============================================================================
  SafetyBuddy — sync dummy data from Safety-Alerts branch database
  Exported: ${stamp}
  Source: ${process.env.SQLSERVER || "localhost"} / ${process.env.SQLDATABASE || "SafetyBuddy"}

  HOW TO USE (on the other machine with the same schema):
    1. Ensure the SafetyBuddy database + tables already exist
       (run server/schema.sql, then start the API once so ensureSchema runs).
    2. sqlcmd -S localhost -E -d SafetyBuddy -i server/sync-dummy-data.sql

  WARNING: Deletes existing rows in these tables, then reloads this dump
  so primary keys and foreign keys match the source database.
==============================================================================
*/

USE SafetyBuddy;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
`);

  lines.push("/* ---- Clear in FK-safe order ---- */");
  for (const t of DELETE_ORDER) {
    lines.push(`DELETE FROM dbo.${quoteIdent(t)};`);
  }
  lines.push("");

  for (const table of TABLES) {
    const meta = await pool.request().query(`
      SELECT c.COLUMN_NAME, c.DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS c
      WHERE c.TABLE_SCHEMA = N'dbo' AND c.TABLE_NAME = N'${table.name}'
      ORDER BY c.ORDINAL_POSITION
    `);
    const columnNames = meta.recordset.map((r) => r.COLUMN_NAME);
    const typeByCol = Object.fromEntries(
      meta.recordset.map((r) => [r.COLUMN_NAME, r.DATA_TYPE])
    );

    const result = await pool.request().query(
      `SELECT ${columnNames.map(quoteIdent).join(", ")} FROM dbo.${quoteIdent(table.name)}`
    );
    const rows = result.recordset;

    lines.push(`/* ---- dbo.${table.name} (${rows.length} rows) ---- */`);
    if (rows.length === 0) {
      lines.push("-- (empty)");
      lines.push("");
      continue;
    }

    if (table.identity) {
      lines.push(`SET IDENTITY_INSERT dbo.${quoteIdent(table.name)} ON;`);
    }

    const colList = columnNames.map(quoteIdent).join(", ");
    for (const row of rows) {
      const values = columnNames
        .map((c) => sqlLiteral(row[c], typeByCol[c]))
        .join(", ");
      lines.push(
        `INSERT INTO dbo.${quoteIdent(table.name)} (${colList}) VALUES (${values});`
      );
    }

    if (table.identity) {
      lines.push(`SET IDENTITY_INSERT dbo.${quoteIdent(table.name)} OFF;`);
    }
    lines.push("");
  }

  lines.push(`COMMIT TRANSACTION;
GO

PRINT N'SafetyBuddy dummy data synced from Safety-Alerts export.';
GO
`);

  const out = path.join(__dirname, "sync-dummy-data.sql");
  // UTF-8 BOM helps SSMS/sqlcmd on Windows preserve Unicode (em dashes, etc.)
  fs.writeFileSync(out, "\uFEFF" + lines.join("\n"), "utf8");
  console.log(`Wrote ${out}`);
  console.log(`Tables exported: ${TABLES.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
