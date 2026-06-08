export type Thread = {
    id: number;
    categoryId?: number;
    title: string;
    slug?: string;
    lastMessageBy: {
        author: string; 
        postedAt: string;
        avatar: string;
    }
    firstMessageBy: {
        author: string; 
        postedAt: string;
        avatar: string;
    }
    createdAt: string;
}

export interface ThreadState {
  threadsByCategory: Record<string, Thread[]>, // e.g., { "react-id": [...], "ts-id": [...] }
  totalCount?: number,
  loading: Record<string, boolean>,
  error?: string | null
}