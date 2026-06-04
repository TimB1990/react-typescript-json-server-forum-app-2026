import type { Reply, ReplyState } from "../common/types/reply"
import { createStore } from "./createStore"

const store = createStore<ReplyState>({
    repliesByThread: {},
    totalCount: 0,
    loading: {},
    error: null
})

const fetchReplies = async (threadId: number | null = null, limit: number | null = null) => {

    const stateKey = threadId !== null ? threadId : "all"

    store.setState((prev) => ({
        ...prev,
        repliesByThread: {
            ...prev.repliesByThread,
            [stateKey]: []
        },
        loading: { ...prev.loading, [stateKey]: true }
    }))

    const params = new URLSearchParams();
    if (threadId !== null) {
        params.append("threadId", `${threadId}`)
        params.append("order", "desc")
    }

    if (limit !== null) params.append("limit", `${limit}`);

    try {

        const response = await fetch(`https://localhost:5001/replies?${params.toString()}`)
        const { data }: { data: Reply[] } = await response.json();
        const finalData = data;

        store.setState((prev) => ({
            ...prev,
            repliesByThread: {
                ...prev.repliesByThread,
                [stateKey]: finalData
            },
            loading: { ...prev.loading, [stateKey]: false }
        }))

    }
    catch (err) {
        store.setState((prev) => ({
            ...prev,
            error: "Failed to fetch replies: " + err,
            loading: { ...prev.loading, [stateKey]: false }
        }))
    }
}

export const RepliesStore = {
    getState: store.getState,
    subscribe: store.subscribe,
    fetch: async (threadId: number | null = null, limit: number | null = null) => {
        await fetchReplies(threadId, limit)
    },
    // getReplyByThreadId: async (threadId: number, messageId: number) => {

    //     const state = store.getState();
    //     const currentThreadReplies = state.repliesByThread[threadId] ?? [];

    //     const existingRecord = currentThreadReplies.find(reply => reply.messageId === messageId)

    //     if (existingRecord) {
    //         return existingRecord;
    //     }

    //     if (!state.loading[threadId]) {
    //         await fetchReplies(threadId)
    //     }

    //     const updatedState = store.getState();
    //     const freshThreadReplies = updatedState.repliesByThread[threadId] ?? []
    //     return freshThreadReplies.find(reply => reply.messageId === messageId)
    // },

    // setPageNumber: async (threadId: number, messageId: number, pageNumber: number) => {

    //     const stateKey = threadId !== null ? threadId : "all";

    //     try {
    //         // API CALL
    //         const response = await fetch(`http://localhost:5001/replies?messageId=${messageId}&limit=1`)
    //         const { data }: { data: Reply[] } = await response.json();

    //         let updatedRecord = { ...data[0], atPage: pageNumber }

    //         store.setState((prev) => {
    //             const currentList = prev.repliesByThread[stateKey] ?? []

    //             // If the ID matches, use the updatedRecord. Otherwise, keep the old one.
    //             const updatedList = currentList.map((reply) => 
    //                 reply.messageId === messageId ? updatedRecord : reply)

    //             // If the record wasn't in the list at all (e.g., first fetch), add it
    //             const recordExists = currentList.some(r => r.messageId === messageId)
    //             const finalResults = recordExists ? updatedList : [...currentList, updatedRecord]
                
    //             return ({
    //                 ...prev,
    //                 repliesByThread: {
    //                     ...prev.repliesByThread,
    //                     [stateKey]: finalResults
    //                 },
    //                 loading: { ...prev.loading, [stateKey]: false }
    //             })
    //         })
    //     }
    //     catch (err) {
    //         store.setState((prev) => ({
    //             ...prev,
    //             error: "Failed to set page: " + err,
    //             loading: { ...prev.loading, [stateKey]: false }
    //         }))
    //     }
    // },

    

}
