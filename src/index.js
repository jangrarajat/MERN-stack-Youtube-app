import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import {app} from "./app.js"


 


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`*...Server is runing at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("------------MOngoDb connection fiald ------- !!!",err)
})
























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