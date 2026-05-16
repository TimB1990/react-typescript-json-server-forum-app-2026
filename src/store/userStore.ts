import {type UserState, type UserCredentials} from "../common/types/users"
import { createStore } from "./createStore";

const store = createStore<UserState>({
    users: [],
    currentUser: null,
    loading: false,
    error: null
})

// Actions
export const UserStore = {

    getState: store.getState,
    subscribe: store.subscribe,

    fetch: async () => {

        const state = store.getState();
        if (state.loading || state.users.length > 0) return;
  
        store.setState({loading: true})

        try {
            const response = await fetch('http://localhost:5001/users');
            const data = await response.json();
            store.setState({users: data, loading: false })
        } catch (err) {
            store.setState({ loading: false, error: "Failed to fetch" })
        }
    },

    login: async (credentials: UserCredentials) => {

        store.setState({loading: true, error: null }) 

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
            store.setState({currentUser: data.user, loading: false })
            return true; // Success

        } catch (error: any) {
            store.setState({loading: false, error: error.message })
            return false; // Failure
        }
    },

    logout: () => {
        store.setState({currentUser: null })
    }

}
