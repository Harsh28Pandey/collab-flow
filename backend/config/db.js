const mongoose = require("mongoose");

//* mongoose ka default buffering ON rakho — isse queries automatically
//* wait karengi jab tak connection ready nahi ho jata (max bufferTimeoutMS tak)
mongoose.set("bufferCommands", true);

//* connection status events
mongoose.connection.on("connected", () => {
    console.log("MongoDB Connected Successfully");
});

mongoose.connection.on("error", (err) => {
    console.log("MongoDB Connection Error:", err.message);
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB Disconnected");
});

const connectDB = async () => {
    // agar already connected (1) ya connect ho raha hai (2), dobara connect() mat karo
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000, // Vercel ke 10s function timeout ke andar rakha
            socketTimeoutMS: 45000,          // actual queries ke liye zyada time (connection ke baad)
        });
    } catch (error) {
        console.log("MongoDB Connection Error (catch block):");
        console.log(error);
    }
};

module.exports = connectDB;

// const mongoose = require("mongoose");

// const connectDB = async () => {

//     try {

//         if (mongoose.connections[0].readyState) {
//             return;
//         }

//         await mongoose.connect(process.env.MONGO_URI, {
//             serverSelectionTimeoutMS: 30000
//         });

//         console.log("MongoDB Connected Successfully");

//     } catch (error) {

//         console.log("MongoDB Connection Error");

//         console.log(error);
//     }
// };

// module.exports = connectDB;

// const mongoose = require("mongoose")

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {});
//         // console.log("MongoDB Database Connected");
//     } catch (error) {
//         console.error("Error connecting to MongoDB: ", error);
//         // process.exit(1);
//     }
// }

// module.exports = connectDB;