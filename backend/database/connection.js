import mongoose from "mongoose";

export const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "employease"
        });
        console.log("[DB] Connected to database successfully");
        return true;
    } catch (err) {
        console.error(`[DB] Error connecting to database: ${err}`);
        throw err;
    }
}