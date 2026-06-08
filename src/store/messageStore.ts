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

const totalUserMessageCount = async (userId: number): Promise<number> => {
    const response = await fetch('/api/count/messages?userId=' + userId)
    const result = await response.json();
    const userMessageCount = result.count;
    return userMessageCount;
}

// Local cache to prevent redundant fetches for the same user on one page
const authorCache: Record<number, any> = {}

const getAuthor = async (userId: number): Promise<{
    author: string,
    avatar: string,
    totalUserMessageCount: number,
}> => {

    if (authorCache[userId]) return authorCache[userId]

    const authorResponse = await fetch(`/api/users/${userId}`)
    const author: User = await authorResponse.json();
    const count = await totalUserMessageCount(userId)

    const authorData = {
        author: author.username,
        avatar: author.avatar,
        totalUserMessageCount: count
    }

    // Save to cache
    authorCache[userId] = authorData;
    return authorData;
}

export const MessageStore = {
    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (threadId: number | null = null, limit: number | null = null, page: number | null = null) => {

        const stateKey = threadId !== null ? threadId : "all";

        store.setState((prev) => ({
            ...prev,
            // 1. Clear the old data immediately so the UI shows 'Loading'
            messagesByThread: {
                ...prev.messagesByThread,
                [stateKey]: []
            },
            loading: { ...prev.loading, [stateKey]: true }
        }));

        const params = new URLSearchParams();
        if (threadId !== null) {
            params.append("threadId", `${threadId}`);
            params.append("order", "asc")
        }

        if (limit !== null) params.append("limit", `${limit}`);
        if (page !== null) params.append("page", `${page}`);

        try {

            const response = await fetch(`/api/messages?${params.toString()}`)
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
            loading: { ...prev.loading, [stateKey]: true }
        }))

        const params = new URLSearchParams();
        if (limit !== null) params.append("limit", `${limit}`);
        params.append("page", `${page}`);

        try {
            console.log('my params: ', `/api/messages/latest-overview?${params.toString()}`)
            const response = await fetch(`/api/messages/latest-overview?${params.toString()}`)
            const { data } = await response.json();

            const messagePromises = data.map(async (item: Message) => {
                const threadResponse = await fetch(`/api/threads/${item.threadId}`);
                const thread: Thread = await threadResponse.json();

                const author = item.userId ? await getAuthor(item.userId) : null
                const postedAt = formatDate(item.createdAt)

                return {...item, threadInfo: { title: thread.title}, messageBy: author, postedAt}
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
            const response = await fetch('/api/count/messages')
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
                const response = await fetch(`/api/messages/${messageId}`)
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