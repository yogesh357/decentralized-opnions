"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.signup = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO add sign verification logic
    const hardCodedWalletAddress = "9MCiJLwrhhvPAH2TwL5FSbpcJDovZABvCLZFp2c76rHq";
    const existingUser = yield prisma_1.default.user.findFirst({
        where: {
            address: hardCodedWalletAddress
        }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id,
        }, process.env.JWT_SECRETE);
        res.status(202).json({
            success: true,
            token
        });
    }
    else {
        const user = yield prisma_1.default.user.create({
            data: {
                address: hardCodedWalletAddress
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, process.env.JWT_SECRETE);
        res.status(202).json({
            success: true,
            token
        });
    }
});
exports.signup = signup;
const uploadController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        // Cloudinary URLs are injected by multer-storage-cloudinary
        const uploadedImages = files.map((file) => ({
            url: file.path, // Cloudinary secure_url
            publicId: file.filename
        }));
        res.json({
            message: "Upload successful",
            images: uploadedImages
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload failed" });
    }
});
exports.uploadController = uploadController;
