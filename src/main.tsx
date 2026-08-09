import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import relativeTime from 'dayjs/plugin/relativeTime'
import { ErrorProvider } from './context/ErrorContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx'; // 1. Import AuthProvider
import { routes } from './routes/routes.tsx';
import { UserRanksProvider } from './context/UserRanksContext.tsx';

// CRITICAL: This must run once in your application lifecycle 
// before any .calendar() calls are made.
dayjs.extend(calendar);
dayjs.extend(relativeTime)

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')!).render(
  <ErrorProvider>
    {/* 2. Wrap RouterProvider with AuthProvider */}
    <UserRanksProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </UserRanksProvider>
  </ErrorProvider>
)