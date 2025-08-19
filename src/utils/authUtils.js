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
 * @returns {string} - Provider ID (google.com, facebook.com, apple.com, anonymous, etc.)
 */
export const getPrimaryProvider = (firebaseUser) => {
    if (!firebaseUser) {
        return 'unknown';
    }

    // Check if user is anonymous
    if (firebaseUser.isAnonymous) {
        return 'anonymous';
    }

    if (!firebaseUser.providerData || firebaseUser.providerData.length === 0) {
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
 * Check if user is anonymous
 * @param {Object} firebaseUser - Firebase user object
 * @returns {boolean} - True if user is anonymous
 */
export const isAnonymousUser = (firebaseUser) => {
    return firebaseUser?.isAnonymous === true;
};

/**
 * Get display name with fallback
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - Display name or email or 'User'
 */
export const getDisplayName = (firebaseUser) => {
    if (!firebaseUser) return 'User';

    // For anonymous users, return a specific label
    if (firebaseUser.isAnonymous) {
        return 'Guest User';
    }

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

/**
 * Check if anonymous user can be upgraded to permanent account
 * @param {Object} firebaseUser - Firebase user object
 * @returns {boolean} - True if user is anonymous and can be upgraded
 */
export const canUpgradeAnonymousUser = (firebaseUser) => {
    return firebaseUser?.isAnonymous === true;
};

/**
 * Get user type description
 * @param {Object} firebaseUser - Firebase user object
 * @returns {string} - User type description
 */
export const getUserType = (firebaseUser) => {
    if (!firebaseUser) return 'No user';

    if (firebaseUser.isAnonymous) {
        return 'Anonymous user';
    }

    const provider = getPrimaryProvider(firebaseUser);
    switch (provider) {
        case 'google.com':
            return 'Google account';
        case 'facebook.com':
            return 'Facebook account';
        case 'apple.com':
            return 'Apple account';
        case 'email':
            return 'Email account';
        default:
            return 'Registered user';
    }
};
