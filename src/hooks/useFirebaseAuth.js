import { useState, useEffect } from 'react';
import FirebaseAuthService from '../services/firebase/FirebaseAuthService';

/**
 * Custom hook for Firebase authentication state management
 * @returns {Object} - Authentication state and user info
 */
export const useFirebaseAuth = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = FirebaseAuthService.onAuthStateChanged((authUser) => {
            setUser(authUser);
            setIsAuthenticated(!!authUser);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    const signOut = async () => {
        setIsLoading(true);
        try {
            const result = await FirebaseAuthService.signOut();
            if (result.success) {
                setUser(null);
                setIsAuthenticated(false);
            }
            return result;
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const signInAnonymously = async () => {
        setIsLoading(true);
        try {
            const result = await FirebaseAuthService.signInAnonymously();
            if (result.success) {
                // User state will be updated by the auth state listener
                setIsAuthenticated(true);
            }
            return result;
        } catch (error) {
            console.error('Anonymous sign in error:', error);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        isAuthenticated,
        signOut,
        signInAnonymously,
    };
};
