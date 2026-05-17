export type Message = {
    id: number,
    threadId: number,
    parentId: number | null,
    categoryId: number,
    userId: number,
    threadInfo?: {
        title: string,
    }
    messageBy: {
        author: string,
        avatar: string,
        totalUserMessageCount: number
    },
    content: string,
    createdAt: string,
    postedAt: string
}

export interface MessageState {
    messagesByThread: Record<string, Message[]>,
    loading: Record<string, boolean>,
    error?: string | null
}