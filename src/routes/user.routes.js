import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { uplaod } from "../middlewares/multer.js";
const router = Router()

router.route("/register").post(
    uplaod.fields([
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

    // http://

export default router