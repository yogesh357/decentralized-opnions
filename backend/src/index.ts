import express, { Request, Response } from 'express';
import userRouter from './routes/user'
import workerRouter from './routes/worker'
import cors from 'cors'
const app = express()

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' })); // Increase the payload size limit to 10MB

// app.use(cookieParser());


app.use(express.json())
app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)


app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: true,
        message: "🫡 Server is healthy 🫡"
    })
})

app.listen(5000, () => {
    console.log("server is runnig on port 5000 ^_~");
})


