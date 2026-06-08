import type { Category } from "../common/types/categories"
import type { ResponseResult } from "../common/types/general"
import { type LoaderFunctionArgs } from "react-router-dom"
import { type Group } from "../common/types/group"


export type GroupLoaderResult = {
    group: Group
}

export const groupLoader = async ({ params }: LoaderFunctionArgs): Promise<GroupLoaderResult> => {
    const {slug} = params;

    const groupResponse = await fetch(`http://localhost:5001/groups?slug=${slug}`)
    if(!groupResponse.ok) { throw new Response("Group Not Found", { status: 404 }); }
    const groups = await groupResponse.json();
    const group = groups.data[0]

    if (!group) {
        throw new Response("Group Not Found", { status: 404 });
    }

    return { group };

}