import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, LinkItem, ClientProfile } from '../types';
import { ProfileView } from '../components/ProfileView';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { PullToRefresh } from '../components/PullToRefresh';
import { Compass } from 'lucide-react';
import {
  sanitizeUsername,
  getCachedProfileSync,
  getCachedProfileAsync,
  persistProfileCache,
} from '../utils/profilePrefetch';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Target handle from path param or query params (?u=..., ?username=..., ?p=..., ?profile=...)
  const targetUsername =
    username ||
    searchParams.get('u') ||
    searchParams.get('username') ||
    searchParams.get('p') ||
    searchParams.get('profile') ||
    searchParams.get('client') ||
    '';

  const cleanUsername = sanitizeUsername(targetUsername);

  // Synchronous cache hit (from memory, sessionStorage or localStorage)
  const initialCache = cleanUsername ? getCachedProfileSync(cleanUsername) : null;

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    return initialCache ? initialCache.profile : null;
  });

  const [links, setLinks] = useState<LinkItem[]>(() => {
    return initialCache ? initialCache.links : [];
  });

  // Track whether links have completed their initial network or cache resolution
  const [linksLoading, setLinksLoading] = useState<boolean>(() => {
    return !initialCache;
  });

  // If cached, render immediately (0ms). If cold first visit, show skeleton while fetching.
  const [loading, setLoading] = useState<boolean>(() => {
    return !initialCache;
  });
  const [notFound, setNotFound] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    return initialCache ? new Date(initialCache.timestamp) : null;
  });

  // Persistent IndexedDB Layer (Tier 3): Instant cache hydration on iOS if not in memory/localStorage
  useEffect(() => {
    if (!initialCache && cleanUsername) {
      let isMounted = true;
      getCachedProfileAsync(cleanUsername)
        .then((idbHit) => {
          if (isMounted && idbHit && idbHit.profile) {
            setProfile(idbHit.profile);
            setLinks(idbHit.links || []);
            setLinksLoading(false);
            setLoading(false);
            setLastUpdated(new Date(idbHit.timestamp));
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [cleanUsername, initialCache]);

  const unsubProfileRef = useRef<Unsubscribe | null>(null);
  const unsubLinksRef = useRef<Unsubscribe | null>(null);
  const profileRef = useRef<UserProfile | null>(profile);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const cleanupListeners = useCallback(() => {
    if (unsubProfileRef.current) {
      unsubProfileRef.current();
      unsubProfileRef.current = null;
    }
    if (unsubLinksRef.current) {
      unsubLinksRef.current();
      unsubLinksRef.current = null;
    }
  }, []);

  const loadPublicData = useCallback(
    async (isRefresh = false) => {
      if (!cleanUsername) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Avoid querying Firestore for browser asset requests (favicon.ico, manifest, etc.)
      if (/\.(png|jpe?g|gif|svg|ico|json|webmanifest|xml|txt|js|css|map)$/i.test(cleanUsername)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      cleanupListeners();

      // Redirect reserved system routes if they accidentally hit this wildcard
      if (['client', 'cliente', 'portal', 'perfil'].includes(cleanUsername)) {
        navigate('/client', { replace: true });
        return;
      }
      if (['dashboard', 'admin'].includes(cleanUsername)) {
        navigate('/dashboard', { replace: true });
        return;
      }
      if (['auth', 'login', 'signup'].includes(cleanUsername)) {
        navigate('/auth', { replace: true });
        return;
      }

      // If user pulled to refresh or has no cache, keep current view while fetching
      if (!isRefresh && !profileRef.current) {
        setLoading(true);
      }

      try {
        let userUid: string | null = null;
        let profileId: string | null = null;
        let loadedProfile: UserProfile | null = null;
        let docSource: 'profiles' | 'users' | null = null;

        // Step 0: PARALLEL LOOKUP of direct IDs in profiles, usernames registry, and users
        const [profileDirectRes, usernameIndexRes, userDirectRes] = await Promise.allSettled([
          getDoc(doc(db, 'profiles', cleanUsername)),
          getDoc(doc(db, 'usernames', cleanUsername)),
          getDoc(doc(db, 'users', cleanUsername)),
        ]);

        // Check direct profile doc
        if (profileDirectRes.status === 'fulfilled' && profileDirectRes.value.exists()) {
          const clientData = profileDirectRes.value.data() as ClientProfile;
          profileId = profileDirectRes.value.id;
          userUid = clientData.ownerUid || 'client';
          docSource = 'profiles';
          loadedProfile = {
            uid: userUid,
            username: clientData.username || cleanUsername,
            email: '',
            displayName: clientData.displayName || clientData.clientName,
            bio: clientData.bio,
            avatarUrl: clientData.avatarUrl,
            theme_preferences: clientData.theme_preferences,
            vcard_details: clientData.vcard_details,
            modules: clientData.modules,
          };
        }

        // Check username registry index if not found
        if (!loadedProfile && usernameIndexRes.status === 'fulfilled' && usernameIndexRes.value.exists()) {
          const unameData = usernameIndexRes.value.data();
          const targetUid = unameData?.uid || null;
          const targetProfileId = unameData?.profileId || null;

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
                  username: cData.username || cleanUsername,
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
              console.warn('Index profile resolve error:', e);
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
                  username: uData.username || cleanUsername,
                };
              }
            } catch (e) {
              console.warn('Index user resolve error:', e);
            }
          }
        }

        // Check direct user doc if not found
        if (!loadedProfile && userDirectRes.status === 'fulfilled' && userDirectRes.value.exists()) {
          const uData = userDirectRes.value.data() as UserProfile;
          userUid = uData.uid || userDirectRes.value.id;
          docSource = 'users';
          loadedProfile = {
            ...uData,
            uid: userUid,
            username: uData.username || cleanUsername,
          };
        }

        // Step 1: Query collections by username field in PARALLEL if not direct hit
        if (!loadedProfile) {
          try {
            const [usersQuerySnap, profilesQuerySnap] = await Promise.all([
              getDocs(query(collection(db, 'users'), where('username', '==', cleanUsername), limit(1))),
              getDocs(query(collection(db, 'profiles'), where('username', '==', cleanUsername), limit(1))),
            ]);

            if (!profilesQuerySnap.empty) {
              const docSnap = profilesQuerySnap.docs[0];
              const clientData = docSnap.data() as ClientProfile;
              profileId = docSnap.id;
              userUid = clientData.ownerUid || 'client';
              docSource = 'profiles';
              loadedProfile = {
                uid: userUid,
                username: clientData.username || cleanUsername,
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
                uid: userUid,
                username: uData.username || cleanUsername,
              };
            }
          } catch (queryErr) {
            console.warn('Parallel query by username err:', queryErr);
          }
        }

        // Step 4: Fallback scan across profiles in case of clientName matching
        if (!loadedProfile) {
          try {
            const allProfilesSnap = await getDocs(collection(db, 'profiles'));
            for (const docSnap of allProfilesSnap.docs) {
              const d = docSnap.data() as ClientProfile;
              const u = (d.username || '').toLowerCase().trim();
              const cn = (d.clientName || '').toLowerCase().trim();
              const dn = (d.displayName || '').toLowerCase().trim();

              if (
                u === cleanUsername ||
                docSnap.id.toLowerCase() === cleanUsername ||
                (cn && (cn === cleanUsername || cn.replace(/\s+/g, '') === cleanUsername)) ||
                (dn && (dn === cleanUsername || dn.replace(/\s+/g, '') === cleanUsername))
              ) {
                profileId = docSnap.id;
                userUid = d.ownerUid || 'client';
                docSource = 'profiles';
                loadedProfile = {
                  uid: userUid,
                  username: d.username || cleanUsername,
                  email: '',
                  displayName: d.displayName || d.clientName,
                  bio: d.bio,
                  avatarUrl: d.avatarUrl,
                  theme_preferences: d.theme_preferences,
                  vcard_details: d.vcard_details,
                  modules: d.modules,
                };
                break;
              }
            }
          } catch (e) {
            console.warn('Profiles collection fallback scan error:', e);
          }
        }

        // Step 4b: Fallback scan across users collection in case of casing or displayName matching
        if (!loadedProfile) {
          try {
            const allUsersSnap = await getDocs(collection(db, 'users'));
            for (const docSnap of allUsersSnap.docs) {
              const uData = docSnap.data() as UserProfile;
              const u = (uData.username || '').toLowerCase().trim();
              const dn = (uData.displayName || '').toLowerCase().trim();

              if (u === cleanUsername || docSnap.id.toLowerCase() === cleanUsername || (dn && dn === cleanUsername)) {
                userUid = uData.uid || docSnap.id;
                docSource = 'users';
                loadedProfile = {
                  ...uData,
                  uid: userUid,
                  username: uData.username || cleanUsername,
                };
                break;
              }
            }
          } catch (e) {
            console.warn('Users collection fallback scan error:', e);
          }
        }

        if (!loadedProfile) {
          if (!isRefresh) {
            setNotFound(true);
          }
          return;
        }

        userUid = userUid || loadedProfile.uid || 'public';

        // Step 5: Fast initial fetch of profile links before releasing optimistic state
        // This eliminates the premature "No hay enlaces publicados todavía" flash
        const linksRef = collection(db, 'links');
        const initialLinks: LinkItem[] = [];

        try {
          // Priority 1: Direct lookup by profileId for client profiles
          if (profileId && profileId !== 'main') {
            const pSnap = await getDocs(query(linksRef, where('profileId', '==', profileId)));
            pSnap.forEach((d) => {
              initialLinks.push({ id: d.id, ...(d.data() as Omit<LinkItem, 'id'>) });
            });
          }

          // Priority 2: Fallback lookup by userUid
          if (initialLinks.length === 0 && userUid && userUid !== 'client') {
            const uSnap = await getDocs(query(linksRef, where('uid', '==', userUid)));
            uSnap.forEach((d) => {
              const data = d.data() as Omit<LinkItem, 'id'>;
              const linkProfileId = data.profileId || 'main';
              if (profileId && profileId !== 'main') {
                if (linkProfileId === profileId) {
                  initialLinks.push({ id: d.id, ...data });
                }
              } else {
                if (linkProfileId === 'main') {
                  initialLinks.push({ id: d.id, ...data });
                }
              }
            });
          }

          initialLinks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } catch (fetchLinksErr) {
          console.warn('Initial links getDocs warning:', fetchLinksErr);
        }

        // Atomically update both profile and links in the same render tick
        setLinks(initialLinks);
        setProfile(loadedProfile);
        setLinksLoading(false);
        setLoading(false);
        setLastUpdated(new Date());

        // Store immediately in ultra-fast memory & persistent cache
        if (loadedProfile && docSource) {
          persistProfileCache(cleanUsername, {
            profile: loadedProfile,
            links: initialLinks,
            docSource,
            userUid: userUid || 'client',
            profileId,
            timestamp: Date.now(),
          });
        }

        // Step 6: Real-time onSnapshot listener for the active profile document
        try {
          if (docSource === 'profiles' && profileId) {
            const profileDocRef = doc(db, 'profiles', profileId);
            unsubProfileRef.current = onSnapshot(
              profileDocRef,
              (snap) => {
                if (snap.exists()) {
                  const clientData = snap.data() as ClientProfile;
                  setProfile((prev) => ({
                    uid: clientData.ownerUid || prev?.uid || 'client',
                    username: clientData.username || prev?.username || cleanUsername,
                    email: prev?.email || '',
                    displayName: clientData.displayName || clientData.clientName || prev?.displayName || '',
                    bio: clientData.bio,
                    avatarUrl: clientData.avatarUrl,
                    theme_preferences: clientData.theme_preferences,
                    vcard_details: clientData.vcard_details,
                    modules: clientData.modules,
                  }));
                  setLastUpdated(new Date());
                }
              },
              (err) => {
                console.warn('Real-time profile listener notice (handled):', err);
              }
            );
          } else if (docSource === 'users' && userUid) {
            const userDocRef = doc(db, 'users', userUid);
            unsubProfileRef.current = onSnapshot(
              userDocRef,
              (snap) => {
                if (snap.exists()) {
                  const uData = snap.data() as UserProfile;
                  setProfile((prev) => ({
                    ...prev,
                    ...uData,
                    uid: uData.uid || snap.id,
                    username: uData.username || prev?.username || cleanUsername,
                  }));
                  setLastUpdated(new Date());
                }
              },
              (err) => {
                console.warn('Real-time user listener notice (handled):', err);
              }
            );
          }
        } catch (subErr) {
          console.warn('Error setting up profile snapshot listener:', subErr);
        }

        // Step 7: Real-time onSnapshot listener for live link updates
        try {
          let linksQuery;

          if (profileId && profileId !== 'main') {
            linksQuery = query(linksRef, where('profileId', '==', profileId));
          } else if (userUid && userUid !== 'client') {
            linksQuery = query(linksRef, where('uid', '==', userUid));
          }

          if (linksQuery) {
            unsubLinksRef.current = onSnapshot(
              linksQuery,
              (snapshot) => {
                const fetchedLinks: LinkItem[] = [];
                snapshot.forEach((d) => {
                  const data = d.data() as Omit<LinkItem, 'id'>;
                  if (profileId && profileId !== 'main') {
                    fetchedLinks.push({ id: d.id, ...data });
                  } else {
                    const linkProfileId = data.profileId || 'main';
                    if (linkProfileId === 'main') {
                      fetchedLinks.push({ id: d.id, ...data });
                    }
                  }
                });

                fetchedLinks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                setLinks(fetchedLinks);
                setLinksLoading(false);
                setLastUpdated(new Date());

                // Keep cache refreshed with live updates
                if (loadedProfile && docSource) {
                  persistProfileCache(cleanUsername, {
                    profile: loadedProfile,
                    links: fetchedLinks,
                    docSource,
                    userUid: userUid || 'client',
                    profileId,
                    timestamp: Date.now(),
                  });
                }
              },
              (err) => {
                console.warn('Real-time links listener notice (handled):', err);
                setLinksLoading(false);
              }
            );
          }
        } catch (linkErr) {
          console.warn('Error setting up links snapshot listener:', linkErr);
          setLinksLoading(false);
        }
      } catch (err) {
        console.error('Error fetching public profile:', err);
        if (!isRefresh && !profileRef.current) {
          setNotFound(true);
        }
      } finally {
        if (!isRefresh) {
          setLoading(false);
        }
      }
    },
    [cleanUsername, navigate, cleanupListeners]
  );

  useEffect(() => {
    loadPublicData(false);
    return () => {
      cleanupListeners();
    };
  }, [loadPublicData, cleanupListeners]);

  // Pull-to-refresh callback triggered by user gesture
  const handlePullToRefresh = async () => {
    await loadPublicData(true);
  };

  // Sync document title with profile name for rich browser tabs & bookmarks
  useEffect(() => {
    if (profile?.displayName || profile?.username) {
      const name = profile.displayName || profile.username;
      document.title = `${name} • Tarjeta Digital`;
    }
  }, [profile?.displayName, profile?.username]);

  // Loading skeleton state - Smooth, high-fidelity placeholder layout while fetching Firestore data
  if (loading) {
    return <ProfileSkeleton handle={targetUsername || username} />;
  }

  // Not Found State - Clean, friendly, with zero promotional watermark or "Create your own" ads
  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-sky-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto">
            <Compass className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Perfil No Encontrado</h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              El perfil o tarjeta digital <span className="font-mono text-amber-400 font-bold">@{username}</span> no existe o la dirección web es incorrecta.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-500">
              Verifica que la dirección compartida no contenga errores de escritura.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Public Profile View with Pull-To-Refresh gesture support
  // 100% focused on profile info: no menu buttons, no panel return, no promotional widgets
  return (
    <PullToRefresh
      onRefresh={handlePullToRefresh}
      lastUpdated={lastUpdated}
      className="min-h-screen w-full relative"
    >
      <ProfileView profile={profile} links={links} isPreview={false} isLinksLoading={linksLoading} />
    </PullToRefresh>
  );
}
