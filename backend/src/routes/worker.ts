import express from 'express'
import { getNextTaskforWorker, getWorkerBalance, signup, taskSubmission, workerPayout } from '../controller/worker.Controller'
import { workerMiddleware } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/payout',workerMiddleware , workerPayout)
router.post('/signup', signup)
router.get('/nextTask', workerMiddleware, getNextTaskforWorker)

router.post('/submission', workerMiddleware, taskSubmission)

router.get('/balance',workerMiddleware , getWorkerBalance)
export default router 