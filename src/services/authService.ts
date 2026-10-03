import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { User, UserRole } from '../types/safeband';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const getAuthenticatedFirebaseUser = (): FirebaseUser | null => {
  return auth?.currentUser || null;
};

export const isFirebaseUserAuthenticated = (): boolean => {
  return Boolean(auth?.currentUser);
};

export const subscribeToAuthChanges = (
  onUserChanged: (user: User | null) => void
): (() => void) => {
  if (!auth || !isFirebaseConfigured) {
    onUserChanged(null);
    return () => {};
  }

  return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
    if (fbUser) {
      const isWearer = fbUser.photoURL === 'wearer';
      const user: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'SafeBand User',
        email: fbUser.email || 'user@safeband.care',
        role: (isWearer ? 'wearer' : 'caregiver') as UserRole,
        phone: fbUser.phoneNumber || '+1 (415) 555-0100',
        avatarUrl: isWearer
          ? '/src/assets/images/avatar_wearer_1791004244538.jpg'
          : '/src/assets/images/avatar_caregiver_1791004233349.jpg',
        wearerName: 'Robert Vance',
        wearerAge: 74,
        emergencyNotes: 'Active profile authenticated via Firebase Authentication.',
      };
      onUserChanged(user);
    } else {
      onUserChanged(null);
    }
  });
};

export const formatAuthErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) return String(error);
  const msg = error.message;
  if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
    return 'Invalid email or password. Please verify credentials or register.';
  }
  if (msg.includes('auth/user-not-found')) {
    return 'No user found with this email. Please register first.';
  }
  if (msg.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (msg.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (msg.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  return msg;
};

export const signInWithFirebase = async (
  email: string,
  pass: string,
  role: UserRole = 'caregiver'
): Promise<AuthResponse> => {
  if (!auth || !isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please verify configuration in .env.',
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const fbUser = cred.user;
    return {
      success: true,
      user: {
        id: fbUser.uid,
        name: fbUser.displayName || email.split('@')[0],
        email: fbUser.email || email,
        role: (fbUser.photoURL === 'wearer' ? 'wearer' : role) as UserRole,
        phone: fbUser.phoneNumber || '+1 (415) 555-0198',
        avatarUrl:
          role === 'caregiver'
            ? '/src/assets/images/avatar_caregiver_1791004233349.jpg'
            : '/src/assets/images/avatar_wearer_1791004244538.jpg',
        wearerName: 'Robert Vance',
        wearerAge: 74,
      },
    };
  } catch (err: unknown) {
    return { success: false, error: formatAuthErrorMessage(err) };
  }
};

export const registerWithFirebase = async (
  name: string,
  email: string,
  pass: string,
  role: UserRole,
  phone: string
): Promise<AuthResponse> => {
  if (!auth || !isFirebaseConfigured) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please verify configuration in .env.',
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    await updateProfile(cred.user, {
      displayName: name,
      photoURL: role,
    });

    return {
      success: true,
      user: {
        id: cred.user.uid,
        name,
        email: cred.user.email || email,
        role,
        phone: phone || '+1 (415) 555-0100',
        avatarUrl:
          role === 'caregiver'
            ? '/src/assets/images/avatar_caregiver_1791004233349.jpg'
            : '/src/assets/images/avatar_wearer_1791004244538.jpg',
        wearerName: role === 'caregiver' ? 'Robert Vance' : name,
        wearerAge: 74,
        emergencyNotes: 'New profile registered with Firebase Authentication.',
      },
    };
  } catch (err: unknown) {
    return { success: false, error: formatAuthErrorMessage(err) };
  }
};

export const signOutFromFirebase = async (): Promise<void> => {
  if (auth && isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error signing out of Firebase:', err);
    }
  }
};
