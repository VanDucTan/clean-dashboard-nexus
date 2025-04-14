import React, { createContext, useContext, useState } from 'react';

interface AccountContextType {
  totalAccounts: number;
  setTotalAccounts: (count: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [totalAccounts, setTotalAccounts] = useState(0);

  return (
    <AccountContext.Provider value={{ totalAccounts, setTotalAccounts }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
} 