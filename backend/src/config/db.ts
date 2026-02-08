import prisma from "./prisma"

export const getNextTask = async (userId: Number) => {
    const newUserId = userId as number
    const task = await prisma.task.findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: newUserId
                }
            }
        },
        select: {
            id: true,
            amount: true,
            title: true,
            options: true
        }

    })
    return task
}

