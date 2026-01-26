import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken'
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token || req.header("authorization")

    const JWT_SECRETE = process.env.JWT_SECRETE!;
    if (!token) {
        return res.status(202).json({
            status: false,
            message: "No token provided"
        })
    }
    try {

        const decodedToken = jwt.verify(token, JWT_SECRETE)
        //@ts-ignore
        if (decodedToken.userId) {
            //@ts-ignore
            req.userId = decodedToken.userId;
            return next();
        } else {
            return res.status(403).json({
                success: false,
                message: "You are not logged in "
            })
        }
    } catch (error) {

    }
}