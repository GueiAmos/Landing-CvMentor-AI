import { UserSession } from '../types';

const STORAGE_KEY = 'cvmentor_session';

export const saveSession = (session: Partial<UserSession>): void => {
  try {
    const currentSession = getSession();
    const updatedSession = { ...currentSession, ...session };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

export const getSession = (): UserSession => {
  try {
    const session = localStorage.getItem(STORAGE_KEY);
    return session ? JSON.parse(session) : {};
  } catch (error) {
    console.error('Error loading session:', error);
    return {};
  }
};

export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};