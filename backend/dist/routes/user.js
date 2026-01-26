"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_Controller_1 = require("../controller/auth.Controller");
const multer_1 = require("../config/multer");
const authMiddleware_1 = require("../middleware/authMiddleware");
const task_Controller_1 = require("../controller/task.Controller");
const router = express_1.default.Router();
router.post('/signup', auth_Controller_1.signup);
router.post('/upload', () => {
    console.log("upload route started,");
}, multer_1.upload.array("images", 5), auth_Controller_1.uploadController);
router.post('/task', authMiddleware_1.authMiddleware, task_Controller_1.createTask);
router.get('/task', authMiddleware_1.authMiddleware, task_Controller_1.getTask);
exports.default = router;
