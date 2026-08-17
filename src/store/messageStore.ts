import dayjs from "dayjs";
import type { MessageState, Message } from "../common/types/message";
import { createStore } from "./createStore";
import type { User } from "../common/types/users";
import type { Thread } from "../common/types/threads";
import { RepliesStore } from "./repliesStore";


const store = createStore<MessageState>({
    messagesByThread: {},
    totalCount: 0,
    loading: {},
    error: null
})

// functions
const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("MMMM D, YYYY [at] HH:mm")
}

// Local cache to prevent redundant fetches for the same user on one page
const authorCache: Record<number, any> = {}

const getAuthor = async (userId: number): Promise<{
    author: string,
    avatar: string,
    totalUserMessageCount: number,
}> => {

    if (authorCache[userId]) return authorCache[userId]

    const authorResponse = await fetch(`http://localhost:5001/users/${userId}`)
    const author: User = await authorResponse.json();

    const authorData = {
        author: author.username,
        avatar: author.avatar,
        totalUserMessageCount: author.messageCount ?? 0
    }

    // Save to cache
    authorCache[userId] = authorData;
    return authorData;
}

export const MessageStore = {
    getState: store.getState,
    subscribe: store.subscribe,


    clearError: () => {
        store.setState((prev) => ({ ...prev, error: null }));
    },

    clearAuthorCache: (userId?: number) => {
        if (userId) {
            delete authorCache[userId]
        }
        else {
            Object.keys(authorCache).forEach((key) => delete authorCache[Number(key)]);
        }
    },

    delete: async (messageId: number, threadId?: number): Promise<boolean> => {
        try {
            const response = await fetch(`http://localhost:5001/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Transmits auth_token cookie
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Failed to delete message';
                store.setState((prev) => ({ ...prev, error: errorMessage }));
                return false; // <-- CRITICAL FIX: Return early to block the state removal below!
            }

            const state = store.getState();
            let targetUserId: number | undefined;

            const currentMessages = threadId
                ? state.messagesByThread[threadId] || []
                : Object.values(state.messagesByThread).flat();

            const targetMsg = currentMessages.find((m) => m.id === messageId);
            if (targetMsg?.userId) {
                targetUserId = targetMsg.userId;
            }

            store.setState((prev) => {
                const updatedMessagesByThread: Record<string | number, Message[]> = {};

                Object.keys(prev.messagesByThread).forEach((key) => {
                    updatedMessagesByThread[key] = prev.messagesByThread[key].filter(
                        (msg) => msg.id !== messageId
                    );
                });

                return {
                    ...prev,
                    messagesByThread: updatedMessagesByThread,
                    totalCount: Math.max(0, prev.totalCount as number - 1)
                };
            });

            if (targetUserId) {
                MessageStore.clearAuthorCache(targetUserId);
            } else {
                MessageStore.clearAuthorCache();
            }

            return true;

        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: `Failed to delete message: ${err instanceof Error ? err.message : err}`
            }));
            return false;
        }
    },

    fetch: async (threadId: number | null = null, limit: number | null = null, page: number | null = null) => {

        const stateKey = threadId !== null ? threadId : "all";

        store.setState((prev) => ({
            ...prev,
            // 1. Clear the old data immediately so the UI shows 'Loading'
            messagesByThread: {
                ...prev.messagesByThread,
                [stateKey]: []
            },
            loading: { ...prev.loading, [stateKey]: true },
            error: null // <-- ADD THIS LINE to clear old errors on new fetch
        }));

        const params = new URLSearchParams();
        if (threadId !== null) {
            params.append("threadId", `${threadId}`);
            params.append("order", "asc")
        }

        if (limit !== null) params.append("limit", `${limit}`);
        if (page !== null) params.append("page", `${page}`);

        try {

            const response = await fetch(`http://localhost:5001/messages?${params.toString()}`)
            const { data }: { data: Message[] } = await response.json();

            // resolve parent pages logic
            // collect all unique parentIds from this slice of messages
            const parentIds = data
                .map(m => m.parentId)
                .filter((id): id is number => id !== null)

            const uniqueParentIds = [...new Set(parentIds)]

            // trigger resolve page call in background
            if (uniqueParentIds.length > 0) {
                RepliesStore.resolveMissingPages(uniqueParentIds)
            }

            // makes if thread ID not empty then also apply order so data is fetched well.
            const messagePromises = data.map(async (item: Message) => {

                // set format for posted at
                const postedAt = formatDate(item.createdAt)
                const author = await getAuthor(item.userId)
                return { ...item, messageBy: author, postedAt }
            })

            const finalData = await Promise.all(messagePromises)

            store.setState((prev) => ({
                ...prev,
                messagesByThread: {
                    ...prev.messagesByThread,
                    [stateKey]: finalData
                },
                loading: { ...prev.loading, [stateKey]: false }
            }))

        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to fetch Messages: " + err,
                loading: { ...prev.loading, [stateKey]: false }
            }));
        }
    },

    fetchLatestOverview: async (limit: number, page: number = 1) => {

        const stateKey = 'all'

        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [stateKey]: true },
            error: null // <-- ADD THIS LINE to clear old errors on new fetch
        }))

        const params = new URLSearchParams();
        if (limit !== null) params.append("limit", `${limit}`);
        params.append("page", `${page}`);

        try {
            const response = await fetch(`http://localhost:5001/messages/latest-overview?${params.toString()}`)
            const { data } = await response.json();

            const messagePromises = data.map(async (item: Message) => {
                const threadResponse = await fetch(`http://localhost:5001/threads/${item.threadId}`);
                const thread: Thread = await threadResponse.json();

                const author = item.userId ? await getAuthor(item.userId) : null
                const postedAt = formatDate(item.createdAt)

                const threadId = item.threadId;
                const currentThreadMessagesResponse = await fetch(`http://localhost:5001/messages?${threadId}`)
                const { totalPages } = await currentThreadMessagesResponse.json();

                return { ...item, threadInfo: { title: thread.title, lastThreadPage: totalPages, firstThreadpage: 1 }, messageBy: author, postedAt }
            })

            const finalData = await Promise.all(messagePromises)

            store.setState((prev) => ({
                ...prev,
                messagesByThread: {
                    ...prev.messagesByThread,
                    [stateKey]: finalData

                }
            }))

        }
        catch (err) {
            console.log('but failed')
            store.setState((prev) => ({
                ...prev,
                error: "Failed to fetch Messages: " + err,
                loading: { ...prev.loading, [stateKey]: false }
            }))
        }

    },
    countTotal: async () => {

        try {
            const response = await fetch('http://localhost:5001/count/messages')
            const result = await response.json();
            const count = result.count;

            store.setState((prev) => ({
                ...prev,
                totalCount: count
            }))
        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to count Messages: " + err
            }))
        }
    },
    getMessageById: async (messageId: number, threadId: number) => {

        const state = store.getState();
        const currentStateMessages = state.messagesByThread[threadId] ?? []
        const existingRecord = currentStateMessages.find(m => m.id === messageId)

        if (existingRecord) return existingRecord;

        if (!state.loading[threadId]) {
            try {
                const response = await fetch(`http://localhost:5001/messages/${messageId}`)
                const result: Message = await response.json();

                const messagePromises = async (item: Message) => {
                    const postedAt = formatDate(item.createdAt)
                    const author = await getAuthor(item.userId)
                    return { ...item, messageBy: author, postedAt }
                }

                const finalData = await messagePromises(result)
                return finalData

            } catch (err) {
                console.error("Cannot fetch message: " + err)
            }
        }

    }
}