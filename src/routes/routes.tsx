import { PageWrapper } from "../common/components/layout/PageWrapper";
import { CategoryPage } from "../features/category/CategoryPage";
import { Home } from "../features/home/Home";
import { Login } from "../features/login/Login";
import { Register } from "../features/register/Register";
import { ThreadPage } from "../features/thread/ThreadPage";
import { categoryLoader, type CategoryLoaderResult } from "../loaders/categoryLoader";
import { threadLoader, type ThreadLoaderResult } from "../loaders/threadLoader";

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
                handle: {
                    breadcrumb: (data: CategoryLoaderResult) => [
                        { label: data.group.title, path: `/groups/${data.group.slug}` },
                        { label: data.category.name, path: `/categories/${data.category.slug}`}
                    ]
                }
            },
            {
                path: "/threads/:slug",
                element: <ThreadPage />,
                loader: threadLoader,
                handle: {
                    breadcrumb: (data: ThreadLoaderResult) => [
                        { label: data.group.title, path: `/groups/${data.group.id}` },
                        { label: data.category.name, path: `/categories/${data.category.slug}` },
                        { label: data.thread.title, path: `/threads/${data.thread.slug}` }
                    ]
                }
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