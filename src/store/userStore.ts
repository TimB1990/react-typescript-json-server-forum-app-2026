import { type UserState, type UserCredentials } from "../common/types/users"
import { createStore } from "./createStore";

const store = createStore<UserState>({
    users: [],
    currentUser: null,
    totalCount: 0,
    loading: false,
    error: null
})

// Actions
export const UserStore = {

    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async (limit: number | null = null) => {

        store.setState((prev) => ({
            ...prev,
            loading: true
        }))

        const params = new URLSearchParams();
        if (limit !== null) {
            params.append("limit", `${limit}`);
        }

        try {
            const response = await fetch(`http://localhost:5001/users?${params.toString()}`)
            const { data } = await response.json();

            store.setState((prev) => ({
                ...prev,
                users: data,
                loading: false
            }))

        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to fetch Users: " + err,
                loading: false
            }))
        }
    },

    countTotal: async () => {

        try {
            const response = await fetch('http://localhost:5001/count/users')
            const result = await response.json();
            const count = result.count;

            store.setState((prev) => ({
                ...prev,
                totalCount: count
            }))
        } catch (err) {
            store.setState((prev) => ({
                ...prev,
                error: "Failed to count Users: " + err
            }))
        }
    },

    updateAvatar: async (userId: string | number, base64Image: string) => {

        // spread prev state and afterwards set loading to true and error to null
        store.setState((prev) => ({...prev, loading: true, error: null}))

        try {
            const response = await fetch(`http://localhost:5001/users/${userId}/avatar`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({avatar: base64Image})
            })

            if(!response.ok){
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update avatar')
            }

            const { user } = await response.json();

            // update local state with updated user details
            store.setState((prev) => ({
                ...prev,
                currentUser: user,
                users: prev.users.map((u) => (u.id === userId ? user: u)),
                loading: false
            }))

            return true;

        } catch(err: any){
            store.setState((prev) => ({
                ...prev,
                error: err.message || 'Avatar update failed',
                loading: false
            }))

            return false
        }
    } 

}
