import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ClientProfile, ThemePreferences, VCardDetails } from '../types';
import { THEME_PRESETS } from '../utils/themePresets';
import { PREMADE_PROFILE_TEMPLATES } from '../utils/premadeTemplates';
import { handleFirestoreError, OperationType } from '../utils/firestore-error';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

export function useClients(ownerUid?: string | null) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time listener for all clients managed by this owner
  useEffect(() => {
    if (!ownerUid) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where('ownerUid', '==', ownerUid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: ClientProfile[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ClientProfile, 'id'>),
          });
        });
        // Sort alphabetically by clientName or createdAt
        items.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
        setClients(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err.message);
        handleFirestoreError(err, OperationType.LIST, 'profiles');
      }
    );

    return () => unsubscribe();
  }, [ownerUid]);

  // Check username availability for new client
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 2) return false;
    try {
      const unameDocRef = doc(db, 'usernames', cleanUsername);
      const snap = await getDoc(unameDocRef);
      return !snap.exists();
    } catch (err) {
      console.error('Error checking client username availability:', err);
      return false;
    }
  };

  // Add new client profile (supports pre-made templates & direct client email assignment)
  const addClient = async (data: {
    clientName: string;
    username: string;
    clientEmail?: string;
    templateId?: string;
    industry?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    theme?: ThemePreferences;
    vcard?: VCardDetails;
  }): Promise<string> => {
    if (!ownerUid) throw new Error('Usuario no autenticado.');

    const cleanUsername = data.username.trim().toLowerCase();
    if (!cleanUsername) throw new Error('El nombre de usuario es obligatorio.');
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      throw new Error('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos.');
    }

    // Check unique username
    const isFree = await checkUsernameAvailable(cleanUsername);
    if (!isFree) {
      throw new Error(`El enlace lumen.link/${cleanUsername} ya está ocupado. Por favor elige otro.`);
    }

    // Check selected pre-made template
    const selectedTemplate = PREMADE_PROFILE_TEMPLATES.find((t) => t.id === data.templateId);

    const profilesRef = collection(db, 'profiles');
    const newProfileDoc = doc(profilesRef);
    const newProfileId = newProfileDoc.id;

    const initialTheme: ThemePreferences =
      data.theme || (selectedTemplate ? selectedTemplate.theme : THEME_PRESETS[0].theme);

    const cleanEmail = (data.clientEmail || '').trim().toLowerCase();

    const initialVCard: VCardDetails = data.vcard || {
      fullName: data.displayName || data.clientName,
      company: data.clientName,
      phone: '',
      email: cleanEmail || '',
      jobTitle: selectedTemplate ? selectedTemplate.defaultJobTitle : '',
      website: '',
      note: '',
    };

    // Check if client email is already registered in users collection
    let matchedClientUid: string | undefined = undefined;
    let initialClientStatus: 'unassigned' | 'pending' | 'active' = 'unassigned';

    if (cleanEmail) {
      initialClientStatus = 'pending';
      try {
        const usersRef = collection(db, 'users');
        const userQ = query(usersRef, where('email', '==', cleanEmail));
        const userSnap = await getDocs(userQ);
        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          matchedClientUid = userDoc.id;
          initialClientStatus = 'active';
        }
      } catch (err) {
        console.warn('Could not check user registry for client email:', err);
      }
    }

    const newClientData: Omit<ClientProfile, 'id'> = {
      ownerUid,
      username: cleanUsername,
      clientName: data.clientName.trim(),
      clientEmail: cleanEmail || undefined,
      clientUid: matchedClientUid,
      clientStatus: initialClientStatus,
      clientAccess: 'full',
      industry: data.industry?.trim() || (selectedTemplate ? selectedTemplate.category : 'General'),
      displayName: data.displayName?.trim() || data.clientName.trim(),
      bio: data.bio?.trim() || (selectedTemplate ? selectedTemplate.defaultBio : ''),
      avatarUrl: data.avatarUrl?.trim() || '',
      theme_preferences: initialTheme,
      vcard_details: initialVCard,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const batch = writeBatch(db);

      // 1. Create client profile document
      batch.set(newProfileDoc, cleanFirestoreData(newClientData));

      // 2. Reserve unique username in usernames registry
      const unameRef = doc(db, 'usernames', cleanUsername);
      batch.set(unameRef, {
        uid: ownerUid,
        profileId: newProfileId,
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      });

      // 3. If pre-made template has default sample links, seed them automatically!
      if (selectedTemplate && selectedTemplate.defaultLinks.length > 0) {
        selectedTemplate.defaultLinks.forEach((linkDef, index) => {
          const linkDoc = doc(collection(db, 'links'));
          batch.set(linkDoc, {
            uid: ownerUid,
            profileId: newProfileId,
            title: linkDef.title,
            url: linkDef.url,
            group_name: linkDef.group_name,
            order: index,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }

      // 4. If matched user already exists, update their assignedProfileId
      if (matchedClientUid) {
        const uDoc = doc(db, 'users', matchedClientUid);
        batch.set(uDoc, { assignedProfileId: newProfileId, role: 'client' }, { merge: true });
      }

      await batch.commit();
      return newProfileId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `profiles/${newProfileId}`);
      throw err;
    }
  };

  // Update client profile details (info, theme, vCard)
  const updateClient = async (
    clientId: string,
    updates: Partial<Omit<ClientProfile, 'id' | 'ownerUid' | 'username'>>
  ) => {
    if (!ownerUid) throw new Error('Usuario no autenticado.');
    const docRef = doc(db, 'profiles', clientId);
    const cleanedUpdates = cleanFirestoreData(updates);
    try {
      await setDoc(
        docRef,
        {
          ...cleanedUpdates,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${clientId}`);
      throw err;
    }
  };

  // Assign or update client's registered email
  const assignClientEmail = async (clientId: string, rawEmail: string) => {
    if (!ownerUid) throw new Error('Usuario no autenticado.');
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Ingresa un correo electrónico válido.');

    let matchedClientUid: string | undefined = undefined;
    let status: 'pending' | 'active' = 'pending';

    try {
      const usersRef = collection(db, 'users');
      const userQ = query(usersRef, where('email', '==', cleanEmail));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        matchedClientUid = userDoc.id;
        status = 'active';

        // Link profile to user doc
        await setDoc(
          doc(db, 'users', matchedClientUid),
          { assignedProfileId: clientId, role: 'client' },
          { merge: true }
        );
      }

      const docRef = doc(db, 'profiles', clientId);
      await setDoc(
        docRef,
        cleanFirestoreData({
          clientEmail: cleanEmail,
          clientUid: matchedClientUid || null,
          clientStatus: status,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${clientId}`);
      throw err;
    }
  };

  // Unlink assigned client email
  const unlinkClientEmail = async (clientId: string) => {
    if (!ownerUid) throw new Error('Usuario no autenticado.');
    const docRef = doc(db, 'profiles', clientId);
    try {
      await updateDoc(docRef, {
        clientEmail: '',
        clientUid: null,
        clientStatus: 'unassigned',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `profiles/${clientId}`);
      throw err;
    }
  };

  // Delete a client, their username reservation, and their links
  const deleteClient = async (client: ClientProfile) => {
    if (!ownerUid) throw new Error('Usuario no autenticado.');
    try {
      const batch = writeBatch(db);

      // 1. Delete profile doc
      const profileRef = doc(db, 'profiles', client.id);
      batch.delete(profileRef);

      // 2. Release username
      const unameRef = doc(db, 'usernames', client.username);
      batch.delete(unameRef);

      await batch.commit();

      // 3. Clean up all links associated with this client
      const linksRef = collection(db, 'links');
      const q = query(linksRef, where('profileId', '==', client.id));
      const linksSnap = await getDocs(q);
      const linkBatch = writeBatch(db);
      linksSnap.forEach((d) => {
        linkBatch.delete(d.ref);
      });
      await linkBatch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `profiles/${client.id}`);
      throw err;
    }
  };

  return {
    clients,
    loading,
    error,
    checkUsernameAvailable,
    addClient,
    updateClient,
    assignClientEmail,
    unlinkClientEmail,
    deleteClient,
  };
}
