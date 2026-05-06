const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "crm-secret-key";

const verifyToken = (req, res, next) => {
  // Health check — skip auth
  if (req.path === "/health") return next();

  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status : "error",
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      status : "error",
      message: "Invalid or expired token",
    });
  }
};

module.exports = verifyToken;
