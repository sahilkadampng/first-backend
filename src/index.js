import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env"
});

connectDB()
    .then(() => {
        app.listen(procces.env.PORT || 8000, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        app.on("error", (error) => {
            console.log("error:", error);
            throw error;
        });
    });
