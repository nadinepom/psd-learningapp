import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

// Passwort hier ändern – wird einmalig pro Gerät/Browser abgefragt
const APP_PASSWORD = 'psd-learning';
const STORAGE_KEY = 'psd_authenticated';

type AuthContextValue = {
  isAuthenticated: boolean;
  isChecking: boolean;
  unlock: (password: string) => Promise<boolean>;
  lock: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'true') setIsAuthenticated(true);
      setIsChecking(false);
    });
  }, []);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (password !== APP_PASSWORD) return false;
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setIsAuthenticated(true);
    return true;
  }, []);

  const lock = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isChecking, unlock, lock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
