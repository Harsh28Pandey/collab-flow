const { sendOtpMail } = require("../emailVerify/sendOtpMail.js");
const { verifyMail } = require("../emailVerify/verifyMail.js");
const User = require('../models/user.model.js');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//* generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
*/
const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, role, teamName, teamCode } = req.body;

        //* check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        let adminTeamName = null;

        //* role validation
        if (!role || !["admin", "member"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        //* Admin: teamName aur teamCode dono zaroori hain
        if (role === "admin") {
            if (!teamName || !teamCode) {
                return res.status(400).json({ message: "Team name and team code are required for admin" });
            }

            //* check karo ki teamCode already kisi aur admin ne use na kiya ho
            const codeExists = await User.findOne({ teamCode });
            if (codeExists) {
                return res.status(400).json({ message: "Team code already taken, choose another" });
            }
        }

        //* Member: teamCode se admin dhundho
        if (role === "member") {
            if (!teamCode) {
                return res.status(400).json({ message: "Team code is required to join a team" });
            }

            //* teamCode valid hai ya nahi
            const adminUser = await User.findOne({ teamCode, role: "admin" });
            if (!adminUser) {
                return res.status(400).json({ message: "Invalid team code, no team found" });
            }

            adminTeamName = adminUser.teamName;
        }

        //* hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //* create verification token
        const verificationToken = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        //* create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role,
            teamName: role === "admin" ? teamName : adminTeamName,
            teamCode,   // admin apna banata hai, member admin ka use karta hai
            verificationToken,
            isVerified: false,
            isLoggedIn: false,
            otp: null,
            otpExpiry: null
        });

        //* send verification mail
        verifyMail(verificationToken, email).catch((err) => {
            console.error("Email send failed:", err.message);
        });

        //* return response
        res.status(201).json({
            message: "User registered successfully",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamName: user.teamName,
            teamCode: user.teamCode,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const verification = async (req, res) => {
    try {
        // ✅ Body se token lo
        const { token } = req.body

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
            // console.log(decoded)

        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "The registration token has expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Token verification Failed"
            })
        }

        const user = await User.findOne({ email: decoded.email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            })
        }

        user.verificationToken = null
        user.isVerified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// const verification = async (req, res) => {
//     try {
//         const authHeader = req.headers.authorization
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token is missing or invalid"
//             })
//         }

//         const token = authHeader.split(" ")[1]

//         let decoded
//         try {
//             decoded = jwt.verify(token, process.env.JWT_SECRET)
//         } catch (error) {
//             if (error.name === "TokenExpiredError") {
//                 return res.status(400).json({
//                     success: false,
//                     message: "The registration token has expired"
//                 })
//             }
//             return res.status(400).json({
//                 success: false,
//                 message: "Token verification Failed"
//             })
//         }

//         // const user = await User.findById(decoded.id)
//         // ✅ email se dhundho
//         const user = await User.findOne({ email: decoded.email })

//         if (!user) {
//             return res.status(400).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }

//         user.verificationToken = null
//         user.isVerified = true
//         await user.save()

//         return res.status(200).json({
//             success: true,
//             message: "Email verified successfully"
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
*/
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            })
        }

        //* compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        //* check if user is verified
        if (user.isVerified !== true) {
            return res.status(403).json({
                message: "Please verify your email first"
            });
        }

        //* update login status
        user.isLoggedIn = true;
        await user.save();

        //* return user data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamName: user.teamName,
            teamCode: user.teamCode,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Get user profile
 * @route GET /api/auth/profile
 * @access Private (requires JWT)
*/
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

/**
 * @desc Update user profile
 * @route PUT /api/auth/profile
 * @access Private (Requires JWT)
*/
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser._id)
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
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

const logoutUser = async (req, res) => {
    try {

        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isLoggedIn = false;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Logged Out Successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Get team name by team code
 * @route GET /api/auth/team/:teamCode
 * @access Public
*/
const getTeamByCode = async (req, res) => {
    try {

        const { teamCode } = req.params;

        if (!teamCode) {
            return res.status(400).json({
                success: false,
                message: "Team code is required"
            });
        }

        const admin = await User.findOne({
            teamCode,
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "No team found with this code"
            });
        }

        return res.status(200).json({
            success: true,
            teamName: admin.teamName
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { registerUser, verification, loginUser, getUserProfile, updateUserProfile, changePassword, forgotPassword, verifyOTP, logoutUser, getTeamByCode };