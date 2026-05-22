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

<body style="margin:0;padding:30px 15px;background:#eef4ff;font-family:'Segoe UI',sans-serif;">

    <div style="max-width:620px;margin:auto;">

        <div style="
            background:#ffffff;
            border-radius:28px;
            overflow:hidden;
            border:1px solid #dbeafe;
            box-shadow:0 15px 50px rgba(37,99,235,0.12);
        ">

            <!-- Top Section -->
            <div style="
                background:linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa);
                padding:55px 35px;
                text-align:center;
            ">

                <h1 style="
                    margin:0;
                    color:#ffffff;
                    font-size:34px;
                    font-weight:700;
                    letter-spacing:-0.5px;
                ">
                    Verify Your Email
                </h1>

                <p style="
                    margin-top:16px;
                    color:#dbeafe;
                    font-size:16px;
                    line-height:1.8;
                    max-width:420px;
                    margin-left:auto;
                    margin-right:auto;
                ">
                    Confirm your email address to securely activate your
                    Collab Flow account and continue.
                </p>

            </div>

            <!-- Content -->
            <div style="padding:45px 35px;">

                <p style="
                    font-size:17px;
                    color:#0f172a;
                    margin-top:0;
                    margin-bottom:18px;
                    font-weight:600;
                ">
                    Hello 👋
                </p>

                <p style="
                    font-size:15px;
                    color:#475569;
                    line-height:1.9;
                    margin-bottom:18px;
                ">
                    Thanks for signing up with <strong>Collab Flow</strong>.
                    To complete your registration and access your workspace,
                    please verify your email address.
                </p>

                <p style="
                    font-size:15px;
                    color:#475569;
                    line-height:1.9;
                    margin-bottom:0;
                ">
                    Click the button below to verify your account securely.
                </p>

                <!-- Button -->
                <div style="text-align:center;margin:42px 0;">

                    <a href="${verifyUrl}"
                        target="_blank"
                        style="
                            display:inline-block;
                            padding:16px 38px;
                            background:linear-gradient(135deg,#2563eb,#3b82f6);
                            color:#ffffff;
                            text-decoration:none;
                            border-radius:16px;
                            font-size:16px;
                            font-weight:700;
                            box-shadow:0 12px 25px rgba(37,99,235,0.28);
                        ">

                        Verify Email

                    </a>

                </div>

                <!-- Info Box -->
                <div style="
                    background:#f0f7ff;
                    border:1px solid #bfdbfe;
                    border-radius:18px;
                    padding:18px 20px;
                ">

                    <p style="
                        margin:0;
                        font-size:14px;
                        color:#1d4ed8;
                        line-height:1.8;
                    ">
                        This verification link may expire after some time for
                        security purposes.
                    </p>

                </div>

                <!-- Bottom Text -->
                <p style="
                    margin-top:28px;
                    font-size:14px;
                    color:#64748b;
                    line-height:1.8;
                ">
                    If you didn’t create this account, you can safely ignore
                    this email.
                </p>

            </div>

            <!-- Footer -->
            <div style="
                background:#f8fbff;
                border-top:1px solid #e2e8f0;
                padding:24px;
                text-align:center;
            ">

                <p style="
                    margin:0;
                    color:#64748b;
                    font-size:13px;
                    line-height:1.8;
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