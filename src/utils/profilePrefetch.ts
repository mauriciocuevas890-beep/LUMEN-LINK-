import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, LinkItem, ClientProfile, ThemePreferences, CachedProfileEntry } from '../types';
import { getIdbProfile, setIdbProfile } from './localProfileDb';

export type { CachedProfileEntry };

const CACHE_PREFIX = 'lumen_profile_v2_';
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes TTL for fresh cache

// 1. High-speed in-memory store for instantaneous intra-session hits
const memoryStore = new Map<string, CachedProfileEntry>();

// In-flight network deduplicator so simultaneous prefetch + mount requests merge into 1
const inFlightRequests = new Map<string, Promise<CachedProfileEntry | null>>();

// Helper to sanitize handles
export function sanitizeUsername(raw: string): string {
  if (!raw) return '';
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw).trim();
  } catch {
    decoded = raw.trim();
  }
  return decoded.replace(/^@/, '').toLowerCase().trim();
}

// 2. Synchronous optimistic/stale cache reader (0ms latency from RAM or localStorage)
export function getCachedProfileSync(rawUsername: string): CachedProfileEntry | null {
  const clean = sanitizeUsername(rawUsername);
  if (!clean) return null;

  // Check in-memory store first (Tier 1: 0ms RAM)
  const memoryHit = memoryStore.get(clean);
  if (memoryHit) {
    return memoryHit;
  }

  // Check persistent browser storage (Tier 2: localStorage / sessionStorage)
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${clean}`) || localStorage.getItem(`${CACHE_PREFIX}${clean}`);
    if (raw) {
      const parsed = JSON.parse(raw) as CachedProfileEntry;
      if (parsed && parsed.profile) {
        memoryStore.set(clean, parsed);
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  return null;
}

// 2b. Asynchronous Tiered cache reader (RAM -> localStorage -> IndexedDB)
export async function getCachedProfileAsync(rawUsername: string): Promise<CachedProfileEntry | null> {
  const syncHit = getCachedProfileSync(rawUsername);
  if (syncHit) return syncHit;

  const clean = sanitizeUsername(rawUsername);
  if (!clean) return null;

  try {
    // Check IndexedDB (Tier 3: High-capacity persistent offline store on iOS)
    const idbHit = await getIdbProfile(clean);
    if (idbHit && idbHit.profile) {
      // Rehydrate memory store & localStorage for instant synchronous access
      memoryStore.set(clean, idbHit);
      try {
        localStorage.setItem(`${CACHE_PREFIX}${clean}`, JSON.stringify(idbHit));
      } catch (_) {}
      return idbHit;
    }
  } catch (idbErr) {
    console.warn('IndexedDB read fallback notice:', idbErr);
  }

  return null;
}

// 3. Save profile and links into all tiers: Memory (L1), localStorage (L2), and IndexedDB (L3)
export function persistProfileCache(cleanUsername: string, entry: CachedProfileEntry): void {
  const clean = sanitizeUsername(cleanUsername);
  if (!clean || !entry.profile) return;

  // Tier 1: In-memory store
  memoryStore.set(clean, entry);

  // Tier 2: localStorage & sessionStorage with quota safeguards
  try {
    const serialized = JSON.stringify(entry);
    sessionStorage.setItem(`${CACHE_PREFIX}${clean}`, serialized);
    localStorage.setItem(`${CACHE_PREFIX}${clean}`, serialized);
  } catch (e) {
    console.warn('Storage quota warning (IndexedDB handles large payloads):', e);
  }

  // Tier 3: IndexedDB persistent database (No 5MB quota limit, preserves data on iOS)
  try {
    setIdbProfile(clean, entry).catch((err) => {
      console.warn('Background IndexedDB write notice:', err);
    });
  } catch (idbErr) {
    console.warn('IndexedDB put exception:', idbErr);
  }
}

// 4. Default theme for optimistic UI render
export const defaultOptimisticTheme: ThemePreferences = {
  bgColor: '#020617',
  cardBgColor: '#0f172a',
  cardTextColor: '#f8fafc',
  cardBorderColor: '#1e293b',
  fontStyle: 'sans',
  buttonStyle: 'rounded-lg',
  buttonVariant: 'filled',
  accentColor: '#38bdf8',
};

// 5. Generate an optimistic placeholder profile while background fetch finishes
export function createOptimisticProfile(rawUsername: string): UserProfile {
  const clean = sanitizeUsername(rawUsername);
  const formattedName = clean
    ? clean.charAt(0).toUpperCase() + clean.slice(1).replace(/[-_.]/g, ' ')
    : 'Cargando...';

  return {
    uid: 'optimistic_pending',
    username: clean,
    displayName: formattedName,
    email: '',
    bio: '',
    theme_preferences: defaultOptimisticTheme,
    vcard_details: {
      fullName: formattedName,
      enabled: false,
      showQuickCall: false,
      showQrButton: false,
    },
    modules: {},
    isOptimistic: true,
  };
}

// 6. Fast asynchronous Firestore prefetcher with query parallelization & deduplication
export async function prefetchProfileData(rawUsername: string): Promise<CachedProfileEntry | null> {
  const clean = sanitizeUsername(rawUsername);
  if (!clean) return null;

  // Ignore reserved system URLs
  if (['client', 'cliente', 'dashboard', 'admin', 'auth', 'portal', 'perfil', 'c'].includes(clean)) {
    return null;
  }

  // Check if we have an in-flight promise already running for this user
  if (inFlightRequests.has(clean)) {
    return inFlightRequests.get(clean)!;
  }

  const fetchPromise = (async (): Promise<CachedProfileEntry | null> => {
    try {
      let userUid: string | null = null;
      let profileId: string | null = null;
      let loadedProfile: UserProfile | null = null;
      let docSource: 'profiles' | 'users' | null = null;

      // PARALLEL STEP 1: Direct document lookups across profiles, usernames, and users collections
      const [profileSnapRes, usernameSnapRes, userSnapRes] = await Promise.allSettled([
        getDoc(doc(db, 'profiles', clean)),
        getDoc(doc(db, 'usernames', clean)),
        getDoc(doc(db, 'users', clean)),
      ]);

      // Check direct 'profiles' collection
      if (profileSnapRes.status === 'fulfilled' && profileSnapRes.value.exists()) {
        const clientData = profileSnapRes.value.data() as ClientProfile;
        profileId = profileSnapRes.value.id;
        userUid = clientData.ownerUid || 'client';
        docSource = 'profiles';
        loadedProfile = {
          uid: userUid || 'client',
          username: clientData.username || clean,
          email: '',
          displayName: clientData.displayName || clientData.clientName,
          bio: clientData.bio,
          avatarUrl: clientData.avatarUrl,
          theme_preferences: clientData.theme_preferences,
          vcard_details: clientData.vcard_details,
          modules: clientData.modules,
        };
      }

      // Check fast username registry index
      if (!loadedProfile && usernameSnapRes.status === 'fulfilled' && usernameSnapRes.value.exists()) {
        const unameData = usernameSnapRes.value.data();
        const targetProfileId = unameData?.profileId || null;
        const targetUid = unameData?.uid || null;

        if (targetProfileId) {
          try {
            const pSnap = await getDoc(doc(db, 'profiles', targetProfileId));
            if (pSnap.exists()) {
              const cData = pSnap.data() as ClientProfile;
              profileId = pSnap.id;
              userUid = cData.ownerUid || targetUid || 'client';
              docSource = 'profiles';
              loadedProfile = {
                uid: userUid || 'client',
                username: cData.username || clean,
                email: '',
                displayName: cData.displayName || cData.clientName,
                bio: cData.bio,
                avatarUrl: cData.avatarUrl,
                theme_preferences: cData.theme_preferences,
                vcard_details: cData.vcard_details,
                modules: cData.modules,
              };
            }
          } catch (e) {
            console.warn('Index resolve error:', e);
          }
        }

        if (!loadedProfile && targetUid) {
          try {
            const uSnap = await getDoc(doc(db, 'users', targetUid));
            if (uSnap.exists()) {
              const uData = uSnap.data() as UserProfile;
              userUid = uData.uid || targetUid;
              docSource = 'users';
              loadedProfile = {
                ...uData,
                uid: userUid || targetUid,
                username: uData.username || clean,
              };
            }
          } catch (e) {
            console.warn('Index user resolve error:', e);
          }
        }
      }

      // Check direct 'users' collection
      if (!loadedProfile && userSnapRes.status === 'fulfilled' && userSnapRes.value.exists()) {
        const uData = userSnapRes.value.data() as UserProfile;
        userUid = uData.uid || userSnapRes.value.id;
        docSource = 'users';
        loadedProfile = {
          ...uData,
          uid: userUid || userSnapRes.value.id,
          username: uData.username || clean,
        };
      }

      // PARALLEL STEP 2: Query by username field if not a direct match
      if (!loadedProfile) {
        try {
          const [profilesQuerySnap, usersQuerySnap] = await Promise.all([
            getDocs(query(collection(db, 'profiles'), where('username', '==', clean))),
            getDocs(query(collection(db, 'users'), where('username', '==', clean))),
          ]);

          if (!profilesQuerySnap.empty) {
            const docSnap = profilesQuerySnap.docs[0];
            const clientData = docSnap.data() as ClientProfile;
            profileId = docSnap.id;
            userUid = clientData.ownerUid || 'client';
            docSource = 'profiles';
            loadedProfile = {
              uid: userUid || 'client',
              username: clientData.username || clean,
              email: '',
              displayName: clientData.displayName || clientData.clientName,
              bio: clientData.bio,
              avatarUrl: clientData.avatarUrl,
              theme_preferences: clientData.theme_preferences,
              vcard_details: clientData.vcard_details,
              modules: clientData.modules,
            };
          } else if (!usersQuerySnap.empty) {
            const docSnap = usersQuerySnap.docs[0];
            const uData = docSnap.data() as UserProfile;
            userUid = uData.uid || docSnap.id;
            docSource = 'users';
            loadedProfile = {
              ...uData,
              uid: userUid || docSnap.id,
              username: uData.username || clean,
            };
          }
        } catch (e) {
          console.warn('Query by username error:', e);
        }
      }

      if (!loadedProfile) {
        return null;
      }

      // Fetch links in parallel
      const links: LinkItem[] = [];
      try {
        const linksRef = collection(db, 'links');

        // Priority 1: Query by profileId
        if (profileId && profileId !== 'main') {
          const pSnap = await getDocs(query(linksRef, where('profileId', '==', profileId)));
          pSnap.forEach((d) => {
            links.push({ id: d.id, ...(d.data() as Omit<LinkItem, 'id'>) });
          });
        }

        // Priority 2: Fallback query by userUid
        if (links.length === 0 && userUid && userUid !== 'client') {
          const uSnap = await getDocs(query(linksRef, where('uid', '==', userUid)));
          uSnap.forEach((d) => {
            const data = d.data() as Omit<LinkItem, 'id'>;
            const linkProfileId = data.profileId || 'main';
            if (profileId && profileId !== 'main') {
              if (linkProfileId === profileId) {
                links.push({ id: d.id, ...data });
              }
            } else {
              if (linkProfileId === 'main') {
                links.push({ id: d.id, ...data });
              }
            }
          });
        }

        links.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      } catch (linkErr) {
        console.warn('Prefetch links error:', linkErr);
      }

      const result: CachedProfileEntry = {
        profile: loadedProfile,
        links,
        docSource: docSource || 'profiles',
        userUid: userUid || 'client',
        profileId,
        timestamp: Date.now(),
      };

      persistProfileCache(clean, result);
      return result;
    } catch (err) {
      console.error('Prefetch profile failed:', err);
      return null;
    } finally {
      inFlightRequests.delete(clean);
    }
  })();

  inFlightRequests.set(clean, fetchPromise);
  return fetchPromise;
}

// 7. Early initialization hook to prefetch based on initial window URL
export function initEarlyProfilePrefetch(): void {
  if (typeof window === 'undefined') return;

  try {
    const pathname = window.location.pathname;
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return;

    let targetHandle: string | null = null;
    if (parts.length === 1) {
      const first = parts[0];
      if (!['client', 'cliente', 'dashboard', 'admin', 'auth', 'onboarding'].includes(first.toLowerCase())) {
        targetHandle = first;
      }
    } else if (['u', 'user', 'profile', 'p'].includes(parts[0].toLowerCase()) && parts[1]) {
      targetHandle = parts[1];
    }

    if (targetHandle) {
      // Fire prefetch immediately in background without blocking main thread
      setTimeout(() => {
        prefetchProfileData(targetHandle!);
      }, 0);
    }
  } catch (e) {
    console.warn('Early prefetch init error:', e);
  }
}
