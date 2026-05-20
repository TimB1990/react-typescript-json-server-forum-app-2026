import { PageWrapper } from "../common/components/layout/PageWrapper";
import type { Thread } from "../common/types/threads";
import { Home } from "../features/home/Home";
import { Login } from "../features/login/Login";
import { Register } from "../features/register/Register";
import { ThreadDetail } from "../features/thread/ThreadDetail";
import { threadLoader } from "../loaders/threadLoader";

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
                path: "/thread/:threadSlug",
                element: <ThreadDetail />,
                loader: threadLoader,
                handle: {
                    breadcrumb: (data: Thread) => data?.title || "Loading Thread..."
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