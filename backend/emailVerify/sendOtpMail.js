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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 32px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; background: #09090b; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9); color: #f4f4f5;">
        
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Collab<span style="color: #38bdf8;">Flow</span></h1>
        </div>

        <h2 style="color: #ffffff; text-align: center; font-size: 20px; margin-top: 0; font-weight: 700;">Password Reset OTP</h2>
        
        <p style="color: #a1a1aa; font-size: 15px; text-align: center; line-height: 1.6; margin-bottom: 8px;">
            Use the OTP below to reset your password. It is valid for <b style="color: #ffffff;">10 minutes</b>.
        </p>

        <div style="text-align: center; margin: 35px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 16px 24px; border-radius: 16px; display: inline-block; font-family: monospace;">${otp}</span>
        </div>

        <p style="color: #71717a; font-size: 13px; text-align: center; line-height: 1.5;">
            If you did not request this password reset, please safely ignore this email.
        </p>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; color: #52525b; font-weight: 500;">
            &copy; 2026 Collab Flow. All Rights Reserved.
        </div>
        
    </div>
`
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