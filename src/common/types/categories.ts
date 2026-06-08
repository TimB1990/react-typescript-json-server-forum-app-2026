export type Category = {
    id: number;
    groupId: number;
    name: string;
    slug: string,
    description: string;
    image: string;
    messages?: number;
}

export type CategoriesState = {
    categoriesByGroup: Record<string, Category[]>;
    loading: Record<string, boolean>;
    error?: string | null
}