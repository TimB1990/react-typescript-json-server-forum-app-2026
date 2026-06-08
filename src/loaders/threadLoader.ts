import type { LoaderFunctionArgs } from "react-router-dom"
import type { Category } from "../common/types/categories"
import type { ResponseResult } from "../common/types/general"
import type { Message } from "../common/types/message"
import type { Thread } from "../common/types/threads"
import { MessageStore } from "../store"
import type { AppConfig } from "../common/types/appConfig"

export type ThreadLoaderResult = {
    category: Category
    thread: Thread
    messages: ResponseResult<Message>
    pagination: {
        current: number
        total: number
        limit: number
    }
}

export async function threadLoader({params}: LoaderFunctionArgs): Promise<ThreadLoaderResult> {

    const { slug } = params;

    const configResponse = await fetch(`/api/config`);
    const config: AppConfig = await configResponse.json();
    const limit = config.messages || config.global

    const currentPage = params.pageNumber ? parseInt(params.pageNumber, 10) : 1;
    const validatedPage = isNaN(currentPage) ? 1 : currentPage;

    const threadResponse = await fetch(`/api/threads?slug=${slug}`)
    if (!threadResponse.ok) { throw new Response("Thread Not Found", { status: 404 });}

    const threads = await threadResponse.json();
    const thread = threads.data[0]
 
    if (!thread) {
        throw new Response("Thread Not Found", { status: 404 });
    }

    const categoryResponse = await fetch(`/api/categories/${thread.categoryId}`)

    if(!categoryResponse.ok){
         throw new Response("Category Not Found", { status: 404 });
    }

    const category: Category = await categoryResponse.json();

    const messageResponse = await fetch(`/api/messages?threadId=${thread.id}&page=${validatedPage}&limit=${limit}`)
    const messageData: ResponseResult<Message> = await messageResponse.json();

    // TRIGGER THE STORE FETCH HERE TOO (Don't await it, let it run in background)
    // This starts the "fat" object processing the moment the link is clicked
    MessageStore.fetch(thread.id, limit, validatedPage);

    return {
        category,
        thread,
        messages: messageData,
        pagination: {
            current: validatedPage,
            total: messageData.totalPages,
            limit // Pass this back so the UI knows the current limit
        }
    }
}