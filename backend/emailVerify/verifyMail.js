const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Template inline rakha hai - Vercel par fs.readFileSync kaam nahi karta
const getEmailTemplate = (token, clientUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #eef4ff; font-family: 'Segoe UI', sans-serif; padding: 40px 15px; }
        .wrapper { max-width: 560px; margin: auto; }
        .card {
            background: #ffffff;
            border-radius: 22px;
            overflow: hidden;
            border: 1px solid #dbeafe;
            box-shadow: 0 10px 35px rgba(37, 99, 235, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        .top {
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            padding: 45px 30px;
            text-align: center;
        }
        .top h1 { color: #ffffff; font-size: 30px; font-weight: 700; margin-bottom: 10px; }
        .top p { color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6; }
        .content { padding: 40px 35px; }
        .content h2 { color: #0f172a; font-size: 24px; margin-bottom: 18px; }
        .content p { color: #475569; font-size: 16px; line-height: 1.8; margin-bottom: 18px; }
        .btn-wrapper { text-align: center; margin: 35px 0; }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #3b82f6);
            color: #ffffff !important;
            text-decoration: none;
            padding: 15px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 10px 22px rgba(37, 99, 235, 0.25);
        }
        .note {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 16px;
            border-radius: 12px;
            margin-top: 10px;
        }
        .note p { margin: 0; color: #1e40af; font-size: 14px; }
        .footer {
            text-align: center;
            padding: 22px;
            border-top: 1px solid #e2e8f0;
            background: #f8fbff;
        }
        .footer p { font-size: 13px; color: #64748b; }
        @media screen and (max-width: 600px) {
            .top { padding: 38px 22px; }
            .content { padding: 32px 24px; }
            .top h1 { font-size: 26px; }
            .content h2 { font-size: 22px; }
            .btn { width: 100%; padding: 15px 20px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <div class="top">
                <h1>Verify Your Email</h1>
                <p>Complete your account verification to continue using Collab Flow</p>
            </div>
            <div class="content">
                <h2>Hello 👋</h2>
                <p>
                    Thanks for signing up on <strong>Collab Flow</strong>.
                    Please verify your email address by clicking the button below.
                </p>
                <div class="btn-wrapper">
                    <a href="${clientUrl}/verify?token=${encodeURIComponent(token)}" class="btn" target="_blank">
                        Verify Email
                    </a>
                </div>
                <div class="note">
                    <p>This verification link may expire after some time for security reasons.</p>
                </div>
            </div>
            <div class="footer">
                <p>© 2026 Collab Flow. All Rights Reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const verifyMail = async (token, email) => {

    // ✅ .env variables check - missing hone par clear error
    if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
        throw new Error("MAIL_USER ya MAIL_PASSWORD .env mein set nahi hai");
    }

    try {

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

        // ✅ Template directly generate ho raha hai - koi file read nahi
        const htmlToSend = getEmailTemplate(token, clientUrl);

        // ✅ Port 465 + secure: true - Vercel par 587 block hota hai
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true, // SSL - port 465 ke liye zaroori
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD, // Gmail App Password hona chahiye
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 15000,
        });

        // ❌ transporter.verify() REMOVE kar diya - Vercel par hang karta tha

        const mailOptions = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Email Verification - Collab Flow",
            html: htmlToSend,
        };

        console.log(`Sending verification email to: ${email}`);

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent successfully:", info.messageId);

        return info;

    } catch (error) {

        // ✅ Specific error messages for easy debugging
        if (error.code === "EAUTH") {
            console.error("Gmail Auth Error: MAIL_USER ya MAIL_PASSWORD galat hai, ya App Password use nahi kiya");
        } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
            console.error("Connection Error: SMTP server se connect nahi ho pa raha - Vercel outbound ports check karo");
        } else if (error.code === "EENVELOPE") {
            console.error("Invalid Email Address:", email);
        } else {
            console.error("Email send failed:", error.message);
        }

        throw error;
    }
};

module.exports = { verifyMail };


// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// const fs = require("fs");
// const path = require("path");
// const handlebars = require("handlebars");

// dotenv.config();

// const verifyMail = async (token, email) => {

//     try {

//         //* template file path
//         const templatePath = path.resolve(__dirname, "template.hbs");

//         //* read template file
//         const emailTemplateSource = fs.readFileSync(
//             templatePath,
//             "utf-8"
//         );

//         //* compile handlebars template
//         const template = handlebars.compile(emailTemplateSource);

//         //* frontend client url
//         const clientUrl =
//             process.env.CLIENT_URL || "http://localhost:5173";

//         //* html output
//         const htmlToSend = template({
//             token: encodeURIComponent(token),
//             clientUrl
//         });

//         //* gmail smtp transporter
//         const transporter = nodemailer.createTransport({
//             host: "smtp.gmail.com",
//             port: 587,
//             secure: false,
//             auth: {
//                 user: process.env.MAIL_USER,
//                 pass: process.env.MAIL_PASSWORD
//             },
//             connectionTimeout: 10000,
//             greetingTimeout: 10000,
//             socketTimeout: 10000
//         });

//         //* verify smtp connection
//         await transporter.verify();

//         console.log("SMTP Connected Successfully");

//         //* mail configuration
//         const mailConfigurations = {
//             from: `"Collab Flow" <${process.env.MAIL_USER}>`,
//             to: email,
//             subject: "Email Verification",
//             html: htmlToSend,
//         };

//         //* send mail
//         // const info = await transporter.sendMail(mailConfigurations);
//         console.log("Sending email now...");

//         const info =
//             await transporter.sendMail(mailConfigurations);

//         console.log("Email sent successfully");
//         console.log(info);

//         return info;

//     } catch (error) {

//         console.error("Email send failed:");
//         console.error(error);

//         throw error;
//     }
// };

// module.exports = { verifyMail };