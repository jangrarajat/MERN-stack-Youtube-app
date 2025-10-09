import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log('-------------- MongoDB connected !! -------------')

        // Simple keep-alive - har 5 minutes me ping
        setInterval(async () => {
            try {
                await mongoose.connection.db.command({ ping: 1 });
                console.log(`✅ MongoDB ping - ${new Date().toLocaleTimeString()}`);
            } catch (error) {
                console.log('❌ MongoDB ping failed');
            }
        }, 5 * 60 * 1000); // 10 minutes

    } catch (error) {
        console.log("❌ MongoDB connect Error!!!!!!!!!!!!!!!!!!!!!!!!!!", error)
        process.exit(1)
    } 
}

export default connectDB;