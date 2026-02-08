
import e, { Response, Request } from 'express'
import prisma from '../config/prisma'
import jwt from 'jsonwebtoken'
import { getNextTask } from '../config/db'
import { createSubmissionInput } from '../types/type'

const TOTAL_DECIMALS = Number(process.env.TOTAL_DECIMALS!)

export const signup = async (req: Request, res: Response) => {
    // TODO add sign verification logic
    const hardCodedWalletAddress = "9MCiJLwrhhvPAH2TwL5FSbpcJDovZABvCLZFp2c76rHq"

    const existingUser = await prisma.worker.findFirst({
        where: {
            address: hardCodedWalletAddress
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id,
        }, process.env.WORKER_JWT_SECRETE!)

        res.status(202).json({
            success: true,
            token
        });
    } else {
        const user = await prisma.worker.create({
            data: {
                address: hardCodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0
            }
        })
        const token = jwt.sign({
            userId: user.id,
        }, process.env.WORKER_JWT_SECRETE!)
        res.status(202).json({
            success: true,
            token
        });
    }

}

export const getWorkerBalance = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const userId = req.userId
        const worker = await prisma.worker.findFirst({
            where: {
                id: userId
            }
        })
        res.status(200).json({
            pendingAmount: worker?.pending_amount,
            lockedAmount: worker?.locked_amount
        })
    } catch (error) {
        console.error(error);
        res.status(500).json("internal server error")

    }
}

export const workerPayout = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const userId = req.userId
        const worker = await prisma.worker.findFirst({
            where: {
                id: Number(userId)
            },
        })
        if (!worker) {
            return res.status(403).json({
                message: "user not found"
            })
        }
        //TODO -> logi to create txns
        const txnId = "0x2fwfwrfjijj"
        await prisma.$transaction(async txn => {
            await txn.worker.update({
                where: {
                    id: Number(userId)
                },
                data: {
                    pending_amount: {
                        decrement: worker.pending_amount
                    },
                    locked_amount: {
                        increment: worker.pending_amount
                    }
                }
            })
            await txn.payouts.create({
                data: {
                    user_id: Number(userId),
                    amount: worker.pending_amount,
                    status: "Processing",
                    signature: txnId
                }
            })
        })

        // send the txn to the solan Blocak chain
        res.status(200).json({
            message: "processsing the payout",
            amount: worker.pending_amount
        })
    } catch (error) {
        console.error(error);
        res.status(500)

    }
}

export const getNextTaskforWorker = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const userId = req.userId
        // const task = await prisma.task.findFirst({
        //     where: {
        //         submissions: {
        //             none: {
        //                 worker_id: userId,
        //             }
        //         },
        //         done: false
        //     },
        //     select: {
        //         title: true,
        //         options: true,
        //     }
        // })
        console.log("user id in controller ::", userId);

        const task = await getNextTask(Number(userId))

        if (!task) {
            res.status(411).json({
                message: "No more tasks left for you to review"
            })
        } else {
            res.status(411).json({
                task
            })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({

            message: "Internal server error"
        })

    }
}


export const taskSubmission = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        const body = req.body;
        const parsedBody = createSubmissionInput.safeParse(body)

        const TOTAL_SUBMISSIONS = process.env.TOTAL_SUBMISSIONS!
        if (parsedBody.success) {
            const task = await getNextTask(Number(userId));
            if (!task || task.id !== Number(parsedBody.data.taskId)) {
                return res.status(411).json({
                    message: "Incorrect task id"
                })
            }
            // const amount = (Number(task.amount) / Number(TOTAL_SUBMISSIONS)).toString()
            const amount = Number(task.amount) / Number(TOTAL_SUBMISSIONS)
            console.log("amount in submission ::", amount);

            const submission = await prisma.$transaction(async txn => {
                const submission = await txn.submission.create({
                    data: {
                        option_id: Number(parsedBody.data.selection),
                        worker_id: userId,
                        task_id: Number(parsedBody.data.taskId),
                        amount
                    }
                })
                await txn.worker.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        pending_amount: {
                            increment: amount //: i have changed this 
                        }
                    }
                })
                return submission
            })


            const nextTask = await getNextTask(Number(userId));

            res.json({
                nextTask,
                amount
            })
        }
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Inter nal server error"
        })
    }
}   