import express from 'express';
import userRouter from './routes/user'

const app = express()

app.use(express.json())
app.use('/v1/user', userRouter)
// app.use('/v1/worker', workerRouter)


app.listen(5000, () => {
    console.log("server is runnig");

})


