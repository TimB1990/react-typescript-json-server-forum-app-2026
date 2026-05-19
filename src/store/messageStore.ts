import dayjs from "dayjs";
import type { MessageState, Message } from "../common/types/message";
import { createStore } from "./createStore";
import type { User } from "../common/types/users";
import type { Thread } from "../common/types/threads";

const store = createStore<MessageState>({
    messagesByThread: {},
    totalCount: 0,
    loading: {},
    error: null
})

// functions
const formatDate = (dateString: string): string => {
    return dayjs(dateString).calendar(null, {
        sameDay: '[Today at] HH:mm',
        nextDay: '[Tomorrow at] HH:mm',
        nextWeek: 'dddd [at] HH:mm',
        lastDay: '[Yesterday at] HH:mm',
        lastWeek: 'dddd [at] HH:mm',
        sameElse: 'D MMMM YYYY'
    })
}

const totalUserMessageCount = async (userId: number): Promise<number> => {
    const response = await fetch('http://localhost:5001/count/messages?userId=' + userId)
    const result = await response.json();
    const userMessageCount = result.count;
    return userMessageCount;
}

const getAuthor = async (userId: number): Promise<{
    author: string,
    avatar: string,
    totalUserMessageCount: number,
}> => {

    const authorResponse = await fetch(`http://localhost:5001/users/${userId}`)
    const author: User = await authorResponse.json();

    const count = await totalUserMessageCount(userId)

    return {
        author: author.username,
        avatar: author.avatar,
        totalUserMessageCount: count
    }
}

export const MessageStore = {
    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (threadId: number | null = null, limit: number | null = null) => {

        const stateKey = threadId !== null ? threadId : "all";

        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [stateKey]: true }
        }))

        const params = new URLSearchParams();
        if (threadId !== null) {
            params.append("threadId", "" + threadId);
        }

        if (limit !== null) params.append("limit", "" + limit);

        try {

            const response = await fetch(`http://localhost:5001/messages?${params.toString()}`)
            const { data } = await response.json();

            const messagePromises = data.map(async (item: Message) => {

                // set format for posted at
                const postedAt = formatDate(data.createdAt)
                const author = await getAuthor(data.userId)
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

    fetchLatestOverview: async (limit: number) => {
        const stateKey = 'all';

        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [stateKey]: true }
        }))

        const params = new URLSearchParams();

        if (limit !== null) params.append("limit", "" + limit);

        try {

            const response = await fetch(`http://localhost:5001/messages?${params.toString()}`)
            const { data } = await response.json();

            const messagePromises = data.map(async (item: Message) => {
                const threadResponse = await fetch(`http://localhost:5001/threads/${item.threadId}`)
                const author = await getAuthor(item.userId)
                const thread: Thread = await threadResponse.json();
                const { title } = thread
                const postedAt = formatDate(item.createdAt)
                return { ...item, threadInfo: { title }, messageBy: author, postedAt }
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
    }



}