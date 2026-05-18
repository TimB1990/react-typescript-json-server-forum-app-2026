import { createContext, useState, useContext, type ReactNode } from 'react';

// define interface for context value
interface ErrorContextType {
    error: string | null | undefined;
    setError: (message: string | null | undefined ) => void;
    clearError: () => void;
}

interface ErrorProviderProps {
    children: ReactNode;
}

// initialize context with null
const ErrorContext = createContext<ErrorContextType | null>(null)

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
    // FIX 1: Match the useState types to the interface exactly
    const [error, setError] = useState<ErrorContextType['error']>(null);
    
    const clearError = () => setError(null);

    return (
        // FIX 2: Explicitly cast the value or ensure the types align
        // The setError above now matches the ErrorContextType signature
        <ErrorContext.Provider value={{ error, setError, clearError }}>
            {children}
        </ErrorContext.Provider>
    );
};

export const useError = (): ErrorContextType => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
};