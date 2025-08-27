import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = async () => {
    try {

        const conn = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`\n MOngoDB connected  !! DB HOST: ${conn.connection.host}`)

    } catch (error) {
        console.log("MongoDB connect Error!!!!!!!!!!!!!!!!!!!!!!!!!!", error)
        process.exit(1)
    }
}


export default connectDB;