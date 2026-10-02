import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, ThemePreferences, VCardDetails } from '../types';
import { DEFAULT_THEME } from '../utils/themePresets';
import { handleFirestoreError, OperationType } from '../utils/firestore-error';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

// Configured Master Administrator email addresses.
// Only these emails have administrative access to the multi-client dashboard.
// All other users are regular clients with access strictly to their own portal.
export const ADMIN_EMAILS: string[] = [
  'mauriciocuevas890@gmail.com',
  'maurinini@gmail.com',
  'mauri_cuevas@outlook.com',
];

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalized);
};

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<FirebaseUser>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<FirebaseUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateTheme: (theme: ThemePreferences) => Promise<void>;
  updateVCard: (vcard: VCardDetails) => Promise<void>;
  updateBasicProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) => Promise<void>;
  updateFullProfile: (data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    theme_preferences?: ThemePreferences;
    vcard_details?: VCardDetails;
  }) => Promise<void>;
  claimUsername: (username: string, initialData?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  isUsernameAvailable: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (user: FirebaseUser) => {
    setProfileLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    try {
      let loadedProfile: UserProfile | null = null;
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          loadedProfile = snap.data() as UserProfile;
        }
      } catch (getErr) {
        console.warn('Initial user profile lookup notice:', getErr);
      }

      // Auto-detect if this registered user matches a pre-assigned client profile
      if (user.email) {
        const cleanEmail = user.email.trim().toLowerCase();
        try {
          const profilesRef = collection(db, 'profiles');
          const clientQ = query(profilesRef, where('clientEmail', '==', cleanEmail));
          const clientSnap = await getDocs(clientQ);

          if (!clientSnap.empty) {
            const clientDoc = clientSnap.docs[0];
            const clientData = clientDoc.data() as any;
            const clientId = clientDoc.id;

            // Link UID in profiles doc if not linked yet
            if (clientData.clientUid !== user.uid || clientData.clientStatus !== 'active') {
              await setDoc(
                doc(db, 'profiles', clientId),
                {
                  clientUid: user.uid,
                  clientStatus: 'active',
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            }

            // If user doc doesn't exist yet, populate from pre-made client profile
            if (!loadedProfile) {
              const newClientUser: UserProfile = {
                uid: user.uid,
                email: user.email,
                username: clientData.username,
                displayName: clientData.displayName || clientData.clientName,
                bio: clientData.bio || '',
                avatarUrl: clientData.avatarUrl || '',
                role: 'client',
                assignedProfileId: clientId,
                theme_preferences: clientData.theme_preferences,
                vcard_details: clientData.vcard_details,
                createdAt: clientData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              await setDoc(userDocRef, cleanFirestoreData(newClientUser), { merge: true });
              loadedProfile = newClientUser;
            } else if (!loadedProfile.assignedProfileId) {
              await setDoc(userDocRef, { assignedProfileId: clientId, role: 'client' }, { merge: true });
              loadedProfile = { ...loadedProfile, assignedProfileId: clientId, role: 'client' };
            }
          }
        } catch (clientErr) {
          console.warn('Could not auto-link client profile:', clientErr);
        }
      }

      // Ensure super-admin role is always synchronized for master administrators
      if (isSuperAdminEmail(user.email)) {
        if (loadedProfile && loadedProfile.role !== 'admin') {
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
          loadedProfile = { ...loadedProfile, role: 'admin' };
        }
      } else if (loadedProfile && !loadedProfile.role) {
        loadedProfile.role = 'client';
      }

      setProfile(loadedProfile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // We don't crash the auth loop, but log appropriately
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Por favor ingresa un correo electrónico.');
    }
    if (!pass) {
      throw new Error('Por favor ingresa tu contraseña.');
    }
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    setCurrentUser(cred.user);
    await fetchProfile(cred.user);
    return cred.user;
  };

  const signUpWithEmail = async (
    email: string,
    pass: string,
    displayName?: string
  ): Promise<FirebaseUser> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Por favor ingresa un correo electrónico válido.');
    }
    if (pass.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (displayName?.trim()) {
      try {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Could not set displayName on Firebase Auth user:', profileErr);
      }
    }
    setCurrentUser(cred.user);
    await fetchProfile(cred.user);
    return cred.user;
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Por favor ingresa tu correo electrónico para restablecer la contraseña.');
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  const isUsernameAvailable = async (rawUsername: string): Promise<boolean> => {
    const uname = rawUsername.trim().toLowerCase();
    if (!uname || uname.length < 2 || uname.length > 30) return false;
    // Check regex
    if (!/^[a-zA-Z0-9_-]+$/.test(uname)) return false;

    // Disallow reserved names
    const reserved = ['dashboard', 'login', 'signup', 'onboarding', 'settings', 'admin', 'api', 'help', 'app', 'auth'];
    if (reserved.includes(uname)) return false;

    try {
      const unameDocRef = doc(db, 'usernames', uname);
      const snap = await getDoc(unameDocRef);
      if (!snap.exists()) {
        return true;
      }
      // If current user already owns this username
      const data = snap.data();
      return data?.uid === currentUser?.uid;
    } catch (err) {
      console.warn('Username availability check fallback:', err);
      return true;
    }
  };

  const claimUsername = async (
    rawUsername: string,
    initialData?: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'User is not authenticated.' };
    }

    const uname = rawUsername.trim().toLowerCase();
    if (!uname || uname.length < 2 || uname.length > 30) {
      return { success: false, error: 'Username must be between 2 and 30 characters.' };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(uname)) {
      return { success: false, error: 'Username can only contain letters, numbers, hyphens, and underscores.' };
    }

    const reserved = ['dashboard', 'login', 'signup', 'onboarding', 'settings', 'admin', 'api', 'help', 'app', 'auth'];
    if (reserved.includes(uname)) {
      return { success: false, error: 'This username is reserved. Please choose another.' };
    }

    try {
      const unameDocRef = doc(db, 'usernames', uname);
      const existingUnameSnap = await getDoc(unameDocRef);

      if (existingUnameSnap.exists()) {
        const existingData = existingUnameSnap.data();
        if (existingData?.uid !== currentUser.uid) {
          return { success: false, error: 'Username is already claimed by another user.' };
        }
      } else {
        // Reserve username document
        await setDoc(unameDocRef, {
          uid: currentUser.uid,
          username: uname,
          createdAt: new Date().toISOString(),
        });
      }

      // Create or update user profile document
      const userDocRef = doc(db, 'users', currentUser.uid);
      const isMasterAdmin = isSuperAdminEmail(currentUser.email);
      const newProfile: UserProfile = {
        uid: currentUser.uid,
        username: uname,
        email: currentUser.email || '',
        displayName: initialData?.displayName || currentUser.displayName || uname,
        bio: initialData?.bio || 'Welcome to my links page!',
        avatarUrl: initialData?.avatarUrl || currentUser.photoURL || '',
        role: isMasterAdmin ? 'admin' : 'client',
        theme_preferences: initialData?.theme_preferences || DEFAULT_THEME,
        vcard_details: initialData?.vcard_details || {
          fullName: initialData?.displayName || currentUser.displayName || uname,
          email: currentUser.email || '',
          phone: '',
          jobTitle: '',
          company: '',
        },
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(userDocRef, cleanFirestoreData(newProfile));
      setProfile(newProfile);
      return { success: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
      return { success: false, error: 'Failed to claim username. Please try again.' };
    }
  };

  const getFallbackProfile = (uid: string, email?: string | null): UserProfile => ({
    uid,
    username: '',
    email: email || '',
    theme_preferences: DEFAULT_THEME,
    vcard_details: { fullName: '' },
  });

  const updateTheme = async (theme: ThemePreferences) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const cleanedTheme = cleanFirestoreData(theme);
    try {
      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          theme_preferences: cleanedTheme,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProfile((prev) => ({
        ...(prev || getFallbackProfile(currentUser.uid, currentUser.email)),
        theme_preferences: cleanedTheme,
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      throw err;
    }
  };

  const updateVCard = async (vcard: VCardDetails) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const cleanedVCard = cleanFirestoreData(vcard);
    try {
      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          vcard_details: cleanedVCard,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProfile((prev) => ({
        ...(prev || getFallbackProfile(currentUser.uid, currentUser.email)),
        vcard_details: cleanedVCard,
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      throw err;
    }
  };

  const updateBasicProfile = async (data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const cleanedData = cleanFirestoreData(data);
    try {
      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          ...cleanedData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProfile((prev) => ({
        ...(prev || getFallbackProfile(currentUser.uid, currentUser.email)),
        ...cleanedData,
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      throw err;
    }
  };

  const updateFullProfile = async (data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    theme_preferences?: ThemePreferences;
    vcard_details?: VCardDetails;
  }) => {
    if (!currentUser) throw new Error('Usuario no autenticado.');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const cleanedData = cleanFirestoreData(data);
    try {
      await setDoc(
        userDocRef,
        {
          uid: currentUser.uid,
          ...cleanedData,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setProfile((prev) => ({
        ...(prev || getFallbackProfile(currentUser.uid, currentUser.email)),
        ...cleanedData,
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
      throw err;
    }
  };

  const isSuperAdmin = Boolean(currentUser?.email && isSuperAdminEmail(currentUser.email));
  const isAdmin = isSuperAdmin || profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        profileLoading,
        isAdmin,
        isSuperAdmin,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateTheme,
        updateVCard,
        updateBasicProfile,
        updateFullProfile,
        claimUsername,
        isUsernameAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
