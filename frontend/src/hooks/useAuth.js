import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — Access authentication state and actions anywhere in the component tree.
 *
 * Returns:
 *  - currentUser: object | null
 *  - loading: boolean  (true while session is being restored on initial mount)
 *  - isAuthenticated: boolean
 *  - login(email, password): Promise<user>
 *  - logout(): Promise<void>
 *  - register(formData): Promise<user>
 *  - updateUser(updatedUser): void
 *
 * Must be used inside <AuthProvider>.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
