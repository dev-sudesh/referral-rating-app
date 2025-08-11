import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

class FirebaseAuthService {
    constructor() {
        // Delay initialization to ensure Firebase is ready
        setTimeout(() => {
            this.initializeGoogleSignIn();
        }, 100);
    }

    // Initialize Google Sign-In
    initializeGoogleSignIn() {
        GoogleSignin.configure({
            webClientId: '117401511956-XXXXXXXXXX.apps.googleusercontent.com', // REPLACE: Get from Firebase Console > Project Settings > General > Web app
            offlineAccess: true,
            hostedDomain: '',
            forceCodeForRefreshToken: true,
        });
    }

    // Google Sign-In
    async signInWithGoogle() {
        try {
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(googleCredential);

            return {
                success: true,
                user: userCredential.user,
                provider: 'google'
            };
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            return {
                success: false,
                error: this.handleAuthError(error),
                provider: 'google'
            };
        }
    }

    // Facebook Sign-In
    async signInWithFacebook() {
        try {
            // Attempt login with permissions
            const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

            if (result.isCancelled) {
                return {
                    success: false,
                    error: 'User cancelled Facebook login',
                    provider: 'facebook'
                };
            }

            // Once signed in, get the users AccesToken
            const data = await AccessToken.getCurrentAccessToken();

            if (!data) {
                return {
                    success: false,
                    error: 'Something went wrong obtaining access token',
                    provider: 'facebook'
                };
            }

            // Create a Facebook credential with the AccesToken
            const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

            // Sign-in the user with the credential
            const userCredential = await auth().signInWithCredential(facebookCredential);

            return {
                success: true,
                user: userCredential.user,
                provider: 'facebook'
            };
        } catch (error) {
            console.error('Facebook Sign-In Error:', error);
            return {
                success: false,
                error: this.handleAuthError(error),
                provider: 'facebook'
            };
        }
    }

    // Apple Sign-In (iOS only)
    async signInWithApple() {
        try {
            if (Platform.OS !== 'ios') {
                return {
                    success: false,
                    error: 'Apple Sign-In is only available on iOS',
                    provider: 'apple'
                };
            }

            // Start the sign-in request
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            // Ensure Apple returned a user identityToken
            if (!appleAuthRequestResponse.identityToken) {
                return {
                    success: false,
                    error: 'Apple Sign-In failed - no identify token returned',
                    provider: 'apple'
                };
            }

            // Create a Firebase credential from the response
            const { identityToken, nonce } = appleAuthRequestResponse;
            const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

            // Sign the user in with the credential
            const userCredential = await auth().signInWithCredential(appleCredential);

            return {
                success: true,
                user: userCredential.user,
                provider: 'apple'
            };
        } catch (error) {
            console.error('Apple Sign-In Error:', error);
            return {
                success: false,
                error: this.handleAuthError(error),
                provider: 'apple'
            };
        }
    }

    // Twitter Sign-In - Not implemented (requires complex OAuth flow)
    async signInWithTwitter() {
        return {
            success: false,
            error: 'Twitter sign-in is not available in this version',
            provider: 'twitter'
        };
    }

    // Sign out
    async signOut() {
        try {
            // Sign out from Google
            if (await GoogleSignin.isSignedIn()) {
                await GoogleSignin.revokeAccess();
                await GoogleSignin.signOut();
            }

            // Sign out from Facebook
            LoginManager.logOut();

            // Sign out from Firebase
            await auth().signOut();

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
        return auth().currentUser;
    }

    // Auth state listener
    onAuthStateChanged(callback) {
        return auth().onAuthStateChanged(callback);
    }

    // Handle authentication errors
    handleAuthError(error) {
        switch (error.code) {
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with the same email address but different sign-in credentials.';
            case 'auth/invalid-credential':
                return 'The credential is invalid or has expired.';
            case 'auth/operation-not-allowed':
                return 'This sign-in method is not enabled.';
            case 'auth/user-disabled':
                return 'Your account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this credential.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/network-request-failed':
                return 'Network error occurred. Please check your connection.';
            default:
                return error.message || 'An unexpected error occurred. Please try again.';
        }
    }
}

export default new FirebaseAuthService();
