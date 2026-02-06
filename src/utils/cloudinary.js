import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Upload on Cloudinary (works for b oth image & video)
 

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const stats = fs.statSync(localFilePath);
    const totalSize = stats.size;
    let uploadedSize = 0;
    let lastReportedProgress = -1; // Taki console bar-bar same % na print kare

    console.log(`🚀 Starting Upload: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          chunk_size: 6000000 // 6MB Chunks for better speed
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // ReadStream ko highWaterMark ke sath fast banaya
      const fileStream = fs.createReadStream(localFilePath, {
        highWaterMark: 1024 * 1024 // 1MB buffer size
      });

      fileStream.on('data', (chunk) => {
        uploadedSize += chunk.length;
        const progress = Math.round((uploadedSize / totalSize) * 100);

        // Sirf tab print kare jab % change ho (taki console clutter na ho)
        if (progress !== lastReportedProgress) {
          console.log(`📊 Uploading... ${progress}%`);
          lastReportedProgress = progress;
        }
      });

      fileStream.on('error', (err) => reject(err));

      // File ko stream mein pipe (bhejna) karein
      fileStream.pipe(uploadStream);
    });

    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.log("✅ Done! URL:", response.secure_url);
    return response;

  } catch (error) {
    console.error("❌ Failed:", error.message);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

// ✅ Delete functions
const deleteVideoOnCloudinary = async (public_id) => {
  if (!public_id) return null;
  return await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
};

const deleteImageOnCloudinary = async (public_id) => {
  if (!public_id) return null;
  return await cloudinary.uploader.destroy(public_id);
};

export { uploadOnCloudinary, deleteVideoOnCloudinary, deleteImageOnCloudinary };
