export type Listener = () => void

export function createStore<T>(initialState: T) {
    let state = initialState
    const listeners = new Set<Listener>();

    const notify = () => listeners.forEach((l) => l());

    return {
        getState: () => state,
        setState: (nextState: Partial<T> | ((prev: T) => T)) => {
            const newState = typeof nextState === 'function'
                ? (nextState as Function)(state)
                : { ...state, ...nextState }

            state = newState;
            notify()
        },
        subscribe: (listener: Listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener)
        }
    }

}