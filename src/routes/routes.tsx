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
        { label: data.group.title, path: `/groups/${data.group.id}` },
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
                element: <CategoryPage />,
                loader: categoryLoader,
                handle: categoryBreadcrumbs,
                children: [
                    {
                        index: true,
                        loader: () => redirect("page/1")
                    }, 
                    {
                        path: "page/:pageNumber",
                        loader: categoryLoader
                    }
                ]
            },
            {
                path: "/categories/:slug/page/:pageNumber",
                element: <CategoryPage />,
                loader: categoryLoader,
                handle: categoryBreadcrumbs
            },
            {
                path: "/threads/:slug",
                element: <ThreadPage />,
                loader: threadLoader,
                handle: threadBreadcrumbs
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