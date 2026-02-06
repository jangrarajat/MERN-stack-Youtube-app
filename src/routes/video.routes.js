import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { uploadVideo, getAllVideos, deleteVideo, tempUpload, deleteTempPreview,getSingleVideo } from '../controllers/uploadVideo.js'
const router = Router()

router.route('/upload').post(upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
]), verifyJwt, uploadVideo)


router.route('/delete').delete(verifyJwt, deleteVideo)

router.route('/allVideos').get(getAllVideos)

router.route('/preview/image').post(upload.single('thumbnail'), tempUpload)

router.route('/delete/preview/image').delete(deleteTempPreview)

router.route('/single/video/:id').get(getSingleVideo)


export default router