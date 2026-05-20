export type Thread = {
    id: number;
    categoryId?: number;
    title: string;
    lastMessageBy: {
        author: string; 
        postedAt: string;
        avatar: string;
    }
    createdAt: string;
    messages?: number;
    iconStats?: boolean;
}

export interface ThreadState {
  threadsByCategory: Record<string, Thread[]>, // e.g., { "react-id": [...], "ts-id": [...] }
  totalCount?: number,
  loading: Record<string, boolean>,
  error?: string | null
}