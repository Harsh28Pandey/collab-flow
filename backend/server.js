require("dotenv").config();
const express = require("express");
// const http = require("http");
// const https = require("https");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");

const authRoutes = require('./routes/auth.routes.js');
const userRoutes = require("./routes/user.routes.js");
const taskRoutes = require('./routes/task.routes.js');
const reportRoutes = require("./routes/report.routes.js");
const groupRoutes = require("./routes/group.route.js");
const messageRoutes = require("./routes/message.route.js");
const pollRoutes = require("./routes/poll.routes.js");

// const { Server } = require("socket.io");
// const Message = require("./models/message.model.js");

const app = express();
// const server = http.createServer(app);

//* middleware to handle CORS
app.use(cors({
    origin: [
        "https://collaspace.netlify.app",
        "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// app.options(/.*/, cors());
app.options("*", cors());

//* connect to database
connectDB();

//* middleware to parse JSON bodies
app.use(express.json());


//* routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/polls", pollRoutes);

// const io = new Server(server, {
//     cors: {
//         origin: [
//             "https://collaspace.netlify.app",
//             "http://localhost:5173"
//         ]
//     }
// });

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     socket.on("join_group", (groupId) => {
//         socket.join(groupId);
//     });

//     socket.on("send_message", async (data) => {
//         try {
//             const message = await Message.create({
//                 group: data.groupId,
//                 sender: data.senderId,
//                 text: data.text
//             });

//             io.to(data.groupId).emit("receive_message", message);

//             io.to(data.groupId).emit("notification", {
//                 text: "New message"
//             });

//         } catch (err) {
//             console.error(err);
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });

//* serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("API is running...");
});

//* start server
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
    });
}

module.exports = app;

// setInterval(() => {
//     https.get(process.env.RENDER_URL, (res) => {
//         console.log("Server pinged — status:", res.statusCode)
//     }).on("error", (err) => {
//         console.error("Ping error:", err.message)
//     })
// }, 14 * 60 * 1000)