import { Request, Response } from "express";
import { createTaskInputs } from "../types/type";
import prisma from "../config/prisma";
import { Connection, SystemProgram } from "@solana/web3.js";


const DEFAULT_TITLE = "Select the most clickable thumbnail"
const TOTAL_DECIMALS = Number(process.env.TOTAL_DECIMALS!);
const REQUIRED_LAMPORTS = 100_000_000; // 0.1 SOL
const TOLERANCE = 20_000; // fee margin

const connection = new Connection(process.env.RPC_URL! as string)

// export const createTask = async (req: Request, res: Response) => {
//     try {
//         const body = req.body;
//         //@ts-ignore
//         const userId = req.userId
//         console.log("body on backend for create task :", body);

//         const parsedResult = createTaskInputs.safeParse(body)
//         const user = await prisma.user.findFirst({
//             where: {
//                 id: userId
//             }
//         })

//         if (!parsedResult.success) {
//             return res.status(411).json({
//                 message: "You have sent wrong inputs-1",
//                 errors: parsedResult.error.format()
//             })
//         }

//         const parsedData = parsedResult.data
//         // parse the signature
//         const amount = 1 * Number(TOTAL_DECIMALS)
//         const transaction = await connection.getTransaction(parsedData.signature, {
//             maxSupportedTransactionVersion: 1
//         });

//         console.log("txn", transaction);
//         //:
//         // if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
//         //     return res.status(411).json({
//         //         message: "Transaction signature/amount incorrect"
//         //     })
//         // }
//         const tx = transaction;

//         if (!tx || !tx.meta) {
//             return res.status(400).json({ message: "Invalid transaction" });
//         }

//         const accountKeys = tx.transaction.message.getAccountKeys();

//         // Find receiver index
//         const receiverIndex = accountKeys
//             .keySegments()
//             .flat()
//             .findIndex(
//                 k => k.toString() === process.env.PARENT_WALLET_ADDRESS
//             );

//         if (receiverIndex === -1) {
//             return res.status(400).json({
//                 message: "Receiver not found in transaction",
//             });
//         }

//         const received =
//             tx.meta.postBalances[receiverIndex] -
//             tx.meta.preBalances[receiverIndex];

//         console.log("RECEIVED:", received);

//         if (received !== 100_000_000) {
//             return res.status(400).json({
//                 message: "Incorrect payment amount",
//             });
//         }

//         if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== process.env.PARENT_WALLET_ADDRESS!) {
//             return res.status(411).json({
//                 message: "Transaction sent to wrong address"
//             })
//         }

//         if (transaction?.transaction.message.getAccountKeys().get(0)?.toString() !== user?.address) {
//             return res.status(411).json({
//                 message: "Transaction sent to wrong address"
//             })
//         }
//         // was this money paid by this user address or a different address?

//         // parse the signature here to ensure the person has paid 0.1 SOL
//         // const transaction = Transaction.from(parseData.data.signature);


//         let response = await prisma.$transaction(async tx => {
//             const response = await tx.task.create({
//                 data: {
//                     title: parsedData?.title ?? DEFAULT_TITLE,
//                     amount,
//                     signature: parsedData?.signature!,
//                     user_id: userId
//                 }
//             })
//             await tx.option.createMany({
//                 data: parsedData?.options.map(x => ({
//                     image_url: x.imageUrl,
//                     task_id: response.id,

//                 }))
//             })
//             return response
//         })

//         res.json({
//             success: true,
//             id: response.id
//         })
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Internal server error"
//         })
//     }
// }

export const createTask = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // From auth middleware
        // @ts-ignore
        const userId = req.userId;

        console.log("CREATE TASK BODY:", body);

        /* ----------------------------------
           1️⃣ Validate Input (Zod)
        -----------------------------------*/
        const parsed = createTaskInputs.safeParse(body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: parsed.error.format(),
            });
        }

        const data = parsed.data;

        /* ----------------------------------
           2️⃣ Fetch User
        -----------------------------------*/
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized user",
            });
        }

        /* ----------------------------------
           3️⃣ Fetch Transaction
        -----------------------------------*/
        const tx = await connection.getTransaction(data.signature, {
            maxSupportedTransactionVersion: 1,
        });

        if (!tx || !tx.meta) {
            return res.status(400).json({
                message: "Invalid or unconfirmed transaction",
            });
        }

        console.log("TX FOUND:", tx.transaction.signatures[0]);

        /* ----------------------------------
           4️⃣ Extract Accounts
        -----------------------------------*/
        const keys = tx.transaction.message
            .getAccountKeys()
            .keySegments()
            .flat()
            .map((k) => k.toString());

        const receiver = process.env.PARENT_WALLET_ADDRESS;
        const sender = user.address;

        if (!receiver) {
            return res.status(500).json({
                message: "Receiver wallet not configured",
            });
        }

        /* ----------------------------------
           5️⃣ Verify Sender & Receiver
        -----------------------------------*/
        const receiverIndex = keys.findIndex((k) => k === receiver);
        const senderIndex = keys.findIndex((k) => k === sender);

        if (receiverIndex === -1) {
            return res.status(400).json({
                message: "Receiver not found in transaction",
            });
        }

        if (senderIndex === -1) {
            return res.status(400).json({
                message: "Sender mismatch",
            });
        }

        /* ----------------------------------
           6️⃣ Verify Amount (Balance Check)
        -----------------------------------*/
        const received =
            tx.meta.postBalances[receiverIndex] -
            tx.meta.preBalances[receiverIndex];

        console.log("RECEIVED LAMPORTS:", received);

        if (Math.abs(received - REQUIRED_LAMPORTS) > TOLERANCE) {
            return res.status(400).json({
                message: "Incorrect payment amount",
                received,
            });
        }

        /* ----------------------------------
           7️⃣ Verify Transfer Instruction
        -----------------------------------*/
        const instructions = tx.transaction.message.instructions;

        const hasTransfer = instructions.some((ix) => {
            const programId =
                tx.transaction.message
                    .getAccountKeys()
                    .get(ix.programIdIndex)
                    ?.toString();

            return programId === SystemProgram.programId.toString();
        });

        if (!hasTransfer) {
            return res.status(400).json({
                message: "No SOL transfer instruction found",
            });
        }

        /* ----------------------------------
           8️⃣ Prevent Duplicate Usage
        -----------------------------------*/
        const existing = await prisma.task.findFirst({
            where: { signature: data.signature },
        });

        if (existing) {
            return res.status(409).json({
                message: "Transaction already used",
            });
        }

        /* ----------------------------------
           9️⃣ Save to Database
        -----------------------------------*/
        const result = await prisma.$transaction(async (txDb) => {
            const task = await txDb.task.create({
                data: {
                    title: data.title,
                    amount: REQUIRED_LAMPORTS,
                    signature: data.signature,
                    user_id: userId,
                },
            });

            await txDb.option.createMany({
                data: data.options.map((opt) => ({
                    image_url: opt.imageUrl,
                    task_id: task.id,
                })),
            });

            return task;
        });

        /* ----------------------------------
           ✅ Success
        -----------------------------------*/
        return res.json({
            success: true,
            id: result.id,
        });
    } catch (err) {
        console.error("CREATE TASK ERROR:", err);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

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
