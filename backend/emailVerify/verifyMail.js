const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

dotenv.config();

const verifyMail = async (token, email) => {

    try {

        console.log("Starting email service...");

        //* template file path
        const templatePath = path.resolve(__dirname, "template.hbs");

        //* read template file
        const emailTemplateSource = fs.readFileSync(
            templatePath,
            "utf-8"
        );

        //* compile handlebars template
        const template = handlebars.compile(emailTemplateSource);

        //* frontend client url
        const clientUrl =
            process.env.CLIENT_URL || "http://localhost:5173";

        //* html output
        const htmlToSend = template({
            token: encodeURIComponent(token),
            clientUrl
        });

        //* production ready transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        //* verify smtp
        await transporter.verify();

        console.log("SMTP Connected Successfully");

        //* mail configuration
        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Verify Your Email - Collab Flow",
            html: htmlToSend,
        };

        console.log("Sending email...");

        //* send mail
        const info = await transporter.sendMail(mailConfigurations);

        console.log("Email Sent Successfully");
        console.log(info.response);

        return info;

    } catch (error) {

        console.error("EMAIL ERROR:");
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