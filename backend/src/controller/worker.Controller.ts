
import { Response, Request } from 'express'
import prisma from '../config/prisma'
import jwt from 'jsonwebtoken'

export const signup = async (req: Request, res: Response) => {
    // TODO add sign verification logic
    const hardCodedWalletAddress = "9MCiJLwrhhvPAH2TwL5FSbpcJDovZABvCLZFp2c76rHq"

    const existingUser = await prisma.user.findFirst({
        where: {
            address: hardCodedWalletAddress
        }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id,
        }, process.env.JWT_SECRETE!)

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

export const getNextTask = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const userId = req.userId
        const task = await prisma.task.findFirst({
            where: {
                submissions: {
                    none: {
                        worker_id: userId,
                    }
                },
                done: false
            },
            select: {
                title: true,
                options: true,
            }
        })
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

    }
}