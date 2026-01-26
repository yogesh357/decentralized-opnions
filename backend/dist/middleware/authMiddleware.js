"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) || req.header("authorization");
    const JWT_SECRETE = process.env.JWT_SECRETE;
    if (!token) {
        return res.status(202).json({
            status: false,
            message: "No token provided"
        });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRETE);
        //@ts-ignore
        if (decodedToken.userId) {
            //@ts-ignore
            req.userId = decodedToken.userId;
            return next();
        }
        else {
            return res.status(403).json({
                success: false,
                message: "You are not logged in "
            });
        }
    }
    catch (error) {
    }
};
exports.authMiddleware = authMiddleware;
