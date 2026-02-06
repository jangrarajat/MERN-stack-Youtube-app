import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
   
    playback_url: {
        type: String,
        required: true,

    },
     secure_url:{
        type :String,
        required:true
     },
   thumbnail_public_id: {
        type: String,
        required: true,

    },
    video_public_id: {
        type: String,
        required: true,

    },
    format: {
        type: String,
        required: true,

    },
    bytes: {
        type: Number,
        required: true,

    }, duration: {
        type: Number,
        required: true
    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    public:{
     type:Boolean,
     
    },
    isPublished: {
        type: Boolean,
        default:false
        
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    ownerAvtar:{
          type: String,
        required: true,
    }




}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)