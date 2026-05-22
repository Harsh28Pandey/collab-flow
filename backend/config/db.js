const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });

        // console.log("MongoDB Database Connected");

    } catch (error) {

        console.error("Error connecting to MongoDB:", error);

        process.exit(1);
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