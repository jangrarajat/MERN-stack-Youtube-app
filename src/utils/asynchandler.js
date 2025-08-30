const asyncHandler = (requestHandler) => {
  return   (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}



export { asyncHandler }



// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
        
//     } catch (error) {
//         console.log("-----utils error ----")
//         res.status(error.code).json({
//             success:false,
//             message:error.message
//         })
//     }
// }
