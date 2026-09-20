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
  ensurePanicAlertsTable,
  createPanicAlert,
  listPanicAlerts,
  getPanicAlertById,
  updatePanicAlert,
  listSecurityUsers,
} = require("./db");
const { signToken, requireAuth, requireRoles } = require("./auth");

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

// Allowed alert statuses — keep in sync with the responder UI.
const STATUS_FLOW = [
  "New",
  "Acknowledged",
  "Responder Dispatched",
  "Resolved",
  "False Alarm",
];

// Quick check that SQL Server is reachable.
app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, database: process.env.SQLDATABASE || "SafetyBuddy" });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Email + password → JWT for the app.
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
    if (!result.ok) {
      return res.status(401).json(result);
    }

    const token = signToken(result.user);
    return res.json({ ok: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Create a new account and return a token so they're logged in immediately.
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body || {};
    if (!String(email || "").trim() || !String(password || "") || !String(fullName || "").trim()) {
      return res.status(400).json({
        ok: false,
        error: "Full name, email, and password are required.",
      });
    }

    const result = await registerUser({ email, password, fullName, role });
    if (!result.ok) {
      return res.status(400).json(result);
    }

    const token = signToken(result.user);
    return res.status(201).json({ ok: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Who is this token for? Used when the app restarts.
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
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Admin-only: list every registered user.
app.get(
  "/users",
  requireAuth,
  requireRoles("security_admin"),
  async (_req, res) => {
    try {
      const users = await listUsers();
      res.json({ ok: true, users });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error.message || error) });
    }
  }
);

app.get("/users/:id", requireAuth, async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    const isSelf = requestedId === req.auth.id;
    const isAdmin = req.auth.role === "security_admin";
    // You can only look up yourself unless you're an admin.
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        ok: false,
        error: "You are not authorised to view this account.",
      });
    }

    const user = await getUserById(requestedId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found." });
    }
    res.json({ ok: true, user });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// List of security / admin accounts that get panic requests.
app.get("/security/responders", requireAuth, async (_req, res) => {
  try {
    const responders = await listSecurityUsers();
    res.json({ ok: true, responders });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Student presses panic — create an SOS alert for campus security.
app.post("/panic-alerts", requireAuth, async (req, res) => {
  try {
    // Only students can create panic alerts.
    if (req.auth.role !== "student") {
      return res.status(403).json({
        ok: false,
        error: "Only students can trigger panic alerts.",
      });
    }

    const body = req.body || {};
    const alert = await createPanicAlert({
      studentUserId: req.auth.id,
      studentName: req.auth.fullName,
      studentEmail: req.auth.email,
      alertType: body.alertType || "SOS — Security",
      locationLabel: body.locationLabel,
      lat: body.lat,
      lng: body.lng,
      notes: body.notes,
    });

    const responders = await listSecurityUsers();
    return res.status(201).json({
      ok: true,
      alert,
      notifiedResponders: responders.map((r) => ({
        id: r.id,
        fullName: r.fullName,
        role: r.role,
      })),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Security dashboard — list panic alerts (newest first).
app.get(
  "/panic-alerts",
  requireAuth,
  requireRoles("security_staff", "security_admin"),
  async (req, res) => {
    try {
      const activeOnly = String(req.query.activeOnly || "") === "1";
      const alerts = await listPanicAlerts({ activeOnly });
      res.json({ ok: true, alerts });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error.message || error) });
    }
  }
);

// Student can see their own alert; security can see any.
app.get("/panic-alerts/:id", requireAuth, async (req, res) => {
  try {
    const alert = await getPanicAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({ ok: false, error: "Alert not found." });
    }
    const isOwner = alert.studentUserId === req.auth.id;
    const isSecurity =
      req.auth.role === "security_staff" || req.auth.role === "security_admin";
    if (!isOwner && !isSecurity) {
      return res.status(403).json({
        ok: false,
        error: "You are not authorised to view this alert.",
      });
    }
    res.json({ ok: true, alert });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

// Update alert status — staff advance it; students can resolve (I'm safe).
app.patch(
  "/panic-alerts/:id",
  requireAuth,
  requireRoles("security_staff", "security_admin", "student"),
  async (req, res) => {
    try {
      const alert = await getPanicAlertById(req.params.id);
      if (!alert) {
        return res.status(404).json({ ok: false, error: "Alert not found." });
      }

      const body = req.body || {};
      const isSecurity =
        req.auth.role === "security_staff" || req.auth.role === "security_admin";
      const isOwner = alert.studentUserId === req.auth.id;

      if (!isSecurity && !isOwner) {
        return res.status(403).json({
          ok: false,
          error: "You are not authorised to update this alert.",
        });
      }

      // Students may only cancel / mark themselves safe.
      if (!isSecurity) {
        if (body.status && body.status !== "Resolved" && body.status !== "False Alarm") {
          return res.status(403).json({
            ok: false,
            error: "Students can only end an alert as Resolved.",
          });
        }
      }

      if (body.status && !STATUS_FLOW.includes(body.status)) {
        return res.status(400).json({
          ok: false,
          error: `Invalid status. Use one of: ${STATUS_FLOW.join(", ")}`,
        });
      }

      const patch = {
        status: body.status,
        notes: body.notes,
      };

      // Staff can claim the alert for themselves.
      if (isSecurity) {
        if (body.assignToSelf) {
          patch.assignedResponderId = req.auth.id;
          patch.assignedResponderName = req.auth.fullName;
          if (!body.status || body.status === "New") {
            patch.status = body.status || "Acknowledged";
          }
        }
        if (body.assignedResponderId != null) {
          patch.assignedResponderId = body.assignedResponderId;
        }
        if (body.assignedResponderName != null) {
          patch.assignedResponderName = body.assignedResponderName;
        }
      }

      const updated = await updatePanicAlert(req.params.id, patch);
      res.json({ ok: true, alert: updated });
    } catch (error) {
      res.status(500).json({ ok: false, error: String(error.message || error) });
    }
  }
);

async function start() {
  await getPool();
  // First boot: add demo users if the table is empty.
  await seedUsers();
  // Make sure panic_alerts exists before we take traffic.
  await ensurePanicAlertsTable();
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
