import { type GroupState, type Group } from "../common/types/group";
import { createStore } from "./createStore";

const store = createStore<GroupState>({
    groups: [],
    loading: false,
    error: null
})

export const GroupStore = {
    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (limit: number | null = null) => {

        // Set loading state to true for the specific group
        store.setState((prev) => ({
            ...prev,
            loading: true
        }));

        const params = new URLSearchParams();

        // in case the limit is given as an argument to this function apply the limit like [?&]limit=5
        if (limit !== null) params.append("limit", "" + limit);

        try {
            const response = await fetch(`/api/groups${params.size > 0 ? params.toString() : '' }`)
            const { data } = await response.json();

            store.setState((prev) => ({
                ...prev,
                groups: data,
                loading: false
            }))
        }
        catch(err){
            store.setState((prev) => ({
                ...prev,
                error: "Failed to catch Groups: " + err,
                loading: false
            }))
        }
    }
}