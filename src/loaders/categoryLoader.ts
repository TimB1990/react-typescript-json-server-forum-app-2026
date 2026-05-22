import { type LoaderFunctionArgs } from "react-router-dom";
import { type Category } from "../common/types/categories";
import type { Group } from "../common/types/group";

export type CategoryLoaderResult = {
    category: Category,
    group: Group
}

export async function categoryLoader({params}: LoaderFunctionArgs): Promise<CategoryLoaderResult> {
    const {slug} = params;

    // 1. fetch category
    const catResponse = await fetch(`http://localhost:5001/categories?slug=${slug}`)
    if (!catResponse.ok) {
        throw new Response("Category Not Found", { status: 404 });
    }

    const catData = await catResponse.json();
    const category: Category = catData.data[0];

    if (!category) {
        throw new Response("Category Not Found", { status: 404 });
    }

    // 2. fetch the group using the category's groupId
    const groupResponse = await fetch(`http://localhost:5001/groups/${category.groupId}`)
    if (!groupResponse.ok) {
        throw new Response("Group Not Found", { status: 404 });
    }
    const group: Group = await groupResponse.json();
    return { category, group };
}