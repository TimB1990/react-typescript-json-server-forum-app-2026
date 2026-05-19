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

export const ThreadStore = {
    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (categoryId: number | null = null, limit: number | null = null) => {

        const stateKey = categoryId !== null ? categoryId : "all";

        // Set loading state to true for the specific category
        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [stateKey]: true }
        }));

        // set params to work as query string, and append like [?&]categoryId=3
        const params = new URLSearchParams();

        // only append category ID if it is explicitly provided
        if (categoryId !== null) {
            params.append("categoryId", "" + categoryId);
        }

        // in case the limit is given as an argument to this function apply the limit like [?&]limit=5
        if (limit !== null) params.append("limit", "" + limit);

        try {

            // fetch data via the URL + query params 
            const response = await fetch(`http://localhost:5001/threads?${params.toString()}`);
            const { data } = await response.json();

            // declare function to get message count of a given thread like /count/messages?threadId=4
            const messageCount = async (threadId: number): Promise<number> => {
                const response = await fetch('http://localhost:5001/count/messages?threadId=' + threadId)
                const result = await response.json();
                const count = result.count
                return count;
            }

            // declare function to get the user data (the author) of the most recent message inside a given thread
            const lastMessageAndAuthor = async (threadId: number): Promise<{ author: string, postedAt: string, avatar: string }> => {

                // get the latest message in the tread via ?threadId=4&limit=1, limit is applied and fetches most recent message in thread.
                const msgResponse = await fetch(`http://localhost:5001/messages?threadId=${threadId}&limit=1`)
                const result = await msgResponse.json();

                // Safety check: What if a thread has 0 messages?
                if (!result.data || result.data.length === 0) {
                    return { author: "System", postedAt: "No messages", avatar: "" };
                }

                // get the userId and createdAt as postedAt from the result's (only) first data item.
                const userId = result.data[0].userId
                const postedAt = result.data[0].createdAt

                // apply the userId being fetched to look up specific user (author)
                const authorResponse = await fetch(`http://localhost:5001/users/${userId}`)
                const { username, avatar } = await authorResponse.json();

                // return the concatted data 
                return {
                    author: username,
                    postedAt: dayjs(postedAt).calendar(null, {
                        sameDay: '[Today at] HH:mm',
                        nextDay: '[Tomorrow at] HH:mm',
                        nextWeek: 'dddd [at] HH:mm',
                        lastDay: '[Yesterday at] HH:mm',
                        lastWeek: 'dddd [at] HH:mm',
                        sameElse: 'D MMMM YYYY'
                    }),
                    avatar
                }
            }

            // apply an async function to for Array.map() on data awaiting messageCount and lastMessageAndAuthor results to new data 
            const threadPromises = data.map(async (item: Thread) => {
                const count = await messageCount(item.id);
                const authorInfo = await lastMessageAndAuthor(item.id);
                return { ...item, lastMessageBy: authorInfo, messages: count };
            });

            // resolve the Promises (get the resulting values)
            const finalData = await Promise.all(threadPromises);

            // set the state where prev state is spreaded as well as threadsByCategory in case it was present.
            // set dynamic key 'categoryId' (e.g. 4) and assign finalData to it.
            // set dynamic key 'categoryId' (.e.g. 4) and set its property to false (loading is an object)
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
