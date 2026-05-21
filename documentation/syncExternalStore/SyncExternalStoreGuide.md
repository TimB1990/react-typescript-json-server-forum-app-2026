## Create a store
```tsx
// 1. create a store folder in /src and add file named index.tsx

import { useEffect, useSyncExternalStore } from 'react'
import { getState, subscribe, fetchPokemons } from './store.ts'

export const SyncExternalStoreExample = () => {
    
    const { pokemons } = useSyncExternalStore(subscribe, getState)

    useEffect(() => {
        fetchPokemons();
    }, [])
    
    return (
        <div>
            <h1>Pokemon list</h1>
            <ul>
                {pokemons.length === 0 ? (
                    <p>Loading...</p>
                ) : (
                    pokemons.map((pokemon, index) => <li key={index}>{pokemon.name}</li>)
                )}
            </ul>
        </div>
    )
}

// 2. create a file store.ts in the same folder
type Listener = () => void;

interface Pokemon {
    name: string;
    url?: string
}

interface State {
    pokemons: Pokemon[]
}

let state: State = { pokemons: [] } // initial state
let listeners: Listener[] = [] // list of subscribers

export const fetchPokemons = async () => {
    const response = await fetch(
        "http://pokeapi.co/api/v2/pokemon?limit=10"
    );

    const data = await response.json();
    state = {pokemons: data.results}
    listeners.forEach((listener) => listener()); // notify all subscribers
};

export const getState = (): State => state;

export const subscribe = (listener: Listener) => {
    listeners.push(listener);
    return () => {
        listeners = listeners.filter((l) => l !== listener)
    }
}
```