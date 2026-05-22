const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const verifyMail = async (token, email) => {

    try {

        //* frontend client url
        const clientUrl =
            process.env.CLIENT_URL || "http://localhost:5173";

        //* verification url
        const verifyUrl =
            `${clientUrl}/verify?token=${encodeURIComponent(token)}`;

        //* email html
        const htmlToSend = `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email Verification</title>
        </head>

        <body style="margin:0;padding:0;background:#eef4ff;font-family:Segoe UI,sans-serif;">

            <div style="max-width:600px;margin:40px auto;padding:0 15px;">

                <div style="background:#ffffff;border-radius:24px;overflow:hidden;
                    box-shadow:0 10px 40px rgba(37,99,235,0.12);
                    border:1px solid #dbeafe;">

                    <!-- Top Section -->
                    <div style="background:linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa);
                        padding:45px 30px;text-align:center;">

                        <div style="width:70px;height:70px;
                            background:rgba(255,255,255,0.15);
                            border-radius:20px;
                            margin:auto;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:30px;
                            font-weight:bold;
                            color:white;
                            border:1px solid rgba(255,255,255,0.2);">

                            CF

                        </div>

                        <h1 style="color:white;font-size:30px;
                            margin-top:18px;margin-bottom:10px;">

                            Verify Your Email

                        </h1>

                        <p style="color:#dbeafe;font-size:15px;line-height:1.7;">

                            Please verify your email address to activate your account.

                        </p>

                    </div>

                    <!-- Content -->
                    <div style="padding:40px 32px;">

                        <p style="font-size:16px;color:#334155;line-height:1.8;">

                            Welcome to <strong>Collab Flow</strong> 🎉

                        </p>

                        <p style="font-size:16px;color:#475569;line-height:1.8;">

                            Click the button below to verify your email address
                            and continue using your account.

                        </p>

                        <div style="text-align:center;margin:35px 0;">

                            <a href="${verifyUrl}"
                                target="_blank"
                                style="
                                    display:inline-block;
                                    padding:15px 32px;
                                    background:linear-gradient(135deg,#2563eb,#3b82f6);
                                    color:#ffffff;
                                    text-decoration:none;
                                    border-radius:14px;
                                    font-size:16px;
                                    font-weight:700;
                                    box-shadow:0 10px 25px rgba(37,99,235,0.28);
                                ">

                                Verify Email

                            </a>

                        </div>

                        <div style="
                            background:#eff6ff;
                            border:1px solid #bfdbfe;
                            padding:16px;
                            border-radius:14px;
                        ">

                            <p style="margin:0;color:#1e40af;
                                font-size:14px;line-height:1.7;">

                                This verification link may expire after some time
                                for security reasons.

                            </p>

                        </div>

                        <p style="
                            margin-top:28px;
                            color:#64748b;
                            font-size:14px;
                            line-height:1.7;
                        ">

                            If you didn’t create this account,
                            you can safely ignore this email.

                        </p>

                    </div>

                    <!-- Footer -->
                    <div style="
                        padding:22px;
                        text-align:center;
                        border-top:1px solid #e2e8f0;
                        background:#f8fbff;
                    ">

                        <p style="
                            font-size:13px;
                            color:#64748b;
                            margin:0;
                            line-height:1.7;
                        ">

                            © 2026 Collab Flow. All Rights Reserved.

                        </p>

                    </div>

                </div>

            </div>

        </body>

        </html>
        `;

        //* transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        //* verify smtp
        await transporter.verify();

        console.log("SMTP Connected Successfully");

        //* mail config
        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Email",
            html: htmlToSend
        };

        console.log("Sending verification email...");

        //* send mail
        const info =
            await transporter.sendMail(mailConfigurations);

        console.log("Verification email sent successfully");

        return info;

    } catch (error) {

        console.error("Verification email failed:");
        console.error(error);

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