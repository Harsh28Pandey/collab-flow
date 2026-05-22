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
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #dbe7ff; border-radius: 10px; background: #ffffff;">
                    <h2 style="color: #0f172a; text-align: center;">Password Reset OTP</h2>
                    <p style="color: #334155; font-size: 16px;">Use the OTP below to reset your password. It is valid for <b>10 minutes</b>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; background: #eef4ff; padding: 12px 24px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p style="color: #64748b; font-size: 13px;">If you did not request this, please ignore this email.</p>
                    <div style="text-align: center; margin-top: 20px; font-size: 13px; color: #64748b;">&copy; 2026 Collab Flow. All Rights Reserved.</div>
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