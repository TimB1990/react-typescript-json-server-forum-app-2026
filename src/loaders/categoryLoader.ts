import { type LoaderFunctionArgs } from "react-router-dom";
import { type Category } from "../common/types/categories";
import type { Group } from "../common/types/group";
import type { Thread } from "../common/types/threads";
import type { ResponseResult } from "../common/types/general";
import { ThreadStore } from "../store";
import type { AppConfig } from "../common/types/appConfig";

export type CategoryLoaderResult = {
    category: Category
    group: Group
    threads: ResponseResult<Thread>
    pagination: {
        current: number
        total: number
        limit: number
    }
}

export async function categoryLoader({ params }: LoaderFunctionArgs): Promise<CategoryLoaderResult> {

    const { slug } = params

    const configResponse = await fetch(`/api/config`);
    const config: AppConfig = await configResponse.json();
    const limit = config.threads || config.global

    const currentPage = params.pageNumber ? parseInt(params.pageNumber, 10) : 1;
    const validatedPage = isNaN(currentPage) ? 1 : currentPage;

    const catResponse = await fetch(`/api/categories?slug=${slug}`)
    if (!catResponse.ok) { throw new Response("Category Not Found", { status: 404 }); }

    const categories = await catResponse.json();
    const category = categories.data[0]

    if (!category) {
        throw new Response("Category Not Found", { status: 404 });
    }

    // 2. fetch the group using the category's groupId
    const groupResponse = await fetch(`/api/groups/${category.groupId}`)
    if (!groupResponse.ok) {
        throw new Response("Group Not Found", { status: 404 });
    }
    const group: Group = await groupResponse.json();

    // 3 Use the limit in the fetch call
    const threadResponse = await fetch(`/api/threads?categoryId=${category.id}&page=${validatedPage}&limit=${limit}`)
    const threadData: ResponseResult<Thread> = await threadResponse.json();

    // TRIGGER THE STORE FETCH HERE TOO (Don't await it, let it run in background)
    // This starts the "fat" object processing the moment the link is clicked
    ThreadStore.fetch(category.id, limit, validatedPage);

    return {
        category,
        group,
        threads: threadData,
        pagination: {
            current: validatedPage,
            total: threadData.totalPages,
            limit: limit // Pass this back so the UI knows the current limit
        }
    };
}