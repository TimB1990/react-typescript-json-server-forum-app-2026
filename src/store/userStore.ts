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

    login: async (credentials: UserCredentials) => {

        store.setState({ loading: true, error: null })

        try {
            const response = await fetch('http://localhost:5001/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();

            // data.user should be the user object without the password
            store.setState({ currentUser: data.user, loading: false })
            return true; // Success

        } catch (error: any) {
            store.setState({ loading: false, error: error.message })
            return false; // Failure
        }
    },

    logout: () => {
        store.setState({ currentUser: null })
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
    }

}
