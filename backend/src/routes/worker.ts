import express from 'express'
import { getNextTask, signup } from '../controller/worker.Controller'
import { workerMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/signup', signup)
router.get('/nextTask', workerMiddleware, getNextTask)
export default router