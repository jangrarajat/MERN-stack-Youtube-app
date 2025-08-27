import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";





connectDB()

























            //  ------------- || first aproch for connect Data base || ----------------
// (async()=>{
//     try {
//         mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//        app.on("error",(error)=>{
//         console.log(error)
//         throw error
//        })
        
//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })

//     } catch (error) {
//          console.log("ERROR",error)
//          throw error
//     }
// })()