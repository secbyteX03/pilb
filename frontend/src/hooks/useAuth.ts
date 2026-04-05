import { create } from 'zustand';

interface User {
  publicKey: string;
  address: string;
}

// Load persisted user from localStorage on init
const loadPersistedUser = (): User | null => {
  try {
    const storedPublicKey = localStorage.getItem('user_publicKey');
    if (storedPublicKey) {
      return {
        publicKey: storedPublicKey,
        address: storedPublicKey,
      };
    }
  } catch {}
  return null;
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const persistedUser = loadPersistedUser();
  return {
    isAuthenticated: !!persistedUser,
    user: persistedUser,
    setUser: (user) => {
      if (user) {
        localStorage.setItem('user_publicKey', user.publicKey);
      } else {
        localStorage.removeItem('user_publicKey');
      }
      set({ user, isAuthenticated: !!user });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_publicKey');
      set({ user: null, isAuthenticated: false });
    },
  };
});