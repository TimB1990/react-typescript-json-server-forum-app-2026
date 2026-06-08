import {type CategoriesState, type Category } from "../common/types/categories"
import { createStore } from "./createStore";

const store = createStore<CategoriesState>({
    categoriesByGroup: {},
    loading: {},
    error: null
})

// Actions
export const CategoryStore = {

    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (groupId: number, limit: number | null = null, page: number | null = null) => {
        
        // Set loading state to true for the specific category
        store.setState((prev) => ({
            ...prev,
            loading: { ...prev.loading, [groupId]: true }
        }));

        // set params to work as query string, and append like [?&]categoryId=3
        const params = new URLSearchParams();
        params.append("groupId", "" + groupId);

        // in case the limit is given as an argument to this function apply the limit like [?&]limit=5
        if (limit !== null) params.append("limit", `${limit}`);
        if (page !== null) params.append("page", `${page}`)
        
        try {
            const response = await fetch(`/api/categories?${params.toString()}`);
            const {data} = await response.json();

            const messageCount = async (categoryId: number) :Promise<number> => {
                const response = await fetch('/api/count/messages?categoryId=' + categoryId)
                const result = await response.json();
                const count = result.count
                return count;
            }

            const categoryPromises = data.map(async (item: Category) => {

                const count = await messageCount(item.id)
                return {
                    ...item,
                    messages: count
                }
            })

            const finalData = await Promise.all(categoryPromises);

             // set the state where prev state is spreaded as well as threadsByCategory in case it was present.
            // set dynamic key 'categoryId' (e.g. 4) and assign finalData to it.
            // set dynamic key 'categoryId' (.e.g. 4) and set its property to false (loading is an object)
            store.setState((prev) => ({
                ...prev,
                categoriesByGroup: {
                    ...prev.categoriesByGroup,
                    [groupId]: finalData
                },
                loading: { ...prev.loading, [groupId]: false }
            }));

        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to fetch Categories: " + err,
                loading: { ...prev.loading, [groupId]: false }
            }));
        }
    }
}
