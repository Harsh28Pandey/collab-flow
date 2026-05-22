const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        if (mongoose.connections[0].readyState) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });

        console.log("MongoDB Connected Successfully");

    } catch (error) {

        console.log("MongoDB Connection Error");

        console.log(error);
    }
};

module.exports = connectDB;

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