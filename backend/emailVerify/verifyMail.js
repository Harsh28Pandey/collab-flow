const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const verifyMail = async (token, email) => {

    try {

        const templatePath = path.resolve(__dirname, "template.hbs");

        const emailTemplateSource = fs.readFileSync(
            templatePath,
            "utf-8"
        );

        const template = handlebars.compile(emailTemplateSource);

        const clientUrl =
            process.env.CLIENT_URL || "http://localhost:5173";

        const htmlToSend = template({
            token: encodeURIComponent(token),
            clientUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        await transporter.verify();

        console.log("SMTP server is ready");

        const mailConfigurations = {
            from: process.env.MAIL_USER,
            to: email,
            subject: "Email Verification",
            html: htmlToSend,
        };

        const info = await transporter.sendMail(mailConfigurations);

        console.log("Email sent successfully");
        console.log(info);

    } catch (error) {

        console.error("Email sending failed:");
        console.error(error);

        throw error;
    }
};

module.exports = { verifyMail };