import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KRY,
    api_secret: CLOUDINARY_API_SECRET
});

const uplodeOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const respons = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("file is uploaded on cloud", respons.url);
        return respons
    } catch (err) {
        fs.unlinkSync(localFilePath) // remove file
        return null;
    }
}

export { uplodeOnCloudinary }