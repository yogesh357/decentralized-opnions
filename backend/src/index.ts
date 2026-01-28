import express, { Request, Response } from 'express';
import userRouter from './routes/user'
import workerRouter from './routes/worker'

const app = express()

app.use(express.json())
app.use('/v1/user', userRouter)
app.use('/v1/worker', workerRouter)


app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: true,
        message: "Serve is healthy"
    })
})

app.listen(5000, () => {
    console.log("server is runnig");

})


