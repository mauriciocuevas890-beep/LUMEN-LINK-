import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserProfile, LinkItem, ClientProfile } from '../types';
import { ProfileView } from '../components/ProfileView';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { PullToRefresh } from '../components/PullToRefresh';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Compass, ArrowLeft, Home } from 'lucide-react';

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Target handle from path param or query params (?u=..., ?username=..., ?p=..., ?profile=...)
  const targetUsername =
    username ||
    searchParams.get('u') ||
    searchParams.get('username') ||
    searchParams.get('p') ||
    searchParams.get('profile') ||
    searchParams.get('client');

  const loadPublicData = useCallback(
    async (isRefresh = false) => {
      if (!targetUsername) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Decode URL components safely (e.g. handle %20, accents, or @ handle)
      let decoded = '';
      try {
        decoded = decodeURIComponent(targetUsername).trim();
      } catch {
        decoded = targetUsername.trim();
      }

      const rawId = decoded.replace(/^@/, '').trim();
      const cleanUsername = rawId.toLowerCase().trim();

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

      if (!isRefresh) {
        setLoading(true);
        setNotFound(false);
      }

      try {
        let userUid: string | null = null;
        let profileId: string | null = null;
        let loadedProfile: UserProfile | null = null;

        // Step 1: Query 'users' collection using where('username', '==', username)
        try {
          const usersRef = collection(db, 'users');
          const userQuery = query(usersRef, where('username', '==', cleanUsername));
          const userSnap = await getDocs(userQuery);

          if (!userSnap.empty) {
            const docSnap = userSnap.docs[0];
            const uData = docSnap.data() as UserProfile;
            userUid = uData.uid || docSnap.id;
            loadedProfile = {
              ...uData,
              uid: userUid,
              username: uData.username || cleanUsername,
            };
          } else if (rawId !== cleanUsername) {
            // Check original casing if different
            const rawUserQuery = query(usersRef, where('username', '==', rawId));
            const rawUserSnap = await getDocs(rawUserQuery);
            if (!rawUserSnap.empty) {
              const docSnap = rawUserSnap.docs[0];
              const uData = docSnap.data() as UserProfile;
              userUid = uData.uid || docSnap.id;
              loadedProfile = {
                ...uData,
                uid: userUid,
                username: uData.username || rawId,
              };
            }
          }
        } catch (userQueryErr) {
          console.warn('Error querying users by username:', userQueryErr);
        }

        // Step 2: Query 'profiles' collection using where('username', '==', username)
        if (!loadedProfile) {
          try {
            const profilesRef = collection(db, 'profiles');
            const profileQuery = query(profilesRef, where('username', '==', cleanUsername));
            const profileSnap = await getDocs(profileQuery);

            if (!profileSnap.empty) {
              const docSnap = profileSnap.docs[0];
              const clientData = docSnap.data() as ClientProfile;
              profileId = docSnap.id;
              userUid = clientData.ownerUid || 'client';
              loadedProfile = {
                uid: userUid,
                username: clientData.username || cleanUsername,
                email: '',
                displayName: clientData.displayName || clientData.clientName,
                bio: clientData.bio,
                avatarUrl: clientData.avatarUrl,
                theme_preferences: clientData.theme_preferences,
                vcard_details: clientData.vcard_details,
              };
            } else if (rawId !== cleanUsername) {
              // Check original casing if different
              const rawProfileQuery = query(profilesRef, where('username', '==', rawId));
              const rawProfileSnap = await getDocs(rawProfileQuery);
              if (!rawProfileSnap.empty) {
                const docSnap = rawProfileSnap.docs[0];
                const clientData = docSnap.data() as ClientProfile;
                profileId = docSnap.id;
                userUid = clientData.ownerUid || 'client';
                loadedProfile = {
                  uid: userUid,
                  username: clientData.username || rawId,
                  email: '',
                  displayName: clientData.displayName || clientData.clientName,
                  bio: clientData.bio,
                  avatarUrl: clientData.avatarUrl,
                  theme_preferences: clientData.theme_preferences,
                  vcard_details: clientData.vcard_details,
                };
              }
            }
          } catch (profileQueryErr) {
            console.warn('Error querying profiles by username:', profileQueryErr);
          }
        }

        // Step 3: Check usernames/{cleanUsername} index registry as a fast pointer
        if (!loadedProfile) {
          try {
            const unameDocRef = doc(db, 'usernames', cleanUsername);
            const unameSnap = await getDoc(unameDocRef);

            if (unameSnap.exists()) {
              const unameData = unameSnap.data();
              const targetUid = unameData?.uid || null;
              const targetProfileId = unameData?.profileId || null;

              if (targetProfileId) {
                const profileDocRef = doc(db, 'profiles', targetProfileId);
                const profileSnap = await getDoc(profileDocRef);
                if (profileSnap.exists()) {
                  const clientData = profileSnap.data() as ClientProfile;
                  profileId = profileSnap.id;
                  const finalUid = clientData.ownerUid || targetUid || 'client';
                  userUid = finalUid;
                  loadedProfile = {
                    uid: finalUid,
                    username: clientData.username || cleanUsername,
                    email: '',
                    displayName: clientData.displayName || clientData.clientName,
                    bio: clientData.bio,
                    avatarUrl: clientData.avatarUrl,
                    theme_preferences: clientData.theme_preferences,
                    vcard_details: clientData.vcard_details,
                  };
                }
              }

              if (!loadedProfile && targetUid) {
                const userDocRef = doc(db, 'users', targetUid);
                const userSnap = await getDoc(userDocRef);
                if (userSnap.exists()) {
                  const uData = userSnap.data() as UserProfile;
                  const finalUid = uData.uid || targetUid;
                  userUid = finalUid;
                  loadedProfile = {
                    ...uData,
                    uid: finalUid,
                    username: uData.username || cleanUsername,
                  };
                }
              }
            }
          } catch (unameErr) {
            console.warn('Error checking usernames registry index:', unameErr);
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
                loadedProfile = {
                  uid: userUid,
                  username: d.username || cleanUsername,
                  email: '',
                  displayName: d.displayName || d.clientName,
                  bio: d.bio,
                  avatarUrl: d.avatarUrl,
                  theme_preferences: d.theme_preferences,
                  vcard_details: d.vcard_details,
                };
                break;
              }
            }
          } catch (e) {
            console.warn('Profiles collection fallback scan error:', e);
          }
        }

        if (!loadedProfile) {
          if (!isRefresh) {
            setNotFound(true);
          }
          return;
        }

        userUid = userUid || loadedProfile.uid || 'public';
        setProfile(loadedProfile);

        // Step 5: Fetch links for the resolved profile
        try {
          const linksRef = collection(db, 'links');
          const fetchedLinks: LinkItem[] = [];

          if (profileId && profileId !== 'main') {
            // Fetch links explicitly matching this client profile
            const linksQuery = query(linksRef, where('profileId', '==', profileId));
            const linksSnap = await getDocs(linksQuery);
            linksSnap.forEach((d) => {
              const data = d.data() as Omit<LinkItem, 'id'>;
              fetchedLinks.push({ id: d.id, ...data });
            });
          } else if (userUid && userUid !== 'client') {
            // Fetch links for the main profile (profileId === 'main' or omitted)
            const linksQuery = query(linksRef, where('uid', '==', userUid));
            const linksSnap = await getDocs(linksQuery);
            linksSnap.forEach((d) => {
              const data = d.data() as Omit<LinkItem, 'id'>;
              const linkProfileId = data.profileId || 'main';
              if (linkProfileId === 'main') {
                fetchedLinks.push({ id: d.id, ...data });
              }
            });
          }

          // Sort by order ascending
          fetchedLinks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setLinks(fetchedLinks);
        } catch (linkErr) {
          console.warn('Error fetching profile links (profile still displayed):', linkErr);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching public profile:', err);
        if (!isRefresh) {
          setNotFound(true);
        }
      } finally {
        if (!isRefresh) {
          setLoading(false);
        }
      }
    },
    [targetUsername, navigate]
  );

  useEffect(() => {
    loadPublicData(false);
  }, [loadPublicData]);

  // Pull-to-refresh callback triggered by user gesture
  const handlePullToRefresh = async () => {
    await loadPublicData(true);
  };

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

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ir al Panel de Perfiles</span>
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Volver a la Página Principal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Public Profile View with Pull-To-Refresh gesture support
  return (
    <PullToRefresh
      onRefresh={handlePullToRefresh}
      lastUpdated={lastUpdated}
      className="min-h-screen w-full relative"
    >
      {/* Return to Dashboard / Portal for creator */}
      {currentUser && (
        <div className="fixed top-3 left-3 z-50">
          <button
            id="return-to-panel-btn"
            onClick={() => navigate(-1)}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-xl text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95"
            title="Volver al panel"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al panel</span>
          </button>
        </div>
      )}

      <ProfileView profile={profile} links={links} isPreview={false} />
    </PullToRefresh>
  );
}
