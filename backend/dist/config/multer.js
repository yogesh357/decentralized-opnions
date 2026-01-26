"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = __importDefault(require("multer-storage-cloudinary"));
const cloudniary_1 = __importDefault(require("./cloudniary"));
const storage = new multer_storage_cloudinary_1.default({
    cloudinary: cloudniary_1.default,
    params: {
        folder: "chat-images",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: [{
                width: 800,
                height: 600,
                crop: "limit"
            }, { quality: "auto" }],
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    //@ts-ignore
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        }
        else {
            cb(new Error("only image is allowed"));
        }
    }
});
