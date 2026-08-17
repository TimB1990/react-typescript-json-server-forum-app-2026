// ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop(offset?: number) {
    const { pathname } = useLocation();

    useEffect(() => {
        // Jump instantly to the top on page change
        window.scrollTo(offset ?? 0, 0);
    }, [pathname]);

    return null;
}