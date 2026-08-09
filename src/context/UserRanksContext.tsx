import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserRank } from '../common/types/users';

interface UserRanksContextType {
  ranks: UserRank[];
  loading: boolean;
}

const UserRanksContext = createContext<UserRanksContextType>({ ranks: [], loading: true });

export const UserRanksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ranks, setRanks] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const response = await fetch('http://localhost:5001/userRanks');
        const data = await response.json();
        // Adjust depending on whether data is response directly or wrapped in { data }
        setRanks(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Failed to fetch ranks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanks();
  }, []);

  return (
    <UserRanksContext.Provider value={{ ranks, loading }}>
      {children}
    </UserRanksContext.Provider>
  );
};

export const useUserRanks = () => useContext(UserRanksContext);