import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import type { User, Language } from '../types';

function hashPasscode(passcode: string): string {
  let hash = 0;
  for (let i = 0; i < passcode.length; i++) {
    hash = (hash << 5) - hash + passcode.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  loadSession: () => Promise<void>;
  logout: () => Promise<void>;
  register: (data: {
    name: string; phone: string;
    role: 'collector' | 'farmer' | 'admin';
    passcode: string; collectorId?: string; farmerId?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithPasscode: (phone: string, passcode: string) => Promise<{ success: boolean; error?: string }>;
  loginWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  changePasscode: (oldPasscode: string, newPasscode: string) => Promise<{ success: boolean; error?: string }>;
}

const SESSION_KEY = 'milkx_session';
const USERS_KEY = 'milkx_users';

async function getStoredUsers(): Promise<User[]> {
  try {
    const raw = await SecureStore.getItemAsync(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveStoredUsers(users: User[]): Promise<void> {
  await SecureStore.setItemAsync(USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  language: 'en',

  setLanguage: async (language) => {
    set({ language });
    // Persist to stored session so it survives app restarts
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const user = JSON.parse(raw);
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ ...user, language }));
        set({ user: { ...get().user!, language } });
      }
    } catch {}
  },

  loadSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) set({ user: JSON.parse(raw), isAuthenticated: true });
    } catch {}
    finally { set({ isLoading: false }); }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({ user: null, isAuthenticated: false });
  },

  register: async ({ name, phone, role, passcode, collectorId, farmerId }) => {
    try {
      const users = await getStoredUsers();
      if (users.find(u => u.phone === phone))
        return { success: false, error: 'This mobile number is already registered' };

      const now = new Date().toISOString();
      const collCount = users.filter(u => u.role === 'collector').length + 1;
      const farCount  = users.filter(u => u.role === 'farmer').length + 1;

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        role,
        collectorId: collectorId ?? (role === 'collector' ? `COL${String(collCount).padStart(3,'0')}` : undefined),
        farmerId:    farmerId    ?? (role === 'farmer'    ? `FAR${String(farCount).padStart(3,'0')}`  : undefined),
        passcode: hashPasscode(passcode),
        language: get().language,
        createdAt: now, updatedAt: now,
      };

      await saveStoredUsers([...users, newUser]);
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newUser));
      set({ user: newUser, isAuthenticated: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Registration failed' };
    }
  },

  loginWithPasscode: async (phone, passcode) => {
    try {
      const users = await getStoredUsers();
      const user = users.find(u => u.phone === phone);
      if (!user) return { success: false, error: 'Mobile number not found. Please register first.' };
      if (user.passcode !== hashPasscode(passcode)) return { success: false, error: 'Incorrect passcode. Try again.' };
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Login failed' };
    }
  },

  loginWithBiometric: async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) return { success: false, error: 'Biometric not supported on this device' };
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return { success: false, error: 'No biometric enrolled. Set up fingerprint or Face ID first.' };
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to MilkX',
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });
      if (!result.success) return { success: false, error: 'Biometric authentication failed' };
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (!raw) return { success: false, error: 'No saved session. Please login with passcode first.' };
      const user: User = JSON.parse(raw);
      set({ user, isAuthenticated: true });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Biometric login failed' };
    }
  },

  changePasscode: async (oldPasscode, newPasscode) => {
    try {
      const { user } = get();
      if (!user) return { success: false, error: 'Not logged in' };
      if (user.passcode !== hashPasscode(oldPasscode)) return { success: false, error: 'Current passcode is incorrect' };
      const users = await getStoredUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx === -1) return { success: false, error: 'User not found' };
      users[idx] = { ...users[idx], passcode: hashPasscode(newPasscode), updatedAt: new Date().toISOString() };
      await saveStoredUsers(users);
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(users[idx]));
      set({ user: users[idx] });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Failed to change passcode' };
    }
  },
}));
