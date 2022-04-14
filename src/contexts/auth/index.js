import React, { createContext } from 'react';

export const AuthContext = createContext({});

export function AuthProvider({ children, profile }) {
  return (
    <AuthContext.Provider value={{ profile }}>
      {children}
    </AuthContext.Provider>
  );
}
