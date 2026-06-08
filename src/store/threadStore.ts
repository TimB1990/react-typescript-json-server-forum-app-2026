import { type ThreadState, type Thread } from "../common/types/threads"
import { createStore } from "./createStore";
import dayjs from "dayjs";
// import calendar from 'dayjs/plugin/calendar';

// Initial state must match your new ThreadState interface
const store = createStore<ThreadState>({
    threadsByCategory: {},
    totalCount: 0,
    loading: {},
    error: null,
});

// declare function to get the user data (the author) of the most recent message inside a given thread
const messageAndAuthor = async (threadId: number, authorOf: 'lastMessage' | 'firstMessage'): Promise<{ author: string, postedAt: string, avatar: string }> => {

    // We only need 1 message, but we need to tell the server which end of the timeline to look at
    const order = authorOf === 'firstMessage' ? 'asc' : 'desc';

    // Fetch messages for the specific thread
    const msgResponse = await fetch(`http://localhost:5001/messages?threadId=${threadId}&limit=1&order=${order}`);
    const result = await msgResponse.json();

    if (!result.data || result.data.length === 0) {
        return { author: "System", postedAt: "No messages", avatar: "" };
    }

    // Because we used limit=1, the message we want is always at index 0
    const targetMessage = result.data[0];
    const userId = targetMessage.userId;
    const postedAt = targetMessage.createdAt;

    // Fetch the author details
    const authorResponse = await fetch(`http://localhost:5001/users/${userId}`);
    const { username, avatar } = await authorResponse.json();

    return {
        author: username,
        postedAt: dayjs(postedAt).fromNow(),
        avatar
    };
};

export const ThreadStore = {
    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (categoryId: number | null = null, limit: number | null = null, page: number | null = null) => {

        const stateKey = categoryId !== null ? categoryId : "all";

        store.setState((prev) => ({
            ...prev,
            // 1. Clear the old data immediately so the UI shows 'Loading'
            threadsByCategory: {
                ...prev.threadsByCategory,
                [stateKey]: []
            },
            loading: { ...prev.loading, [stateKey]: true }
        }));

        const params = new URLSearchParams();

        if (categoryId !== null) {
            params.append("categoryId", `${categoryId}`);
        }

        if (limit !== null) params.append("limit", `${limit}`);
        if (page !== null) params.append("page", `${page}`);

        try {

            const response = await fetch(`http://localhost:5001/threads?${params.toString()}`);
            const { data } = await response.json();

            const messageCount = async (threadId: number): Promise<number> => {
                const response = await fetch('http://localhost:5001/count/messages?threadId=' + threadId)
                const result = await response.json();
                const count = result.count
                return count;
            }

            const threadPromises = data.map(async (item: Thread) => {
                const count = await messageCount(item.id);
                const lastMessageBy = await messageAndAuthor(item.id, 'lastMessage');
                const firstMessageBy = await messageAndAuthor(item.id, 'firstMessage')
                return { ...item, lastMessageBy, firstMessageBy, messages: count };
            });
            const finalData = await Promise.all(threadPromises);

            store.setState((prev) => ({
                ...prev,
                threadsByCategory: {
                    ...prev.threadsByCategory,
                    [stateKey]: finalData
                },
                loading: { ...prev.loading, [stateKey]: false }
            }));

        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to fetch Threads: " + err,
                loading: { ...prev.loading, [stateKey]: false }
            }));
        }
    },
    countTotal: async () => {

        try {
            const response = await fetch('http://localhost:5001/count/threads')
            const result = await response.json();
            const count = result.count;

            store.setState((prev) => ({
                ...prev,
                totalCount: count
            }))
        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to count Threads: " + err
            }))
        }
    }
};
