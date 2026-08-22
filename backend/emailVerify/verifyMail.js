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

// --- TASK NOTIFICATION EMAIL FUNCTION ---
const sendTaskNotificationEmail = async ({ email, name, taskTitle, taskDescription, priority, dueDate, assignedBy, projectName }) => {
    try {
        const templatePath = path.resolve(__dirname, "taskNotification.hbs");
        const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(emailTemplateSource);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        // ✅ Direct Login URL
        const loginUrl = `${clientUrl}/login`;

        const formattedDate = new Date(dueDate).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const htmlToSend = template({
            userName: name,
            taskTitle,
            taskDescription: taskDescription || "No description provided.",
            priority,
            dueDate: formattedDate,
            assignedBy: assignedBy || "Admin",
            projectName: projectName || "Standalone Task",
            loginUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        await transporter.verify();

        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `New Task: ${taskTitle} | Collab Flow`,
            html: htmlToSend,
        };

        await transporter.sendMail(mailConfigurations);
        console.log(`Task notification email sent to ${email}`);

    } catch (error) {
        console.error("Task Notification Email Failed:", error);
    }
};

// --- NEW FUNCTION FOR WELCOME TEAM EMAIL ---
const sendWelcomeTeamEmail = async ({ email, name, teamName }) => {
    try {
        // ✅ Check if template file exists to prevent crash
        const templatePath = path.resolve(__dirname, "welcomeNotification.hbs");
        if (!fs.existsSync(templatePath)) {
            console.error("WELCOME EMAIL ERROR: welcomeNotification.hbs file not found!");
            return;
        }

        const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(emailTemplateSource);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginUrl = `${clientUrl}/login`;

        const htmlToSend = template({
            userName: name,
            teamName: teamName || "the Workspace",
            loginUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        // ✅ Verify transporter before sending
        await transporter.verify();

        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Welcome to ${teamName || "the Team"}! 🎉`,
            html: htmlToSend,
        };

        const info = await transporter.sendMail(mailConfigurations);
        console.log(`✅ Welcome email sent to ${email}`, info.response);

    } catch (error) {
        console.error("❌ Welcome Email Failed:", error);
    }
};

// --- NEW FUNCTION FOR HOLIDAY REQUEST NOTIFICATION (to Admin) ---
const sendHolidayRequestEmail = async ({ adminEmail, adminName, userName, userEmail, leaveType, fromDate, toDate, totalDays, reason }) => {
    try {
        const templatePath = path.resolve(__dirname, "holidayRequest.hbs");
        if (!fs.existsSync(templatePath)) {
            console.error("HOLIDAY REQUEST EMAIL ERROR: holidayRequest.hbs file not found!");
            return;
        }

        const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(emailTemplateSource);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginUrl = `${clientUrl}/login`;

        const formattedFrom = new Date(fromDate).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const formattedTo = new Date(toDate).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const htmlToSend = template({
            adminName: adminName || "Admin",
            userName,
            userEmail,
            leaveType,
            fromDate: formattedFrom,
            toDate: formattedTo,
            totalDays,
            reason,
            loginUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        await transporter.verify();

        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: adminEmail,
            subject: `New Holiday Request from ${userName} | Collab Flow`,
            html: htmlToSend,
        };

        await transporter.sendMail(mailConfigurations);
        console.log(`Holiday request email sent to admin: ${adminEmail}`);

    } catch (error) {
        console.error("Holiday Request Email Failed:", error);
    }
};

// --- NEW FUNCTION FOR HOLIDAY REVIEW NOTIFICATION (Approved/Rejected) — to User ---
const sendHolidayReviewEmail = async ({ userEmail, userName, leaveType, fromDate, toDate, totalDays, status, adminRemarks, reviewedBy }) => {
    try {
        const templatePath = path.resolve(__dirname, "holidayReviewed.hbs");
        if (!fs.existsSync(templatePath)) {
            console.error("HOLIDAY REVIEW EMAIL ERROR: holidayReviewed.hbs file not found!");
            return;
        }

        const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(emailTemplateSource);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginUrl = `${clientUrl}/login`;

        const formattedFrom = new Date(fromDate).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const formattedTo = new Date(toDate).toLocaleDateString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const htmlToSend = template({
            userName,
            leaveType,
            fromDate: formattedFrom,
            toDate: formattedTo,
            totalDays,
            status,
            isApproved: status === "Approved",
            adminRemarks: adminRemarks || "",
            reviewedBy: reviewedBy || "Admin",
            loginUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        await transporter.verify();

        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: userEmail,
            subject: `Holiday Request ${status} | Collab Flow`,
            html: htmlToSend,
        };

        await transporter.sendMail(mailConfigurations);
        console.log(`Holiday ${status} email sent to ${userEmail}`);

    } catch (error) {
        console.error("Holiday Review Email Failed:", error);
    }
};

// --- NEW FUNCTION FOR PASSWORD CHANGED CONFIRMATION ---
const sendPasswordChangedEmail = async ({ email, name }) => {
    try {
        const templatePath = path.resolve(__dirname, "passwordChanged.hbs");
        if (!fs.existsSync(templatePath)) {
            console.error("PASSWORD CHANGED EMAIL ERROR: passwordChanged.hbs file not found!");
            return;
        }

        const emailTemplateSource = fs.readFileSync(templatePath, "utf-8");
        const template = handlebars.compile(emailTemplateSource);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const loginUrl = `${clientUrl}/login`;

        const changedAt = new Date().toLocaleString("en-IN", {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const htmlToSend = template({
            userName: name || "there",
            userEmail: email,
            changedAt,
            loginUrl
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });

        await transporter.verify();

        const mailConfigurations = {
            from: `"Collab Flow" <${process.env.MAIL_USER}>`,
            to: email,
            subject: `Your password was changed | Collab Flow`,
            html: htmlToSend,
        };

        await transporter.sendMail(mailConfigurations);
        console.log(`Password changed email sent to ${email}`);

    } catch (error) {
        console.error("Password Changed Email Failed:", error);
    }
};

module.exports = { verifyMail, sendTaskNotificationEmail, sendWelcomeTeamEmail, sendHolidayRequestEmail, sendHolidayReviewEmail, sendPasswordChangedEmail };

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