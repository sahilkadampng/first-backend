// require("dotenv").config({ path: "./env" });
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
});

connectDB();










// (async () => {
//     try {
//         const { connection } = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log(`Connected to ${connection.host}`);
//     } catch (error) {
//         console.log("Error connecting to MongoDB", error);
//         process.exit(1);
//     }
// })();