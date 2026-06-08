export interface User {
    id: number,
    username: string,
    avatar: string // url to image
    createdAt: string
}

export interface UserState {
    users: User[] | [],
    currentUser?: User | null,
    totalCount?: number | string | undefined
    loading: boolean,
    error?: string | null
}

export interface UserCredentials {
    username: string,
    password: string,
}