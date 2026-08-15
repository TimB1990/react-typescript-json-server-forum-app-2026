import React from 'react'
import { useError } from '../../../context/ErrorContext'

export const ErrorBanner: React.FC = () => {
    const { error, clearError } = useError();

    if (!error) return null;

    return (
        <div className="error-banner">
            <span>Error: {error}</span>
            <button onClick={clearError}>X</button>
        </div>
    );
}
