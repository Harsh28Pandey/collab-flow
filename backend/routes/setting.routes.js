const express = require("express");

const router = express.Router();

const { protect } = require("../middlewares/auth.middleware.js");

const { getAdminSettings, updateAdminSettings, forgotPassword, verifyOTP, changePassword, getUserProfile, updateUserProfile } = require("../controllers/setting.controller.js");

router.get("/", protect, getAdminSettings);
router.put("/update", protect, updateAdminSettings);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/change-password/:email", changePassword);
router.get("/profile", protect, getUserProfile);
router.put("/profile/update", protect, updateUserProfile);

module.exports = router;