import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { Subsciption } from "../models/subscraption.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    user.save({ validateBeforeSave: true })

    return { accessToken, refreshToken }


  } catch (error) {
    throw new ApiError(500, "somthing want wrong  generateAccessRefreshToken error")
  }
}



//-----registeration User -----
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
    res.status(400)
      .json({
        success: false,
        message: "fullname is required"
      })

  }



  //check if user already exiest : username , email
  const exiestUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if (exiestUser) {
    res.status(400)
      .json({
        success: false,
        message: "user with email or username already exiest "
      })
    // throw new ApiError(400, "user with email or username already exiest ")
  }


  const avatarLocalPath = req.files?.avatar[0]?.path

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path
  }


  if (!avatarLocalPath) {
    res
      .status(400)
      .json({
        success: false,
        message: "avatar file is required"
      })

  }

  //  upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    res
      .status(400)
      .json({
        success: false,
        message: "Avtar file is required"
      })
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
    res
      .status(500)
      .json({
        success: false,
        message: "Somthing want wrong while registering the user"
      })
  }


  return res
    .status(201)
    .json({
      success: true,
      createdUser,
      message: "User registerd Successfully"
    })
})


//-----Login User -----
const loginUser = asyncHandler(async (req, res) => {
  //get data from req.body
  //  username or email 
  // find the user
  //password check
  // access and refresh token
  // send cookie

  if (!req.body) {
    res
      .status(400)
      .json({
        success: false,
        message: "Request body is missing. Make sure you are sending JSON and using express.json() middleware."
      })
  }
  const { email, username, password } = req.body;
  if ((!username && !email) || !password) {
    res
      .status(400)
      .json({
        success: false,
        message: "Username/email and password are required"
      })
  }

  const user = await User.findOne({
    $or: [
      ...(username ? [{ username }] : []),
      ...(email ? [{ email }] : [])
    ]
  });

  if (!user) {
    res
      .status(404)
      .json({
        success: false,
        message: "User does not exist"
      })

  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    res
      .status(401)
      .json({
        success: false,
        message: "Invalid user password"
      })

  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);

  // Fetch user data without password and refreshToken
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      success: false,
      user: loggedInUser, accessToken, refreshToken,
      message: "User logged in successfully"
    });

})

//-----Logout User -----
const loggoutUser = asyncHandler(async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }

    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
})

//--------------- refreshAccessToken ----------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    res
      .status(401)
      .json({
        success: false,
        message: "unauthorized request"
      })
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)

    if (!user) {
      res
        .status(401)
        .json({
          success: false,
          message: "Invalid refresh Token"
        })

    }

    if (incomingRefreshToken !== user?.refreshToken) {
      res
        .status(401)
        .json({
          success: false,
          message: "refresh token is requrid"
        })

    }

    const options = {
      httpOnly: true,
      secure: true
    };

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        accessToken, refreshToken: newRefreshToken,
        message: "Access token refreshd Successfully"
      })
  } catch (error) {
    res
      .status(401)
      .json({
        success: false,
        message: error?.message || "refreshToken error "
      })

  }
})

// --------change password ----------
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password")
  }

  user.password = newPassword
  user.save({ validateBeforeSave: false })

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Password was changed successfully")
    )

})

// ---------get current user ---------
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User featched successfully"))
})

// -------------update user dietals ---------
const updateAccountDetails = asyncHandler(async (req, res) => {


  const { fullname, email } = req.body

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required")
  }


  const user = await User.findByIdAndUpdate(req.user._id,
    {
      $set: {
        fullname: fullname,
        email: email
      }
    },
    { new: true }
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Account detaild update successfully")
    )
})

// ------------update user avatar -----------
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avtar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar updating")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url
      }
    },
    {
      new: true
    }
  ).select("-password")


  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "avatar image update successfully")
    )
})



// ------------update user coverImage -----------
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing")
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage updating")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url
      }
    },
    {
      new: true
    }
  ).select("-password")

  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Cover image update successfully")
    )
})

//  -----------get   channel profile----------------
const getUserChannelProfile = asyncHandler(async (req, res) => {
  // console.log(req)
  const { username } = req.params

  if (!username) {
    throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      },

    },
    {
      $lookup: {
        from: "subsciptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"

      }
    },
    {
      $lookup: {
        from: "subsciptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTO"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTO"
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false

          }
        }
      }

    }, {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1

      }
    }
  ])


  if (!channel?.length) {
    throw new ApiError(404, "channel dose not exist")
  }


  // console.log(channel)


  return res.status(200)
    .json(
      new ApiResponse(200, channel, "User channel featched successfully")
    )

})


// ---------------get Watch History -------------
const getWatchHistory = asyncHandler(async (req, res) => {


  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "user",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
        ]
      }
    }

  ])

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history featched successfully"
      )
    )

})


//-------------- subscribe channel--------------
const subsciptionsChannel = asyncHandler(async (req, res) => {
  const subscibedFrom = req.user._id
  const subscibedTo = req.body.subscibedTo



  // 1. Already subscribed check
  const alreadySubscribed = await Subsciption.findOne({
    subscriber: subscibedFrom,
    channel: subscibedTo
  });


  if (alreadySubscribed) {
    throw new ApiError(409, "All ready Subscribed");
  }


  //  2. check channel exiest
  const channel = await User.findOne({
    _id: subscibedTo
  });

  if (!channel) {
    throw new ApiError(409, "Channel not exist")

  }


  // 3.not subscribe yourSelf
  if (subscibedFrom.toString() === subscibedTo.toString()) {
    throw new ApiError(400, "Cannot subscribe yourSelf")
  }


  // 4. channel is required
  if (!subscibedTo) {
    throw new ApiError(400, "SubscribedTO is required")
  }

  await Subsciption.create({
    subscriber: req.user._id,
    channel: subscibedTo
  })

  return res.status(201).json(new ApiResponse(200, "follow successfully"))
})

//-------------- Unsubscribe channel ---------------
const unSubscribeChannel = asyncHandler(async (req, res) => {
  const subscibedFrom = req.user._id
  const subscibedTo = req.body.subscibedTo

  if (!subscibedTo) {
    throw new ApiError(409, "Channel is Required")
  }

  const deleted = await Subsciption.findOneAndDelete({
    subscriber: subscibedFrom.toString(),
    channel: subscibedTo.toString()
  })

  if (!deleted) {
    throw new ApiError(404, "Not Subscribed");
  }


  return res.status(200).json(new ApiResponse(200, "UnSubscribe successfully"))

})



export {
  registerUser,
  loginUser,
  loggoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
  subsciptionsChannel,
  unSubscribeChannel
}