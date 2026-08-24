const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middlewares/auth.middleware.js");
const { getAdminInsights, getAdminInsightsAiSummary, getMyInsights, getMyInsightsAiSummary } = require("../controllers/insights.controller.js");

// GET /api/insights/admin?range=7|30|90|all   -> full insights payload (team-scoped)
// GET /api/insights/admin/ai-summary?range=... -> lazy AI narrative (slower, loaded separately)
router.get("/admin", protect, adminOnly, getAdminInsights);
router.get("/admin/ai-summary", protect, adminOnly, getAdminInsightsAiSummary);

// GET /api/insights/me?range=7|30|90|all           -> logged-in user's OWN insights only
// GET /api/insights/me/ai-summary?range=...        -> personalized AI summary
router.get("/me", protect, getMyInsights);
router.get("/me/ai-summary", protect, getMyInsightsAiSummary);

module.exports = router;