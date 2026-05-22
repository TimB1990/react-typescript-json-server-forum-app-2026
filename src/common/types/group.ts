export type Group = {
    id: number;
    title: string;
    slug: string;
    description: string;
}

export type GroupState = {
    groups: Group[];
    loading: boolean;
    error?: string | null;
}

export type GroupItemProps = {
    id: number;
    title: string;
    description: string;
    children: React.ReactNode;
}