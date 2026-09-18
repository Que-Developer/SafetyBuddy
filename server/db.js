const crypto = require("crypto");
const sql = require("mssql/msnodesqlv8");

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(`safetybuddy:${password}`)
    .digest("hex");
}

function buildConnectionString() {
  const server = process.env.SQLSERVER || "localhost";
  const database = process.env.SQLDATABASE || "SafetyBuddy";
  const driver = process.env.SQL_DRIVER || "ODBC Driver 17 for SQL Server";
  return `Driver={${driver}};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
}

let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect({
      connectionString: buildConnectionString(),
    });
  }
  return poolPromise;
}

function mapUser(row) {
  return {
    id: Number(row.id),
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  };
}

async function seedUsers() {
  const pool = await getPool();
  const countResult = await pool.request().query("SELECT COUNT(*) AS c FROM dbo.users");
  if (countResult.recordset[0].c > 0) return;

  const seeds = [
    ["student@safetybuddy.campus", "Amahle Student", "student", "Student123!"],
    ["security@safetybuddy.campus", "Officer N. Jacobs", "security_staff", "Security123!"],
    ["admin@safetybuddy.campus", "Admin Support Staff", "security_admin", "Admin123!"],
  ];

  for (const [email, fullName, role, password] of seeds) {
    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .input("full_name", sql.NVarChar, fullName)
      .input("role", sql.NVarChar, role)
      .input("password_hash", sql.NVarChar, hashPassword(password))
      .query(`
        INSERT INTO dbo.users (email, full_name, role, password_hash)
        VALUES (@email, @full_name, @role, @password_hash)
      `);
  }
  console.log("Seeded demo users into SQL Server.");
}

async function loginUser(email, password) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar, String(email).trim().toLowerCase())
    .query("SELECT * FROM dbo.users WHERE email = @email");

  const row = result.recordset[0];
  if (!row) return { ok: false, error: "No account found for that email." };

  if (row.password_hash !== hashPassword(password)) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }

  return { ok: true, user: mapUser(row) };
}

async function registerUser({ email, password, fullName, role }) {
  const cleanedEmail = String(email).trim().toLowerCase();
  if (!cleanedEmail.includes("@") || String(password).length < 6) {
    return {
      ok: false,
      error: "Enter a valid email and a password of at least 6 characters.",
    };
  }
  if (!String(fullName || "").trim()) {
    return { ok: false, error: "Please enter your full name." };
  }
  if (!["student", "security_staff", "security_admin"].includes(role)) {
    return { ok: false, error: "Invalid role." };
  }

  const pool = await getPool();
  const existing = await pool
    .request()
    .input("email", sql.NVarChar, cleanedEmail)
    .query("SELECT id FROM dbo.users WHERE email = @email");

  if (existing.recordset.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const insert = await pool
    .request()
    .input("email", sql.NVarChar, cleanedEmail)
    .input("full_name", sql.NVarChar, String(fullName).trim())
    .input("role", sql.NVarChar, role)
    .input("password_hash", sql.NVarChar, hashPassword(password))
    .query(`
      INSERT INTO dbo.users (email, full_name, role, password_hash)
      OUTPUT INSERTED.id, INSERTED.email, INSERTED.full_name, INSERTED.role, INSERTED.created_at
      VALUES (@email, @full_name, @role, @password_hash)
    `);

  return { ok: true, user: mapUser(insert.recordset[0]) };
}

async function listUsers() {
  const pool = await getPool();
  const result = await pool
    .request()
    .query(
      "SELECT id, email, full_name, role, created_at FROM dbo.users ORDER BY created_at DESC"
    );
  return result.recordset.map(mapUser);
}

async function getUserById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, Number(id))
    .query(
      "SELECT id, email, full_name, role, created_at FROM dbo.users WHERE id = @id"
    );
  const row = result.recordset[0];
  return row ? mapUser(row) : null;
}

module.exports = {
  getPool,
  seedUsers,
  loginUser,
  registerUser,
  listUsers,
  getUserById,
};
