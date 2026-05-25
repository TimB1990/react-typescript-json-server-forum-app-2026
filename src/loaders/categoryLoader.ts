import { type LoaderFunctionArgs } from "react-router-dom";
import { type Category } from "../common/types/categories";
import type { Group } from "../common/types/group";
import type { Thread } from "../common/types/threads";
import type { ResponseResult } from "../common/types/general";

export type CategoryLoaderResult = {
    category: Category
    group: Group
    threads: ResponseResult<Thread>
    pagination: {
        current: number
        total: number
    }
}

export async function categoryLoader({ params }: LoaderFunctionArgs): Promise<CategoryLoaderResult> {

    const { slug } = params

    // Default to page 1 if not provided
    const pageNumber = params.pageNumber ?? "1";
    const currentPage = params.pageNumber ? parseInt(params.pageNumber, 10) : 1;
    const validatedPage = isNaN(currentPage) ? 1 : currentPage;

    const limit = 25;

    // 1. fetch category
    const catResponse = await fetch(`http://localhost:5001/categories?slug=${slug}`)
    if (!catResponse.ok) { throw new Response("Category Not Found", { status: 404 }); }

    const categories = await catResponse.json();
    const category = categories.data[0]

    if (!category) {
        throw new Response("Category Not Found", { status: 404 });
    }

    // 2. fetch the group using the category's groupId
    const groupResponse = await fetch(`http://localhost:5001/groups/${category.groupId}`)
    if (!groupResponse.ok) {
        throw new Response("Group Not Found", { status: 404 });
    }
    const group: Group = await groupResponse.json();

    // 3
    const threadResponse = await fetch(`http://localhost:5001/threads?categoryId=${category.id}&page=${validatedPage}&limit=${limit}`)
    const threadData: ResponseResult<Thread> = await threadResponse.json();

    if (parseInt(pageNumber || "") > threadData.totalPages) {
        throw new Response("Not Found", { status: 404 });
    }

    return {
        category,
        group,
        threads: threadData,
        pagination: {
            current: validatedPage,
            total: threadData.totalPages
        }
    };
}