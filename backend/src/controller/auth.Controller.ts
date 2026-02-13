import prisma from "../config/prisma"
import jwt from "jsonwebtoken"
import { Request, Response } from "express"
import nacl from "tweetnacl"
import { PublicKey } from "@solana/web3.js"

export const signup = async (req: Request, res: Response) => {
    // TODO add sign verification logic
    const hardCodedWalletAddress = "9MCiJLwrhhvPAH2TwL5FSbpcJDovZABvCLZFp2c76rHq"
    const { signature, publicKey } = req.body
    console.log("req.body : for user -> signup ", req.body);
    const message = new TextEncoder().encode("Sign into mechanical turks")

    const result = nacl.sign.detached.verify(
        message,
        new Uint8Array(signature.data),
        new PublicKey(publicKey).toBytes()
    )
    if (!result) {
        return res.status(402).json({
            success: false,
            message: "Incorrect Signature !!"
        })
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            // address: hardCodedWalletAddress
            address: publicKey

        }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id,
        }, process.env.JWT_SECRETE!)

        res.status(202).json({
            success: true,
            token
        });
    } else {
        const user = await prisma.user.create({
            data: {
                // address: hardCodedWalletAddress
                address: publicKey
            }
        })
        const token = jwt.sign({
            userId: user.id,
        }, process.env.JWT_SECRETE!)
        res.status(202).json({
            success: true,
            token
        });
    }

}
export const uploadController = async (req: Request, res: Response) => {
    try {

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        // Cloudinary URLs are injected by multer-storage-cloudinary
        const uploadedImages = files.map((file) => ({
            url: (file as any).path, // Cloudinary secure_url
            publicId: (file as any).filename
        }));

        res.json({
            success: true,
            message: "Upload successful",
            images: uploadedImages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Upload failed"
        });
    }
};
