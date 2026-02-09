import express from 'express'
import { signup, uploadController } from '../controller/auth.Controller'
import { upload } from '../config/multer'
import { authMiddleware } from '../middleware/authMiddleware'
import { createTask, getTask } from '../controller/task.Controller'

const router = express.Router()

router.post('/signup', signup)
// router.post('/upload',
//     upload.array("images", 5),
//     uploadController
// );
router.post("/upload", (req, res, next) => {
    console.log("upload started and reached to the routes ");

    upload.array("images", 5)(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);

            return res.status(400).json({
                message: err.message || "Upload failed"
            });
        }

        next();
    });
}, uploadController);

router.post('/task', authMiddleware, createTask)
router.get('/task', authMiddleware, getTask)

export default router