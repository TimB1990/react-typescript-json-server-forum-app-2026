import type { User } from "./users";

export interface AuthContextType {
    user: User | null
    loading: boolean
    setUser: React.Dispatch<React.SetStateAction<User | null>>
    logout: () => Promise<void>
}