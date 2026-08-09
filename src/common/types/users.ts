export interface User {
    id: number | string,
    username: string,
    email? : string,
    messageCount?: number,
    avatar: string // url to image
    createdAt: string
    [key: string]: any
}

export interface UserRank {
    name: string
      faIcon: string
      faIconOptions: {
        size?: 'sm' | 'lg' | 'xl',
        color?: string
      },
      messageThreshold: number
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