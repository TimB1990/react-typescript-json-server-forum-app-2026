export type Category = {
    id: number;
    name: string;
    description: string;
    image: string;
    messages?: number;
}

export type CategoriesState = {
    categoriesByGroup: Record<string, Category[]>;
    loading: Record<string, boolean>;
    error?: string | null
}