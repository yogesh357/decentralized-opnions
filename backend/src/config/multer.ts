import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudniary";

console.log("Cloudinary Config Check:", cloudinary.config());

// Create storage with synchronous params (no async function)
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "decentralised-opinions",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{
            width: 800,
            height: 600,
            crop: "limit"
        }, {
            quality: "auto"
        }],
        resource_type: "auto",
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        // Validate file type
        const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Only ${allowedMimeTypes.join(", ")} are allowed.`));
        }
    }
});