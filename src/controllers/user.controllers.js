import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";



const registerUser = asyncHandler(async (req, res) => {
  //get user details from rountend 
  // validation -- not empty
  //check if user already exiest : username , email
  //check for images, check for avtar
  //  upload them to cloudinary
  // create user object -- create entry in db
  // remove password and refresh token field from response 
  // check for user creation 
  //  return response 

 
  //get user details from rountend 
  const { fullname, email, username, password } = req.body
 




  // validation -- not empty
  if (
    [fullname, email, username, password].some((field) =>
      field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "fullname is required")
  }



  //check if user already exiest : username , email
  const exiestUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (exiestUser) {
    throw new ApiError(409, "user with email or username already exiest ")
  }


  const avatarLocalPath = req.files?.avatar[0]?.path
  
  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required")
  }

  //  upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avtar file is required")
  }

  // create user object -- create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  })



  // remove password and refresh token field from response 
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "Somthing want wrong while registering the user")
  }


  return res.status(201).json(new ApiResponse(200, createdUser, "User registerd Successfully"))

})

export { registerUser }