export type Reply = {
    messageId: number,
    parentMessageId: number,
    threadId: number,
    atPage: number | null,
    createdAt: number
}

export interface ReplyState {
    repliesByThread: Record<string, Reply[]>,
    totalCount?: number,
    loading: Record<string, boolean>,
    error?: string | null
}