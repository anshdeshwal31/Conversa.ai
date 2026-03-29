import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const handler = async (_event) => {
    try {
        const result = await prisma.user.updateMany({
            data: {
                chatMessagesToday: 0,
            },
        });
        const body = {
            message: "daily chat reset completed successfully",
            usersReset: result.count,
            timestamp: new Date().toISOString(),
        };
        return {
            statusCode: 200,
            body: JSON.stringify(body),
        };
    }
    catch (error) {
        const details = error instanceof Error ? error.message : "Unknown error";
        const body = {
            error: "failed to reset the chat messages",
            details,
            timestamp: new Date().toISOString(),
        };
        return {
            statusCode: 500,
            body: JSON.stringify(body),
        };
    }
    finally {
        await prisma.$disconnect();
    }
};
