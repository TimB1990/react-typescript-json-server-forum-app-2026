// src/context/index.tsx
import React, { type ReactNode } from 'react';
import { ErrorProvider } from './ErrorContext';

// Example other provider
// import { AuthProvider } from './AuthContext'; 

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorProvider>
      {children}
    </ErrorProvider>
  );
};