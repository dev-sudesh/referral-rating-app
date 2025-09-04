import {
    getAuth,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
} from '@react-native-firebase/auth';

class FirebaseAuthService {
    constructor() {
    }

    // Anonymous Sign-In
    async signInAnonymously() {
        try {
            const authInstance = getAuth();
            const userCredential = await signInAnonymously(authInstance);

            return {
                success: true,
                user: userCredential.user,
                provider: 'anonymous'
            };
        } catch (error) {
            console.error('Anonymous Sign-In Error:', error);
            return {
                success: false,
                error: this.handleAuthError(error),
                provider: 'anonymous'
            };
        }
    }

    // Sign out
    async signOut() {
        try {
            // Sign out from Firebase
            const authInstance = getAuth();
            await signOut(authInstance);

            return { success: true };
        } catch (error) {
            console.error('Sign-Out Error:', error);
            return {
                success: false,
                error: this.handleAuthError(error)
            };
        }
    }

    // Get current user
    getCurrentUser() {
        const authInstance = getAuth();
        return authInstance.currentUser;
    }

    // Auth state listener
    onAuthStateChanged(callback) {
        const authInstance = getAuth();
        return onAuthStateChanged(authInstance, callback);
    }

    // Handle authentication errors
    handleAuthError(error) {
        switch (error.code) {
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with the same email address but different sign-in credentials.';
            case 'auth/invalid-credential':
                return 'The credential is invalid or has expired.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled. Please check your Firebase console settings.';
            case 'auth/user-disabled':
                return 'Your account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this credential.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/network-request-failed':
                return 'Network error occurred. Please check your connection.';
            case 'auth/too-many-requests':
                return 'Too many unsuccessful attempts. Please try again later.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    }
}

export default new FirebaseAuthService();
