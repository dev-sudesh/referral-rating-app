/**
 * Authentication utility functions
 */

/**
 * Extract user information from Firebase user object
 * @param {Object} firebaseUser - Firebase user object
 * @returns {Object} - Formatted user information
 */
export const formatUserData = (firebaseUser) => {
    if (!firebaseUser) return null;

    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
        emailVerified: firebaseUser.emailVerified,
        isAnonymous: firebaseUser.isAnonymous,
        providerData: firebaseUser.providerData.map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            displayName: provider.displayName,
            email: provider.email,
            photoURL: provider.photoURL
        })),
        metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime
        }
    };
};

/**
 * Get the primary sign-in provider for a user
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - Provider ID (google.com, facebook.com, apple.com, etc.)
 */
export const getPrimaryProvider = (firebaseUser) => {
    if (!firebaseUser || !firebaseUser.providerData || firebaseUser.providerData.length === 0) {
        return 'email'; // Default for email/password users
    }

    return firebaseUser.providerData[0].providerId;
};

/**
 * Check if user signed in with a specific provider
 * @param {Object} firebaseUser - Firebase user object
 * @param {string} providerId - Provider ID to check
 * @returns {boolean} - True if user used this provider
 */
export const isSignedInWithProvider = (firebaseUser, providerId) => {
    if (!firebaseUser || !firebaseUser.providerData) return false;

    return firebaseUser.providerData.some(provider => provider.providerId === providerId);
};

/**
 * Get display name with fallback
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - Display name or email or 'User'
 */
export const getDisplayName = (firebaseUser) => {
    if (!firebaseUser) return 'User';

    return firebaseUser.displayName ||
        firebaseUser.email ||
        'User';
};

/**
 * Get profile photo with fallback
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string|null} - Photo URL or null
 */
export const getProfilePhoto = (firebaseUser) => {
    if (!firebaseUser) return null;

    return firebaseUser.photoURL || null;
};

/**
 * Check if user's email is verified
 * @param {Object} firebaseUser - Firebase user object
 * @returns {boolean} - True if email is verified
 */
export const isEmailVerified = (firebaseUser) => {
    return firebaseUser?.emailVerified === true;
};

/**
 * Get user's creation date in readable format
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - Formatted creation date
 */
export const getAccountCreationDate = (firebaseUser) => {
    if (!firebaseUser?.metadata?.creationTime) return 'Unknown';

    const date = new Date(firebaseUser.metadata.creationTime);
    return date.toLocaleDateString();
};

/**
 * Get user's last sign-in date in readable format
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - Formatted last sign-in date
 */
export const getLastSignInDate = (firebaseUser) => {
    if (!firebaseUser?.metadata?.lastSignInTime) return 'Unknown';

    const date = new Date(firebaseUser.metadata.lastSignInTime);
    return date.toLocaleDateString();
};
