import { type LoaderFunctionArgs } from "react-router-dom";
import { type Thread } from "../common/types/threads";
import type { Category } from "../common/types/categories";
import type { Group } from "../common/types/group";

export type ThreadLoaderResult = {
    thread: Thread;
    category: Category;
    group: Group
}

export async function threadLoader({ params }: LoaderFunctionArgs): Promise<ThreadLoaderResult> {
    
    const { slug } = params;

    // 1. Fetch the thread
    const threadResponse = await fetch(`http://localhost:5001/threads?slug=${slug}`);
    if (!threadResponse.ok) {
        throw new Response("Thread Not Found", { status: 404 });
    }
    const threadData = await threadResponse.json();
    const thread: Thread = threadData.data[0];

    if (!thread) {
        throw new Response("Thread Not Found", { status: 404 });
    }

    // 2. Fetch the parent category
    const catResponse = await fetch(`http://localhost:5001/categories/${thread.categoryId}`);
    if (!catResponse.ok) {
        throw new Response("Parent Category Not Found", { status: 404 });
    }
    
    const category: Category = await catResponse.json();

    // 3. Fetch the grandparent group
    const groupResponse = await fetch(`http://localhost:5001/groups/${category.groupId}`);
    if (!groupResponse.ok) {
        throw new Response("Parent Group Not Found", { status: 404 });
    }
    const group: Group = await groupResponse.json();

    return { thread, category, group };
}