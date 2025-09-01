import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loggoutUser, loginUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1

        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)


router.route("/login").post(loginUser)

router.route("/logout").post(verifyJwt, loggoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/reset-password").post(verifyJwt, changeCurrentPassword)

router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/update-account").patch(verifyJwt, updateAccountDetails)

router.route("/update-avatar").patch(verifyJwt, upload.single("avater"), updateUserAvatar)

router.route("/update-cover-image").patch(verifyJwt, upload.single("/coverImage"), updateUserCoverImage)

router.route("/update-avatar").patch(verifyJwt, upload.single("avater"), updateUserAvatar)

router.route("/c/:username").get(verifyJwt, getUserChannelProfile)

router.route("/watch-history").patch(verifyJwt, getWatchHistory)








export default router