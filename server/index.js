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

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");
    res.json({ ok: true, database: process.env.SQLDATABASE || "SafetyBuddy" });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
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
    if (!result.ok) {
      return res.status(401).json(result);
    }

    const token = signToken(result.user);
    return res.json({ ok: true, user: result.user, token });
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error.message || error) });
  }
});

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

async function start() {
  await getPool();
  await seedUsers();
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
