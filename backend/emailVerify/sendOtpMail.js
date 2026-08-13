const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const sendOtpMail = async (email, otp) => {

    try {

        //* gmail smtp transporter
        //* FIX: service:"gmail" ki jagah explicit host/port use karo for reliability
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // ✅ port 587 ke saath secure false hona chahiye
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD, // Gmail App Password
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });

        //* verify smtp connection
        await transporter.verify();
        console.log("SMTP Connected for OTP mail");

        const mailOptions = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Password Reset OTP",
            html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 32px; border: 1px solid #fed7aa; border-radius: 16px; background: #ffffff; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.05);">
        
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Collab<span style="color: #f97316;">Flow</span></h1>
        </div>

        <h2 style="color: #0f172a; text-align: center; font-size: 20px; margin-top: 0;">Password Reset OTP</h2>
        
        <p style="color: #475569; font-size: 15px; text-align: center; line-height: 1.6; margin-bottom: 8px;">
            Use the OTP below to reset your password. It is valid for <b style="color: #0f172a;">10 minutes</b>.
        </p>

        <div style="text-align: center; margin: 35px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #ea580c; background: #fff7ed; border: 1px solid #ffedd5; padding: 16px 24px; border-radius: 12px; display: inline-block;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 13px; text-align: center; line-height: 1.5;">
            If you did not request this password reset, please safely ignore this email.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; font-weight: 500;">
            &copy; 2026 Collab Flow. All Rights Reserved.
        </div>
        
    </div>
`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("OTP Email sent:", info.messageId);
        return info;

    } catch (error) {
        console.error("OTP Email send failed:");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        throw error;
    }
};

module.exports = { sendOtpMail };