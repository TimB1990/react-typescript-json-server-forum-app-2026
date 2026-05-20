export interface User {
    id: number,
    username: string,
    avatar: string // url to image
}

export interface UserState {
    users: User[] | [],
    latestUsers: User[] | [],
    currentUser?: User | null,
    totalCount?: number | string | undefined
    loading: boolean,
    error?: string | null
}

export interface UserCredentials {
    username: string,
    password: string,
}