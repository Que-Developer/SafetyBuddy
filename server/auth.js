const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "safetybuddy-dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "12h";

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      error: "Authorization required. Please log in.",
    });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName,
    };
    return next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: "Session expired or invalid. Please log in again.",
    });
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({
        ok: false,
        error: "Authorization required. Please log in.",
      });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({
        ok: false,
        error: "You are not authorised to access this resource.",
      });
    }
    return next();
  };
}

module.exports = {
  signToken,
  requireAuth,
  requireRoles,
  JWT_SECRET,
};
