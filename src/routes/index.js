const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const router  = express.Router();

// ── Service URLs ─────────────────────────────────────
const DEAL_SERVICE    = process.env.DEAL_SERVICE_URL    || "http://localhost:3001";
const CONTACT_SERVICE = process.env.CONTACT_SERVICE_URL || "http://localhost:3002";
const LEAD_SERVICE    = process.env.LEAD_SERVICE_URL    || "http://localhost:3003";
const AUTH_SERVICE    = process.env.AUTH_SERVICE_URL    || "http://localhost:3004";

// ── Proxy helper ─────────────────────────────────────
const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(502).json({
          status : "error",
          message: `Service unavailable: ${err.message}`,
        });
      },
    },
  });

// ── Routes ───────────────────────────────────────────
// Auth — public (no JWT)
router.use("/api/auth",     proxy(AUTH_SERVICE));

// Protected routes
router.use("/api/deals",    proxy(DEAL_SERVICE));
router.use("/api/contacts", proxy(CONTACT_SERVICE));
router.use("/api/leads",    proxy(LEAD_SERVICE));

module.exports = router;
