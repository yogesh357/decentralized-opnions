import e, { Request, Response } from "express";
import { createTaskInputs } from "../types/type";
import prisma from "../config/prisma";


const DEFAULT_TITLE = "Select the most clickable thumbnail"
export const createTask = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        //@ts-ignore
        const userId = req.userId

        const parsedResult = createTaskInputs.safeParse(body)

        if (!parsedResult.success) {
            return res.status(411).json({
                message: "You have sent wrong inputs",
                errors: parsedResult.error.format()
            })
        }

        const parsedData = parsedResult.data
        // parse the signature

        let response = await prisma.$transaction(async tx => {
            const response = await tx.task.create({
                data: {
                    title: parsedData?.title ?? DEFAULT_TITLE,
                    amount: "1",
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
            id: response.id
        })
    } catch (error) {


    }
}

export const getTask = async (req: Request, res: Response) => {
    try {
        //@ts-ignore
        const userId = req.userId;
        const { taskId } = req.query

        const taskDetail = await prisma.task.findFirst({
            where: {
                user_id: Number(userId),
                id: Number(taskId)
            },
            include: {
                options: true
            }

        })
        if (!taskDetail) {
            return res.json({
                status: false,
                message: "no task found !!"
            })
        }
        const response = await prisma.submission.findMany({
            where: {
                task_id: Number(taskId)
            },
            include: {
                option: true
            }
        });

        const result: Record<string, {
            count: number,
            option: {
                imageUrl: string
            }
        }> = {}
        taskDetail.options.forEach(option => {
            result[option.id] = {
                count: 0,
                option: {
                    imageUrl: option.image_url
                }
            }
        })
        response.forEach(r => {
            result[r.option_id].count++
        })

        return res.json({
            result
        })
    } catch (error) {
        console.log(error);

    }
}