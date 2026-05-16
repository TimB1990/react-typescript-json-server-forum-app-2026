import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';

// CRITICAL: This must run once in your application lifecycle 
// before any .calendar() calls are made.
dayjs.extend(calendar);

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    }
])

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
