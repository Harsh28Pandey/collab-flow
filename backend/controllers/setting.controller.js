const bcrypt = require("bcryptjs");
const User = require("../models/user.model.js");
const { sendOtpMail } = require("../emailVerify/sendOtpMail.js");

// ==========================================
// GET ADMIN PROFILE
// ==========================================
const getAdminSettings = async (req, res) => {

    try {

        const user = await User.findById(req.user.id).select(
            "-password"
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                teamName: user.teamName,
                teamCode: user.teamCode,
                profileImageUrl:
                    user.profileImageUrl || "",
            },
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// UPDATE ADMIN SETTINGS
// ==========================================
const updateAdminSettings = async (req, res) => {

    try {

        const {
            name,
            teamName,
            profileImageUrl,
        } = req.body;

        const user = await User.findById(
            req.user.id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.name =
            name || user.name;

        user.teamName =
            teamName || user.teamName;

        user.profileImageUrl =
            profileImageUrl ||
            user.profileImageUrl;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            data: user,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message:
                "Server error. Please try again later.",
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date(Date.now() + 10 * 60 * 1000)

        user.otp = otp
        user.otpExpiry = expiry
        await user.save()
        await sendOtpMail(email, otp)

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

const verifyOTP = async (req, res) => {
    const { otp } = req.body
    const email = req.params.email

    if (!otp) {
        return res.status(400).json({
            success: false,
            message: "OTP is required"
        })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP not generated or already verified"
            })
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one"
            })
        }

        if (otp !== user.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            })
        }

        user.otp = null
        user.otpExpiry = null
        await user.save()

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body
    const email = req.params.email

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Password do not match"
        })
    }

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

module.exports = {
    getAdminSettings,
    updateAdminSettings,
    forgotPassword,
    verifyOTP,
    changePassword
};