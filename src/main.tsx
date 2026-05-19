import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import { ErrorProvider } from './context/ErrorContext.tsx';
import { Home } from './features/home/Home.tsx';
import { PageWrapper } from './common/components/layout/PageWrapper.tsx';
import { Login } from './features/login/Login.tsx';
import { Register } from './features/register/Register.tsx';

// CRITICAL: This must run once in your application lifecycle 
// before any .calendar() calls are made.
dayjs.extend(calendar);

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageWrapper />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/login",
                element: <>
                    <Home/>
                    <Login />
                </>
            },
            {
                path: "/register",
                element: <>
                    <Home/>
                    <Register />
                </>
            }
        ]
    }
])

createRoot(document.getElementById('root')!).render(
    <ErrorProvider>
        <RouterProvider router={router} />
    </ErrorProvider>
)
