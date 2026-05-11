const nodemailer = require("nodemailer")
const dotenv = require("dotenv");
dotenv.config();

const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { fileURLToPath } = require("url");

// const __filename = path.basename(__filename);
// const __dirname = path.dirname(__filename)

const verifyMail = async (token, email) => {

    const emailTemplateSource = fs.readFileSync(
        path.join(__dirname, "template.hbs"),
        "utf-8"
    )

    const template = handlebars.compile(emailTemplateSource)
    // const htmlToSend = template({ token: encodeURIComponent(token) })

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
    const htmlToSend = template({ token: encodeURIComponent(token), clientUrl })

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // 587 ke liye false
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD
        }
    })
    const mailConfigurations = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        html: htmlToSend,
    }

    // await transporter.sendMail(mailConfigurations, function (error, info) {
    //     if (error) {
    //         throw new Error(error)
    //     }
    //     console.log("Email sent successfully")
    //     console.log(info)
    // })

    await transporter.sendMail(mailConfigurations)
    console.log("Email sent successfully")
}

module.exports = { verifyMail }