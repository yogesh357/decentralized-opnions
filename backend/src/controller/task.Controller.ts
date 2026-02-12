import { Request, Response } from "express";
import { createTaskInputs } from "../types/type";
import prisma from "../config/prisma";
import { Connection } from "@solana/web3.js";


const DEFAULT_TITLE = "Select the most clickable thumbnail"
const TOTAL_DECIMALS = Number(process.env.TOTAL_DECIMALS!);

const connection = new Connection(process.env.RPC_URL! as string)
export const createTask = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        //@ts-ignore
        const userId = req.userId

        const parsedResult = createTaskInputs.safeParse(body)
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })

        if (!parsedResult.success) {
            return res.status(411).json({
                message: "You have sent wrong inputs",
                errors: parsedResult.error.format()
            })
        }

        const parsedData = parsedResult.data
        // parse the signature
        const amount = 1 * Number(TOTAL_DECIMALS)
        const transaction = await connection.getTransaction(parsedData.signature, {
            maxSupportedTransactionVersion: 1
        });

        console.log(transaction);

        if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
            return res.status(411).json({
                message: "Transaction signature/amount incorrect"
            })
        }

        if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== process.env.PARENT_WALLET_ADDRESS!) {
            return res.status(411).json({
                message: "Transaction sent to wrong address"
            })
        }

        if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
            return res.status(411).json({
                message: "Transaction sent to wrong address"
            })
        }
        // was this money paid by this user address or a different address?

        // parse the signature here to ensure the person has paid 0.1 SOL
        // const transaction = Transaction.from(parseData.data.signature);


        let response = await prisma.$transaction(async tx => {
            const response = await tx.task.create({
                data: {
                    title: parsedData?.title ?? DEFAULT_TITLE,
                    amount,
                    signature: parsedData?.signature!,
                    user_id: userId
                }
            })
            await tx.option.createMany({
                data: parsedData?.options.map(x => ({
                    image_url: x.imageUrl,
                    task_id: response.id,

                }))
            })
            return response
        })

        res.json({
            success: true,
            id: response.id
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getTask = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = Number(req.userId);
        const taskId = Number(req.query.taskId);

        if (!taskId) {
            return res.status(400).json({ message: "Task ID required" });
        }

        const task = await prisma.task.findFirst({
            where: {
                id: taskId,
                user_id: userId,
            },
            include: {
                options: true,
            },
        });
        if (!task) {
            return res.status(400).json({ message: "No Task found " });
        }
        const submissions = await prisma.submission.findMany({
            where: {
                task_id: taskId,
            },
            include: {
                option: true,
            },
        });

        const result: Record<
            number,
            {
                count: number;
                option: {
                    imageUrl: string;
                };
            }
        > = {};

        // Init counts
        task.options.forEach((opt) => {
            result[opt.id] = {
                count: 0,
                option: {
                    imageUrl: opt.image_url,
                },
            };
        });

        // Count votes
        submissions.forEach((sub) => {
            if (result[sub.option_id]) {
                result[sub.option_id].count++;
            }
        });

        return res.json({
            task: {
                id: task.id,
                title: task.title,
                amount: task.amount,
            },
            result,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
