import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { LinkItem } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestore-error';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';
import { formatExternalUrl } from '../utils/urlHelper';

export function useLinks(uid?: string | null, profileId: string = 'main') {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setLinks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const linksRef = collection(db, 'links');
    // Query links belonging to this user
    const q = query(linksRef, where('uid', '==', uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: LinkItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<LinkItem, 'id'>;
          const itemProfileId = data.profileId || 'main';

          // Match links for this profile
          if (profileId === 'main') {
            if (itemProfileId === 'main') {
              items.push({
                id: docSnap.id,
                ...data,
              });
            }
          } else {
            if (itemProfileId === profileId) {
              items.push({
                id: docSnap.id,
                ...data,
              });
            }
          }
        });
        // Sort items by order ascending
        items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setLinks(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err.message);
        handleFirestoreError(err, OperationType.LIST, 'links');
      }
    );

    return () => unsubscribe();
  }, [uid, profileId]);

  const addLink = async (data: {
    title: string;
    url: string;
    group_name?: string;
    icon?: string;
  }) => {
    if (!uid) throw new Error('User not authenticated');
    const linksRef = collection(db, 'links');

    const formattedUrl = formatExternalUrl(data.url);

    const nextOrder = links.length > 0 ? Math.max(...links.map((l) => l.order || 0)) + 1 : 0;

    const payload = {
      uid,
      profileId: profileId || 'main',
      title: data.title.trim(),
      url: formattedUrl,
      group_name: data.group_name?.trim() || '',
      order: nextOrder,
      isActive: true,
      icon: data.icon || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(linksRef, cleanFirestoreData(payload));
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'links');
      throw err;
    }
  };

  const updateLink = async (linkId: string, updates: Partial<LinkItem>) => {
    if (!uid) throw new Error('User not authenticated');
    const linkDocRef = doc(db, 'links', linkId);

    const safeUpdates: Record<string, any> = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (safeUpdates.url) {
      safeUpdates.url = formatExternalUrl(safeUpdates.url);
    }

    try {
      const cleaned = cleanFirestoreData(safeUpdates);
      await setDoc(linkDocRef, cleaned, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `links/${linkId}`);
      throw err;
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!uid) throw new Error('User not authenticated');
    const linkDocRef = doc(db, 'links', linkId);
    try {
      await deleteDoc(linkDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `links/${linkId}`);
    }
  };

  const reorderLinks = async (reorderedList: LinkItem[]) => {
    if (!uid) throw new Error('User not authenticated');
    try {
      const batch = writeBatch(db);
      reorderedList.forEach((item, index) => {
        const linkRef = doc(db, 'links', item.id);
        batch.update(linkRef, { order: index, updatedAt: new Date().toISOString() });
      });
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'links/reorder');
    }
  };

  const toggleLinkActive = async (linkId: string, currentStatus: boolean) => {
    await updateLink(linkId, { isActive: !currentStatus });
  };

  // Get list of distinct group names for easy filtering or auto-complete
  const groups = Array.from(
    new Set(links.map((l) => l.group_name?.trim()).filter(Boolean) as string[])
  );

  return {
    links,
    loading,
    error,
    groups,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    toggleLinkActive,
  };
}
