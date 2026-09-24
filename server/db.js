const crypto = require("crypto");
const sql = require("mssql/msnodesqlv8");

// SQL Server helpers — connect, users, login / register, and panic alerts.

// Hash passwords before storing (simple SHA-256 for the demo).
function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(`safetybuddy:${password}`)
    .digest("hex");
}

function buildConnectionString() {
  // Override with env vars if you're not on the default local SQL Server.
  const server = process.env.SQLSERVER || "(localdb)\\MSSQLLocalDB";
  const database = process.env.SQLDATABASE || "SafetyBuddy";
  const driver = process.env.SQL_DRIVER || "ODBC Driver 17 for SQL Server";
  return `Driver={${driver}};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
}

let poolPromise = null;

async function getPool() {
  // Reuse one connection pool for the whole process.
  if (!poolPromise) {
    poolPromise = sql.connect({
      connectionString: buildConnectionString(),
    });
  }
  return poolPromise;
}

function mapUser(row) {
  // DB uses snake_case; the app expects camelCase.
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

  // Demo accounts for local testing (insert any that are still missing).
  const seeds = [
    ["student@safetybuddy.campus", "Amahle Student", "student", "Student123!"],
    ["student2@safetybuddy.campus", "Lerato Student", "student", "Student123!"],
    ["student3@safetybuddy.campus", "Jordan Student", "student", "Student123!"],
    ["security@safetybuddy.campus", "Officer N. Jacobs", "security_staff", "Security123!"],
    ["admin@safetybuddy.campus", "Admin Support Staff", "security_admin", "Admin123!"],
  ];

  let added = 0;
  for (const [email, fullName, role, password] of seeds) {
    const existing = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id FROM dbo.users WHERE email = @email");
    if (existing.recordset.length > 0) continue;

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
    added += 1;
  }
  if (added > 0) {
    console.log(`Seeded ${added} demo user(s) into SQL Server.`);
  }
}

async function loginUser(email, password) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("email", sql.NVarChar, String(email).trim().toLowerCase())
    .query("SELECT * FROM dbo.users WHERE email = @email");

  const row = result.recordset[0];
  if (!row) return { ok: false, error: "No account found for that email." };

  // Compare the hashed password, never store plain text.
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
  // Reject duplicate emails before we try to insert.
  const existing = await pool
    .request()
    .input("email", sql.NVarChar, cleanedEmail)
    .query("SELECT id FROM dbo.users WHERE email = @email");

  if (existing.recordset.length > 0) {
    return { ok: false, error: "An account with this email already exists." };
  }

  // OUTPUT returns the new row so we can send it back to the app.
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
  // Newest accounts first — used by the admin screen.
  const pool = await getPool();
  const result = await pool
    .request()
    .query(
      "SELECT id, email, full_name, role, created_at FROM dbo.users ORDER BY created_at DESC"
    );
  return result.recordset.map(mapUser);
}

async function getUserById(id) {
  // Look up one account by id (e.g. /auth/me).
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

// Create the panic_alerts table on first run if it's missing.
async function ensurePanicAlertsTable() {
  const pool = await getPool();
  await pool.request().query(`
    IF OBJECT_ID('dbo.panic_alerts', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.panic_alerts (
        id INT IDENTITY(1,1) PRIMARY KEY,
        student_user_id INT NOT NULL,
        student_name NVARCHAR(120) NOT NULL,
        student_email NVARCHAR(160) NOT NULL,
        alert_type NVARCHAR(80) NOT NULL DEFAULT N'SOS — Security',
        location_label NVARCHAR(200) NOT NULL,
        lat FLOAT NULL,
        lng FLOAT NULL,
        status NVARCHAR(40) NOT NULL DEFAULT N'New',
        assigned_responder_id INT NULL,
        assigned_responder_name NVARCHAR(120) NULL,
        notes NVARCHAR(800) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
      CREATE INDEX IX_panic_alerts_status ON dbo.panic_alerts(status);
      CREATE INDEX IX_panic_alerts_created ON dbo.panic_alerts(created_at DESC);
    END
  `);
}

function mapPanicAlert(row) {
  // Turn a SQL row into the shape the mobile app expects.
  return {
    id: String(row.id),
    studentUserId: Number(row.student_user_id),
    studentName: row.student_name,
    studentEmail: row.student_email,
    alertType: row.alert_type,
    location: row.location_label,
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    status: row.status,
    assignedResponderId: row.assigned_responder_id
      ? Number(row.assigned_responder_id)
      : null,
    assignedResponder: row.assigned_responder_name || "Unassigned",
    notes: row.notes || "",
    timeTriggered: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createPanicAlert({
  studentUserId,
  studentName,
  studentEmail,
  alertType,
  locationLabel,
  lat,
  lng,
  notes,
}) {
  // Insert a new SOS row for the student.
  const pool = await getPool();
  const result = await pool
    .request()
    .input("student_user_id", sql.Int, Number(studentUserId))
    .input("student_name", sql.NVarChar, String(studentName || "Student"))
    .input("student_email", sql.NVarChar, String(studentEmail || ""))
    .input("alert_type", sql.NVarChar, String(alertType || "SOS — Security"))
    .input(
      "location_label",
      sql.NVarChar,
      String(locationLabel || "Location unavailable")
    )
    .input("lat", sql.Float, lat == null ? null : Number(lat))
    .input("lng", sql.Float, lng == null ? null : Number(lng))
    .input(
      "notes",
      sql.NVarChar,
      String(notes || "Student triggered Panic / SOS from SafetyBuddy.")
    )
    .query(`
      INSERT INTO dbo.panic_alerts
        (student_user_id, student_name, student_email, alert_type, location_label, lat, lng, notes)
      OUTPUT INSERTED.*
      VALUES
        (@student_user_id, @student_name, @student_email, @alert_type, @location_label, @lat, @lng, @notes)
    `);
  return mapPanicAlert(result.recordset[0]);
}

async function listPanicAlerts({ activeOnly = false } = {}) {
  // Newest first; optionally skip closed alerts.
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT TOP 100 *
    FROM dbo.panic_alerts
    ${
      activeOnly
        ? "WHERE status NOT IN (N'Resolved', N'False Alarm')"
        : ""
    }
    ORDER BY created_at DESC
  `);
  return result.recordset.map(mapPanicAlert);
}

async function getPanicAlertById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("id", sql.Int, Number(id))
    .query("SELECT * FROM dbo.panic_alerts WHERE id = @id");
  const row = result.recordset[0];
  return row ? mapPanicAlert(row) : null;
}

async function updatePanicAlert(id, { status, assignedResponderId, assignedResponderName, notes }) {
  const pool = await getPool();
  const existing = await getPanicAlertById(id);
  if (!existing) return null;

  // Only overwrite fields that were actually sent in the patch.
  const nextStatus = status || existing.status;
  const nextAssigneeId =
    assignedResponderId === undefined
      ? existing.assignedResponderId
      : assignedResponderId;
  const nextAssigneeName =
    assignedResponderName === undefined
      ? existing.assignedResponder
      : assignedResponderName;
  const nextNotes = notes === undefined ? existing.notes : notes;

  const result = await pool
    .request()
    .input("id", sql.Int, Number(id))
    .input("status", sql.NVarChar, nextStatus)
    .input(
      "assigned_responder_id",
      sql.Int,
      nextAssigneeId == null ? null : Number(nextAssigneeId)
    )
    .input(
      "assigned_responder_name",
      sql.NVarChar,
      nextAssigneeName || "Unassigned"
    )
    .input("notes", sql.NVarChar, nextNotes || "")
    .query(`
      UPDATE dbo.panic_alerts
      SET status = @status,
          assigned_responder_id = @assigned_responder_id,
          assigned_responder_name = @assigned_responder_name,
          notes = @notes,
          updated_at = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE id = @id
    `);
  return mapPanicAlert(result.recordset[0]);
}

async function listSecurityUsers() {
  // Everyone with a security or admin role.
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, email, full_name, role, created_at
    FROM dbo.users
    WHERE role IN (N'security_staff', N'security_admin')
    ORDER BY role DESC, full_name ASC
  `);
  return result.recordset.map(mapUser);
}

module.exports = {
  getPool,
  seedUsers,
  loginUser,
  registerUser,
  listUsers,
  getUserById,
  ensurePanicAlertsTable,
  createPanicAlert,
  listPanicAlerts,
  getPanicAlertById,
  updatePanicAlert,
  listSecurityUsers,
};
