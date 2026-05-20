import { type LoaderFunctionArgs } from "react-router-dom";
import { type Thread } from "../common/types/threads";

export async function threadLoader({ params }: LoaderFunctionArgs): Promise<Thread> {
    const { slug } = params;

    const response = await fetch(`http://localhost:5001/threads/${slug}`)
    if (!response.ok) {
        throw new Response("Thread Not Found", { status: 404 });
    }

    const thread: Thread = await response.json();
    return thread;
}