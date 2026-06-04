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
    return dayjs(dateString).format("MMMM D, YYYY [at] HH:mm")
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

            const response = await fetch(`http://localhost:5001/messages?${params.toString()}`)
            const { data } = await response.json();
            
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
        const stateKey = 'all';

        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [stateKey]: true }
        }))

        const params = new URLSearchParams();

        if (limit !== null) params.append("limit", `${limit}`);

        // add the page paramter. In this case always the first page.
        params.append("page", `${page}`)

        try {

            const response = await fetch(`http://localhost:5001/messages?${params.toString()}`)
            const { data } = await response.json();

            const messagePromises = data.map(async (item: Message) => {
                const threadResponse = await fetch(`http://localhost:5001/threads/${item.threadId}`);
                const thread: Thread = await threadResponse.json();

                // Fetch the creator - explicitly set page 1 and limit 1
                const creatorMsgResponse = await fetch(
                    `http://localhost:5001/messages?threadId=${item.threadId}&order=asc&limit=1&page=1`
                );

                const { data: creatorData } = await creatorMsgResponse.json(); // Note: destructured as creatorData to avoid name collision
                const firstMessage = creatorData[0];

                // get the author of that specific first message
                const author = firstMessage ? await getAuthor(firstMessage.userId) : null

                const postedAt = formatDate(item.createdAt)

                return {
                    ...item,
                    threadInfo: { title: thread.title },
                    messageBy: author,
                    postedAt
                }
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