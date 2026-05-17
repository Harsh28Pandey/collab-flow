const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword, forgotPassword, logoutUser, verification, verifyOTP, getTeamByCode } = require("../controllers/auth.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");
const upload = require("../middlewares/upload.middleware.js");

const router = express.Router();

//* auth routes
router.post("/register", registerUser);  //* register a 
router.post("/verify", verification); //* verify the user email
router.post("/login", loginUser);  //* login user
router.get("/profile", protect, getUserProfile);  //* get the user profile
router.put("/profile", protect, updateUserProfile);  //* update the user profile
router.post("/logout", protect, logoutUser)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp/:email", verifyOTP)
router.post("/change-password/:email", changePassword)
router.get("/team/:teamCode", getTeamByCode);  //* get team name by team code

router.post("/upload-image", upload.single("image"), (req, res) => {  //* upload the image and get the uploaded image link
    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
})

module.exports = router;