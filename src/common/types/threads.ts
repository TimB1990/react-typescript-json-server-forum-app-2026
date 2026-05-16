export type Thread = {
    id: number;
    categoryId: number;
    title: string;
    lastMessageBy: {
        author: string, 
        postedAt: string,
        avatar: string
    }
    createdAt: string;
    messages?: number;
}

// export type ThreadsState = {
//     threads: Thread[];
//     loading: boolean;
//     error?: string | null
// }

export interface ThreadState {
  threadsByCategory: Record<string, Thread[]>; // e.g., { "react-id": [...], "ts-id": [...] }
  loading: Record<string, boolean>;
  error?: string | null
}