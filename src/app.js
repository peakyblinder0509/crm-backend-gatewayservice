require("dotenv").config();
const express     = require("express");
const morgan      = require("morgan");
const cors        = require("cors");
const verifyToken = require("./middleware/auth");
const routes      = require("./routes/index");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ── Health Check (public) ────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status : "ok",
    service: "crm-backend-gateway",
    uptime : process.uptime(),
    time   : new Date().toISOString(),
  });
});

// ── JWT Auth Middleware ───────────────────────────────
app.use(verifyToken);

// ── Routes ───────────────────────────────────────────
app.use("/", routes);

// ── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status : "error",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Global Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("Gateway Error:", err.message);
  res.status(500).json({
    status : "error",
    message: "Internal gateway error",
  });
});

// ── Start Server ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CRM Gateway running on port ${PORT}`);
});

module.exports = app;
