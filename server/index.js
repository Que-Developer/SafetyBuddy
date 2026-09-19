require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  getPool,
  seedUsers,
  loginUser,
  registerUser,
  listUsers,
  getUserById,
} = require("./db");
const { signToken, requireAuth, requireRoles } = require("./auth");
const { ensureSchema } = require("./ensureSchema");
const domain = require("./domain");

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

function sendError(res, error, status = 500) {
  res.status(status).json({ ok: false, error: String(error.message || error) });
}

app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, database: process.env.SQLDATABASE || "SafetyBuddy" });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!String(email || "").trim() || !String(password || "")) {
      return res.status(400).json({
        ok: false,
        error: "Email and password are required.",
      });
    }
    const result = await loginUser(email, password);
    if (!result.ok) return res.status(401).json(result);
    const token = signToken(result.user);
    return res.json({ ok: true, user: result.user, token });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (
      !String(email || "").trim() ||
      !String(password || "") ||
      !String(fullName || "").trim()
    ) {
      return res.status(400).json({
        ok: false,
        error: "Full name, email, and password are required.",
      });
    }
    const result = await registerUser({ email, password, fullName, role });
    if (!result.ok) return res.status(400).json(result);
    const token = signToken(result.user);
    return res.status(201).json({ ok: true, user: result.user, token });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.auth.id);
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "Account no longer exists. Please log in again.",
      });
    }
    return res.json({ ok: true, user });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/users", requireAuth, requireRoles("security_admin"), async (_req, res) => {
  try {
    const users = await listUsers();
    res.json({ ok: true, users });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    const isSelf = requestedId === req.auth.id;
    const isAdmin = req.auth.role === "security_admin";
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        ok: false,
        error: "You are not authorised to view this account.",
      });
    }
    const user = await getUserById(requestedId);
    if (!user) return res.status(404).json({ ok: false, error: "User not found." });
    res.json({ ok: true, user });
  } catch (error) {
    sendError(res, error);
  }
});

/* ---- Domain reads (authenticated) ---- */
app.get("/safety-alerts", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, alerts: await domain.listSafetyAlerts() });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/safety-alerts", requireAuth, requireRoles("security_admin", "security_staff"), async (req, res) => {
  try {
    const alert = await domain.createSafetyAlert(req.body || {});
    res.status(201).json({ ok: true, alert });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/campus-zones", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, zones: await domain.listCampusZones() });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/help-contacts", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, contacts: await domain.listHelpContacts() });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/help-contacts", requireAuth, requireRoles("security_admin"), async (req, res) => {
  try {
    const { label, number } = req.body || {};
    if (!label || !number) {
      return res.status(400).json({ ok: false, error: "Label and number are required." });
    }
    const contact = await domain.createHelpContact({ label, number });
    res.status(201).json({ ok: true, contact });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/support-services", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, services: await domain.listSupportServices() });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/support-services", requireAuth, requireRoles("security_admin"), async (req, res) => {
  try {
    const { title, detail, actionText, iconKey } = req.body || {};
    if (!title || !detail || !actionText) {
      return res.status(400).json({
        ok: false,
        error: "Title, detail, and actionText are required.",
      });
    }
    const service = await domain.createSupportService({
      title,
      detail,
      actionText,
      iconKey,
    });
    res.status(201).json({ ok: true, service });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/safety-resources", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, resources: await domain.listSafetyResources() });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/safety-resources", requireAuth, requireRoles("security_admin"), async (req, res) => {
  try {
    const { title, summary, body } = req.body || {};
    if (!title || !summary || !body) {
      return res.status(400).json({
        ok: false,
        error: "Title, summary, and body are required.",
      });
    }
    const resource = await domain.createSafetyResource({ title, summary, body });
    res.status(201).json({ ok: true, resource });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/privacy-sections", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, sections: await domain.listPrivacySections() });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/report-categories", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, categories: await domain.listReportCategories() });
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/report-categories/:id", requireAuth, requireRoles("security_admin"), async (req, res) => {
  try {
    const categories = await domain.setReportCategoryActive(
      req.params.id,
      !!req.body?.active
    );
    res.json({ ok: true, categories });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/responders", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, responders: await domain.listResponders() });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/emergency-alerts", requireAuth, async (req, res) => {
  try {
    const alerts = await domain.listEmergencyAlerts({
      role: req.auth.role,
      userId: req.auth.id,
    });
    res.json({ ok: true, alerts });
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/emergency-alerts/:id", requireAuth, requireRoles("security_staff", "security_admin"), async (req, res) => {
  try {
    const alert = await domain.updateEmergencyAlertStatus(
      req.params.id,
      req.body?.status,
      req.body?.assignedResponder
    );
    res.json({ ok: true, alert });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/emergency-alerts", requireAuth, requireRoles("student", "security_admin"), async (req, res) => {
  try {
    const studentId = await domain.getStudentIdForUser(req.auth.id);
    const created = await domain.createEmergencyAlert({
      ...(req.body || {}),
      studentId: studentId || undefined,
      latitude: req.body?.latitude ?? req.body?.lat,
      longitude: req.body?.longitude ?? req.body?.lng,
      locationAccuracy: req.body?.locationAccuracy ?? req.body?.accuracy,
    });
    res.status(201).json({ ok: true, ...created });
  } catch (error) {
    sendError(res, error);
  }
});

app.post(
  "/emergency-alerts/:id/location",
  requireAuth,
  requireRoles("student", "security_admin"),
  async (req, res) => {
    try {
      const result = await domain.addAlertLocationPing(req.params.id, {
        latitude: req.body?.latitude ?? req.body?.lat,
        longitude: req.body?.longitude ?? req.body?.lng,
        accuracy: req.body?.accuracy ?? req.body?.locationAccuracy,
      });
      res.json({ ok: true, ...result });
    } catch (error) {
      sendError(res, error);
    }
  }
);
app.get("/incident-reports", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, reports: await domain.listIncidentReports() });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/incident-reports", requireAuth, async (req, res) => {
  try {
    const studentId = await domain.getStudentIdForUser(req.auth.id);
    const report = await domain.createIncidentReport({
      ...(req.body || {}),
      studentId: studentId || undefined,
    });
    res.status(201).json({ ok: true, report });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/trusted-contacts", requireAuth, async (req, res) => {
  try {
    const contacts = await domain.listTrustedContactsForUser(req.auth.id);
    res.json({ ok: true, contacts });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/trusted-contacts", requireAuth, async (req, res) => {
  try {
    const contacts = await domain.addTrustedContactForUser(req.auth.id, req.body || {});
    res.status(201).json({ ok: true, contacts });
  } catch (error) {
    sendError(res, error);
  }
});

app.delete("/trusted-contacts/:id", requireAuth, async (req, res) => {
  try {
    const contacts = await domain.removeTrustedContactForUser(
      req.auth.id,
      req.params.id
    );
    res.json({ ok: true, contacts });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/map/markers", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, markers: await domain.listMapMarkers() });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/map/destinations", requireAuth, async (_req, res) => {
  try {
    res.json({ ok: true, destinations: await domain.listMapDestinations() });
  } catch (error) {
    sendError(res, error);
  }
});

/* ---- Walk With Me (story 5) ---- */
app.get("/walk-sessions", requireAuth, async (req, res) => {
  try {
    const sessions = await domain.listWalkSessions({
      role: req.auth.role,
      userId: req.auth.id,
    });
    res.json({ ok: true, sessions });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/walk-sessions", requireAuth, requireRoles("student"), async (req, res) => {
  try {
    const session = await domain.createWalkSession(req.auth.id, req.body || {});
    res.status(201).json({ ok: true, session });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/walk-sessions/:id/ping", requireAuth, requireRoles("student"), async (req, res) => {
  try {
    const result = await domain.pingWalkSession(req.params.id, req.auth.id, {
      latitude: req.body?.latitude ?? req.body?.lat,
      longitude: req.body?.longitude ?? req.body?.lng,
      accuracy: req.body?.accuracy,
    });
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/walk-sessions/:id/end", requireAuth, requireRoles("student"), async (req, res) => {
  try {
    const result = await domain.endWalkSession(
      req.params.id,
      req.auth.id,
      req.body?.status
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

/* ---- Support referrals (story 11) ---- */
app.get("/support-referrals", requireAuth, async (req, res) => {
  try {
    const referrals = await domain.listSupportReferralsForUser(req.auth.id);
    res.json({ ok: true, referrals });
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/support-referrals/:id/ack", requireAuth, requireRoles("student"), async (req, res) => {
  try {
    const result = await domain.acknowledgeSupportReferral(
      req.auth.id,
      req.params.id
    );
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

app.post(
  "/support-referrals",
  requireAuth,
  requireRoles("security_staff", "security_admin"),
  async (req, res) => {
    try {
      const referral = await domain.createSupportReferral(req.body || {});
      res.status(201).json({ ok: true, referral });
    } catch (error) {
      sendError(res, error);
    }
  }
);

/* ---- Safety alert receipts (story 7) ---- */
app.post("/safety-alerts/:id/read", requireAuth, requireRoles("student"), async (req, res) => {
  try {
    const result = await domain.markSafetyAlertRead(req.auth.id, req.params.id);
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

/* ---- Role privileges (documentation / UI) ---- */
app.get("/role-privileges", requireAuth, async (req, res) => {
  try {
    const role =
      req.auth.role === "security_admin" ? req.query.role || null : req.auth.role;
    const privileges = await domain.listRolePrivileges(role);
    res.json({ ok: true, privileges });
  } catch (error) {
    sendError(res, error);
  }
});

async function start() {
  await getPool();
  await seedUsers();
  await ensureSchema(await getPool());
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SafetyBuddy API listening on http://localhost:${PORT}`);
    console.log(
      `SQL Server: ${process.env.SQLSERVER || "localhost"} / ${process.env.SQLDATABASE || "SafetyBuddy"}`
    );
  });
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
