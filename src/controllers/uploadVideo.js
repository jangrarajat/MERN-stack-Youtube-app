import { Video } from '../models/video.model.js'
import mongoose from 'mongoose'
import { unlink } from '../utils/unlinkSync.js'
import fs from 'fs'
import { asyncHandler } from '../utils/asynchandler.js'
import { uploadOnCloudinary, deleteImageOnCloudinary, deleteVideoOnCloudinary } from '../utils/cloudinary.js';

//    uplaod new video 
const uploadVideo = asyncHandler(async (req, res) => {
    try {
        console.log("📁 req.file:", req.files); // Debug karo
        console.log("📁 req.body:", req.body); // Debug karo
        
        if (!req.files) return res.status(400).json({ error: 'No file uploaded' });

        const thumbnailLocalPath = req.files?.thumbnail[0]?.path
        const videoLocalPath = req.files?.video[0]?.path

        if (!thumbnailLocalPath) return res.status(400).json({ error: 'Thumbnail file notfount' });
        if (!videoLocalPath) return res.status(400).json({ error: 'Video file notfouunt' });


        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        const video = await uploadOnCloudinary(videoLocalPath)
        if (!thumbnail && !video) return res.status(400).json({
            success: false,
            message: "thumbnail and video cloud uplaod failed"
        })

        if (thumbnail && video) { console.log("cloudinaty file uplaoding success" , video) }

        const uploadVideo = await Video.create({

            playback_url: video.playback_url,
            secure_url:video.secure_url,
            thumbnail_public_id: thumbnail.public_id,
            video_public_id: video.public_id,
            format: video.format,
            bytes: video.bytes,
            duration: video.duration,
            thumbnail: thumbnail.url,
            title: req.body.title,
            description: req.body.description,
            public: true,
            owner: req.user._id

        })

        if (!uploadVideo) return res.status(400).json({
            success: false,
            message: "video upload failed"
        })

        if (uploadVideo) { console.log("videoupload") }
        res
            .status(200)
            .json({
                success: true,
                message: "video uploading successfully",
                uploadVideo

            })



    } catch (error) {

        res
            .status(400)
            .json({
                success: false,
                message: error.message
            })
    }
})


//   delete  Video 
const deleteVideo = asyncHandler(async (req, res) => {

    const { thumbnail_public_id, video_public_id } = req.body

    if(!thumbnail_public_id && !video_public_id) return  res.status(400).json({success:false,message:" thumbnail_public_id and video_public_id is requried"})


    
    if (!thumbnail_public_id && !video_public_id) return res.status(400).json({ success: false, message: "thumbnail_public_id ,video_public_id , owner_id required" })

    const deleteThumbnailResponse = await deleteImageOnCloudinary(thumbnail_public_id)
    const deleteVideoResponse = await deleteVideoOnCloudinary(video_public_id)

    if (!deleteThumbnailResponse && !deleteVideoResponse) return res.status(400).json("imge and video deleteding failed")

    const deleteVideoDoc = await Video.findOneAndDelete({ video_public_id })

    if (!deleteVideoDoc) return res.status(400).json("delete video failed")




    res.status(200)
        .json({
            success: true,
            message: "delete video success"
        })

})


//  tempreary thumbnail preview upload
const tempUpload = asyncHandler(async (req, res) => {

    if (!req.file) return res.status(400)
        .json({
            success: false,
            message:"thumbnail image is required"
        })

    try {
        const response = await uploadOnCloudinary(req.file.path)

        res.status(200)
            .json({
                success: true,
                url: response.url,
                public_id: response.public_id
            })
    } catch (error) {
        res.status(400)
            .json({
                success: false,
                message: error.message
            })
    }

})


// delete tempreary thumbnail preview
const deleteTempPreview = asyncHandler(async (req, res) => {
    const public_id = req.body.public_id

    if (!public_id) return res.status(400)
        .json({
            success: false,
            message: "public_id is requried"
        })

    try {
        const response = await deleteImageOnCloudinary(public_id)
        console.log(response)
        res.status(200)
            .json({
                success: true,
                message: "Delete preview thumbnail Successfully"
            })
    } catch (error) {
        res.status(400)
            .json({
                success: false,
                message: "Delete preview thumbnail Failed"
            })
    }
})



export { uploadVideo, deleteVideo, tempUpload, deleteTempPreview }