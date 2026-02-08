import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

console.log("cloud name ", process.env.CLOUD_NAME);
console.log("api key ", process.env.CLOUDINARY_API_KEY);
console.log("api secret ", process.env.CLOUDINARY_API_SECRET);


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;