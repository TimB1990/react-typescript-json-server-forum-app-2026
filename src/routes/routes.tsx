import { redirect } from "react-router-dom";
import { PageWrapper } from "../common/components/layout/PageWrapper";
import { CategoryPage } from "../features/category/CategoryPage";
import { Home } from "../features/home/Home";
import { Login } from "../features/login/Login";
import { Register } from "../features/register/Register";
import { ThreadPage } from "../features/thread/ThreadPage";
import { categoryLoader, type CategoryLoaderResult } from "../loaders/categoryLoader";
import { threadLoader, type ThreadLoaderResult } from "../loaders/threadLoader";
import { GroupPage } from "../features/group/GroupPage";
import { groupLoader, type GroupLoaderResult } from "../loaders/groupLoader";

// Import Profile component and auth loader
import { Profile } from "../features/profile/Profile";
import { requireAuthLoader } from "../loaders/authLoader";

const groupBreadcrumbs = {
    breadcrumb: (data: GroupLoaderResult) => [
        { label: data.group.title, path: `/groups/${data.group.slug}` }
    ]
}

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
                path: "/groups/:slug",
                loader: groupLoader,
                handle: groupBreadcrumbs,
                element: <GroupPage />
            },
            {
                path: "/categories/:slug",
                loader: categoryLoader,
                handle: categoryBreadcrumbs,
                children: [
                    {
                        index: true,
                        loader: async ({ params }: { params: { slug: string } }) =>
                            redirect(`/categories/${params.slug}/page/1`)
                    },
                    {
                        path: "page/:pageNumber",
                        element: <CategoryPage key={window.location.pathname} />,
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
                        loader: async ({ params }: { params: { slug: string } }) =>
                            redirect(`/threads/${params.slug}/page/1`)
                    },
                    {
                        path: "page/:pageNumber",
                        element: <ThreadPage key={window.location.pathname} />,
                        loader: threadLoader,
                    }
                ]
            },
            // --------------------------------------------------------
            // PROTECTED ROUTES
            // --------------------------------------------------------
            {
                path: "/profile",
                loader: requireAuthLoader, // <--- Protects the page before rendering
                element: <Profile />,
                handle: { breadcrumb: "Profile" }
            },
            // --------------------------------------------------------
            // GUEST / AUTH ROUTES
            // --------------------------------------------------------
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            }
        ]
    }
];