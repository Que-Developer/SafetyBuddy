/**
 * Export live SafetyBuddy schema (tables, PKs, FKs, indexes, defaults)
 * to server/SafetyBuddy-full-schema.sql
 *
 * Run: node server/export-full-schema.js
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}

const sql = require("mssql/msnodesqlv8");

const SKIP = new Set(["sysdiagrams"]);

function buildConnectionString() {
  const server = process.env.SQLSERVER || "localhost";
  const database = process.env.SQLDATABASE || "SafetyBuddy";
  const driver = process.env.SQL_DRIVER || "ODBC Driver 17 for SQL Server";
  return `Driver={${driver}};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
}

async function getPool() {
  return sql.connect({
    connectionString: buildConnectionString(),
    connectionTimeout: 60000,
    requestTimeout: 120000,
  });
}

function qIdent(name) {
  return `[${String(name).replace(/]/g, "]]")}]`;
}

function sqlLiteral(v) {
  if (v == null) return "NULL";
  return `N'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const pool = await getPool();
  const out = [];
  const stamp = new Date().toISOString().slice(0, 19).replace("T", " ");

  out.push(`/*`);
  out.push(`  SafetyBuddy — full schema with relationships`);
  out.push(`  Exported from live SQL Server on ${stamp}`);
  out.push(`  Database: SafetyBuddy`);
  out.push(``);
  out.push(`  How to use on another PC:`);
  out.push(`  1. Install SQL Server (or Express) + ODBC Driver 17`);
  out.push(`  2. CREATE DATABASE SafetyBuddy;`);
  out.push(`  3. Run this script against SafetyBuddy`);
  out.push(`  4. (Optional) run sync-dummy-data.sql for shared seed data`);
  out.push(`  5. Copy server/.env and point SQLSERVER at localhost`);
  out.push(`*/`);
  out.push(`USE [SafetyBuddy];`);
  out.push(`GO`);
  out.push(``);
  out.push(`SET ANSI_NULLS ON;`);
  out.push(`SET QUOTED_IDENTIFIER ON;`);
  out.push(`GO`);
  out.push(``);

  const tables = (
    await pool.request().query(`
      SELECT s.name AS schema_name, t.name AS table_name, t.object_id
      FROM sys.tables t
      INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
      WHERE t.is_ms_shipped = 0
      ORDER BY s.name, t.name
    `)
  ).recordset.filter((r) => !SKIP.has(r.table_name));

  const columns = (
    await pool.request().query(`
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        c.column_id,
        c.name AS column_name,
        ty.name AS type_name,
        c.max_length,
        c.precision,
        c.scale,
        c.is_nullable,
        c.is_identity,
        ic.seed_value,
        ic.increment_value,
        c.is_computed,
        cc.definition AS computed_definition,
        dc.definition AS default_definition,
        dc.name AS default_name,
        c.collation_name
      FROM sys.tables t
      INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
      INNER JOIN sys.columns c ON c.object_id = t.object_id
      INNER JOIN sys.types ty ON ty.user_type_id = c.user_type_id
      LEFT JOIN sys.identity_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      LEFT JOIN sys.computed_columns cc ON cc.object_id = c.object_id AND cc.column_id = c.column_id
      LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
      WHERE t.is_ms_shipped = 0
      ORDER BY s.name, t.name, c.column_id
    `)
  ).recordset;

  const pkCols = (
    await pool.request().query(`
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        kc.name AS constraint_name,
        c.name AS column_name,
        ic.key_ordinal
      FROM sys.key_constraints kc
      INNER JOIN sys.tables t ON t.object_id = kc.parent_object_id
      INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
      INNER JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
      INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
      WHERE kc.type = 'PK' AND t.is_ms_shipped = 0
      ORDER BY s.name, t.name, ic.key_ordinal
    `)
  ).recordset;

  const fks = (
    await pool.request().query(`
      SELECT
        sch.name AS schema_name,
        parent.name AS table_name,
        fk.name AS fk_name,
        refsch.name AS ref_schema,
        ref.name AS ref_table,
        fk.delete_referential_action_desc AS on_delete,
        fk.update_referential_action_desc AS on_update,
        pc.name AS parent_column,
        rc.name AS ref_column,
        fkc.constraint_column_id
      FROM sys.foreign_keys fk
      INNER JOIN sys.tables parent ON parent.object_id = fk.parent_object_id
      INNER JOIN sys.schemas sch ON sch.schema_id = parent.schema_id
      INNER JOIN sys.tables ref ON ref.object_id = fk.referenced_object_id
      INNER JOIN sys.schemas refsch ON refsch.schema_id = ref.schema_id
      INNER JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
      INNER JOIN sys.columns pc ON pc.object_id = fkc.parent_object_id AND pc.column_id = fkc.parent_column_id
      INNER JOIN sys.columns rc ON rc.object_id = fkc.referenced_object_id AND rc.column_id = fkc.referenced_column_id
      WHERE parent.is_ms_shipped = 0
      ORDER BY sch.name, parent.name, fk.name, fkc.constraint_column_id
    `)
  ).recordset;

  const uniques = (
    await pool.request().query(`
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        i.name AS index_name,
        i.is_unique_constraint,
        c.name AS column_name,
        ic.key_ordinal
      FROM sys.indexes i
      INNER JOIN sys.tables t ON t.object_id = i.object_id
      INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
      INNER JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
      INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
      WHERE t.is_ms_shipped = 0
        AND i.is_primary_key = 0
        AND i.is_unique = 1
        AND i.type_desc <> 'XML'
        AND ic.is_included_column = 0
      ORDER BY s.name, t.name, i.name, ic.key_ordinal
    `)
  ).recordset;

  const indexes = (
    await pool.request().query(`
      SELECT
        s.name AS schema_name,
        t.name AS table_name,
        i.name AS index_name,
        i.is_unique,
        i.type_desc,
        c.name AS column_name,
        ic.key_ordinal,
        ic.is_descending_key,
        ic.is_included_column
      FROM sys.indexes i
      INNER JOIN sys.tables t ON t.object_id = i.object_id
      INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
      INNER JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
      INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
      WHERE t.is_ms_shipped = 0
        AND i.is_primary_key = 0
        AND i.is_unique_constraint = 0
        AND i.type > 0
        AND i.name IS NOT NULL
      ORDER BY s.name, t.name, i.name, ic.is_included_column, ic.key_ordinal
    `)
  ).recordset;

  function typeSql(col) {
    const t = col.type_name.toLowerCase();
    if (col.is_computed) return null;
    if (["nvarchar", "nchar", "varchar", "char", "varbinary", "binary"].includes(t)) {
      if (col.max_length === -1) return `${col.type_name}(MAX)`;
      const len =
        t.startsWith("n") && t !== "ntext"
          ? col.max_length / 2
          : col.max_length;
      return `${col.type_name}(${len})`;
    }
    if (["decimal", "numeric"].includes(t)) {
      return `${col.type_name}(${col.precision},${col.scale})`;
    }
    if (["datetime2", "datetimeoffset", "time"].includes(t)) {
      return `${col.type_name}(${col.scale})`;
    }
    if (t === "float" && col.precision) {
      return `${col.type_name}(${col.precision})`;
    }
    return col.type_name;
  }

  const colsByTable = new Map();
  for (const c of columns) {
    if (SKIP.has(c.table_name)) continue;
    const key = `${c.schema_name}.${c.table_name}`;
    if (!colsByTable.has(key)) colsByTable.set(key, []);
    colsByTable.get(key).push(c);
  }

  const pkByTable = new Map();
  for (const r of pkCols) {
    if (SKIP.has(r.table_name)) continue;
    const key = `${r.schema_name}.${r.table_name}`;
    if (!pkByTable.has(key)) pkByTable.set(key, { name: r.constraint_name, cols: [] });
    pkByTable.get(key).cols.push(r.column_name);
  }

  // Relationship diagram header
  out.push(`/*`);
  out.push(`  FOREIGN KEY RELATIONSHIPS`);
  const fkGroups = new Map();
  for (const r of fks) {
    if (SKIP.has(r.table_name) || SKIP.has(r.ref_table)) continue;
    if (!fkGroups.has(r.fk_name)) {
      fkGroups.set(r.fk_name, {
        ...r,
        parentCols: [],
        refCols: [],
      });
    }
    const g = fkGroups.get(r.fk_name);
    g.parentCols.push(r.parent_column);
    g.refCols.push(r.ref_column);
  }
  for (const g of fkGroups.values()) {
    out.push(
      `  ${g.schema_name}.${g.table_name}(${g.parentCols.join(",")}) -> ${g.ref_schema}.${g.ref_table}(${g.refCols.join(",")})  [${g.fk_name}] ON DELETE ${g.on_delete} ON UPDATE ${g.on_update}`
    );
  }
  out.push(`*/`);
  out.push(``);

  // Drop FKs then tables (safe re-run)
  out.push(`/* ===== DROP existing objects (safe re-run) ===== */`);
  for (const g of fkGroups.values()) {
    out.push(
      `IF OBJECT_ID(N'${g.schema_name}.${g.fk_name}', N'F') IS NOT NULL ALTER TABLE ${qIdent(g.schema_name)}.${qIdent(g.table_name)} DROP CONSTRAINT ${qIdent(g.fk_name)};`
    );
  }
  out.push(`GO`);
  out.push(``);

  // Drop in reverse dependency order approximation: children first
  const dropOrder = [...tables].reverse();
  for (const t of dropOrder) {
    out.push(
      `IF OBJECT_ID(N'${t.schema_name}.${t.table_name}', N'U') IS NOT NULL DROP TABLE ${qIdent(t.schema_name)}.${qIdent(t.table_name)};`
    );
  }
  out.push(`GO`);
  out.push(``);

  out.push(`/* ===== CREATE TABLES ===== */`);
  for (const t of tables) {
    const key = `${t.schema_name}.${t.table_name}`;
    const cols = colsByTable.get(key) || [];
    out.push(`CREATE TABLE ${qIdent(t.schema_name)}.${qIdent(t.table_name)} (`);
    const lines = [];
    for (const c of cols) {
      if (c.is_computed) {
        lines.push(
          `  ${qIdent(c.column_name)} AS ${c.computed_definition}`
        );
        continue;
      }
      let line = `  ${qIdent(c.column_name)} ${typeSql(c)}`;
      if (c.is_identity) {
        line += ` IDENTITY(${c.seed_value},${c.increment_value})`;
      }
      line += c.is_nullable ? ` NULL` : ` NOT NULL`;
      if (c.default_definition) {
        line += ` CONSTRAINT ${qIdent(c.default_name)} DEFAULT ${c.default_definition}`;
      }
      lines.push(line);
    }
    const pk = pkByTable.get(key);
    if (pk) {
      lines.push(
        `  CONSTRAINT ${qIdent(pk.name)} PRIMARY KEY (${pk.cols.map(qIdent).join(", ")})`
      );
    }
    out.push(lines.join(",\n"));
    out.push(`);`);
    out.push(`GO`);
    out.push(``);
  }

  // Unique constraints
  out.push(`/* ===== UNIQUE CONSTRAINTS / UNIQUE INDEXES ===== */`);
  const uniqGroups = new Map();
  for (const r of uniques) {
    if (SKIP.has(r.table_name)) continue;
    const k = `${r.schema_name}.${r.table_name}.${r.index_name}`;
    if (!uniqGroups.has(k)) {
      uniqGroups.set(k, {
        schema_name: r.schema_name,
        table_name: r.table_name,
        index_name: r.index_name,
        is_unique_constraint: r.is_unique_constraint,
        cols: [],
      });
    }
    uniqGroups.get(k).cols.push(r.column_name);
  }
  for (const u of uniqGroups.values()) {
    if (u.is_unique_constraint) {
      out.push(
        `ALTER TABLE ${qIdent(u.schema_name)}.${qIdent(u.table_name)} ADD CONSTRAINT ${qIdent(u.index_name)} UNIQUE (${u.cols.map(qIdent).join(", ")});`
      );
    } else {
      out.push(
        `CREATE UNIQUE INDEX ${qIdent(u.index_name)} ON ${qIdent(u.schema_name)}.${qIdent(u.table_name)} (${u.cols.map(qIdent).join(", ")});`
      );
    }
  }
  out.push(`GO`);
  out.push(``);

  // Non-unique indexes
  out.push(`/* ===== INDEXES ===== */`);
  const idxGroups = new Map();
  for (const r of indexes) {
    if (SKIP.has(r.table_name)) continue;
    const k = `${r.schema_name}.${r.table_name}.${r.index_name}`;
    if (!idxGroups.has(k)) {
      idxGroups.set(k, {
        schema_name: r.schema_name,
        table_name: r.table_name,
        index_name: r.index_name,
        is_unique: r.is_unique,
        keys: [],
        includes: [],
      });
    }
    const g = idxGroups.get(k);
    const col = `${qIdent(r.column_name)}${r.is_descending_key ? " DESC" : ""}`;
    if (r.is_included_column) g.includes.push(qIdent(r.column_name));
    else g.keys.push(col);
  }
  for (const i of idxGroups.values()) {
    const uniq = i.is_unique ? "UNIQUE " : "";
    let sql = `CREATE ${uniq}INDEX ${qIdent(i.index_name)} ON ${qIdent(i.schema_name)}.${qIdent(i.table_name)} (${i.keys.join(", ")})`;
    if (i.includes.length) sql += ` INCLUDE (${i.includes.join(", ")})`;
    sql += `;`;
    out.push(sql);
  }
  out.push(`GO`);
  out.push(``);

  // Foreign keys
  out.push(`/* ===== FOREIGN KEY RELATIONSHIPS ===== */`);
  for (const g of fkGroups.values()) {
    const onDel =
      g.on_delete && g.on_delete !== "NO_ACTION"
        ? ` ON DELETE ${g.on_delete.replace("_", " ")}`
        : "";
    const onUpd =
      g.on_update && g.on_update !== "NO_ACTION"
        ? ` ON UPDATE ${g.on_update.replace("_", " ")}`
        : "";
    out.push(
      `ALTER TABLE ${qIdent(g.schema_name)}.${qIdent(g.table_name)} ADD CONSTRAINT ${qIdent(g.fk_name)} FOREIGN KEY (${g.parentCols.map(qIdent).join(", ")}) REFERENCES ${qIdent(g.ref_schema)}.${qIdent(g.ref_table)} (${g.refCols.map(qIdent).join(", ")})${onDel}${onUpd};`
    );
  }
  out.push(`GO`);
  out.push(``);
  out.push(`PRINT N'SafetyBuddy schema created successfully.';`);
  out.push(`GO`);

  const outPath = path.join(__dirname, "SafetyBuddy-full-schema.sql");
  fs.writeFileSync(outPath, out.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Tables: ${tables.length}`);
  console.log(`Foreign keys: ${fkGroups.size}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
