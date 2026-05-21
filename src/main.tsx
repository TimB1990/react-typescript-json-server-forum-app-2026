import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import relativeTime from 'dayjs/plugin/relativeTime'
import { ErrorProvider } from './context/ErrorContext.tsx';
import { routes } from './routes/routes.tsx';

// CRITICAL: This must run once in your application lifecycle 
// before any .calendar() calls are made.
dayjs.extend(calendar);
dayjs.extend(relativeTime)

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
    <ErrorProvider>
        <RouterProvider router={router} />
    </ErrorProvider>
)
