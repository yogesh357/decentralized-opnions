import express from 'express'
import { signup, uploadController } from '../controller/auth.Controller'
import { upload } from '../config/multer'
import { authMiddleware } from '../middleware/authMiddleware'
import { createTask, getTask } from '../controller/task.Controller'

const router = express.Router()

router.post('/signup', signup)
router.post('/upload',
    () => {
        console.log("upload route started,");
    },
    upload.array("images", 5),
    uploadController
);
router.post('/task', authMiddleware, createTask)
router.get('/task', authMiddleware, getTask)

export default router