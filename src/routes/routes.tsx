import { redirect } from "react-router-dom";
import { PageWrapper } from "../common/components/layout/PageWrapper";
import { CategoryPage } from "../features/category/CategoryPage";
import { Home } from "../features/home/Home";
import { Login } from "../features/login/Login";
import { Register } from "../features/register/Register";
import { ThreadPage } from "../features/thread/ThreadPage";
import { categoryLoader, type CategoryLoaderResult } from "../loaders/categoryLoader";
import { threadLoader, type ThreadLoaderResult } from "../loaders/threadLoader";

const categoryBreadcrumbs = {
    breadcrumb: (data: CategoryLoaderResult) => [
        { label: data.group.title, path: `/groups/${data.group.slug}` },
        { label: data.category.name, path: `/categories/${data.category.slug}` }]
}

const threadBreadcrumbs = {
    breadcrumb: (data: ThreadLoaderResult) => [
        { label: data.category.name, path: `/categories/${data.category.slug}` },
        { label: data.thread.title, path: `/threads/${data.thread.slug}` }
    ]
}

export const routes = [
    {
        path: "/",
        element: <PageWrapper />,
        children: [
            {
                path: "/",
                element: <Home />,
                handle: { breadcrumb: "Forum" }
            },
            {
                path: "/categories/:slug",
                loader: categoryLoader,
                handle: categoryBreadcrumbs,
                children: [
                    {
                        index: true,
                        loader: async ({ params } : {params: {slug: string}}) => redirect(`/categories/${params.slug}/page/1`)
                    },
                    {
                        path: "page/:pageNumber",
                        element: <CategoryPage key={window.location.pathname} />, // Keep element here
                        loader: categoryLoader,
                    }

                ]
            },
            {
                path: "/threads/:slug",
                loader: threadLoader,
                handle: threadBreadcrumbs,
                children: [
                    {
                        index: true,
                        loader: async ({params} : {params: {slug: string}}) => redirect(`/threads/${params.slug}/page/1`)
                    },
                    {
                        path: "page/:pageNumber",
                        element: <ThreadPage key={window.location.pathname} />, // Keep element here
                        loader: threadLoader,
                    }
                ]
            },
            {
                path: "/login",
                element: <>
                    <Home />
                    <Login />
                </>
            },
            {
                path: "/register",
                element: <>
                    <Home />
                    <Register />
                </>
            }
        ]
    }
]