const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const { getAdminInsights, getAdminInsightsAiSummary } = require("../controllers/insights.controller.js");

// GET /api/insights/admin?range=7|30|90|all   -> full insights payload (team-scoped)
// GET /api/insights/admin/ai-summary?range=... -> lazy AI narrative (slower, loaded separately)
router.get("/admin", protect, adminOnly, getAdminInsights);
router.get("/admin/ai-summary", protect, adminOnly, getAdminInsightsAiSummary);

module.exports = router;