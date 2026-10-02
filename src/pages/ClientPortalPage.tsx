import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  QrCode,
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Smartphone,
  Layers,
  Palette,
  Contact,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Briefcase,
  Building,
  User,
  Shield,
  RefreshCw,
  AlertCircle,
  Camera,
  CreditCard,
  Home,
  UploadCloud,
  PhoneCall,
  Server,
  LogOut,
} from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { LinkPresetsSelector } from '../components/LinkPresetsSelector';
import { LinkPreset } from '../utils/linkPresets';
import { ClientProfile, UserProfile, LinkItem, ThemePreferences, VCardDetails } from '../types';
import { ProfileView } from '../components/ProfileView';
import { QRCodeGeneratorModal } from '../components/QRCodeModal';
import { ImageDropzone } from '../components/ImageDropzone';
import { CustomDomainSettings } from '../components/CustomDomainSettings';
import { generateAndDownloadVCF, parseVCardString } from '../utils/vcard';
import { CURATED_BACKGROUND_PRESETS, CURATED_CARD_TEMPLATES } from '../utils/imageUpload';
import { getPublicProfileUrl, formatExternalUrl } from '../utils/urlHelper';
import { copyToClipboard } from '../utils/clipboard';
import { THEME_PRESETS } from '../utils/themePresets';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';

export function ClientPortalPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, profile: adminProfile, loading: authLoading, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth?mode=signin');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Profile data
  const [profileData, setProfileData] = useState<ClientProfile | null>(null);
  const [sourceCollection, setSourceCollection] = useState<'profiles' | 'users'>('profiles');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // View state: 'card' (interactive view) | 'editor' (100% editable settings)
  const [activeTab, setActiveTab] = useState<'card' | 'editor'>('card');
  const [editorSection, setEditorSection] = useState<'media' | 'info' | 'contact' | 'links' | 'appearance' | 'domain'>('media');

  // Modals & previews
  const [showQRModal, setShowQRModal] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  // Link editing modal/state
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkGroup, setNewLinkGroup] = useState('');

  // Editable Form State
  const [clientName, setClientName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [isPremium, setIsPremium] = useState(true);
  const [theme, setTheme] = useState<ThemePreferences>(THEME_PRESETS[0].theme);
  const [vcard, setVcard] = useState<VCardDetails>({
    fullName: '',
    company: '',
    jobTitle: '',
    phone: '',
    email: '',
    website: '',
    note: '',
  });

  // Load client profile & links
  useEffect(() => {
    async function loadClient() {
      // If auth is still determining current user and no explicit ID in path or query, wait
      const queryTarget =
        searchParams.get('id') ||
        searchParams.get('clientId') ||
        searchParams.get('client') ||
        searchParams.get('username') ||
        searchParams.get('u');

      const rawParam = clientId || queryTarget;

      if (!rawParam && authLoading) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let targetId = rawParam;

        // If targetId is 'main', map to current authenticated user's UID or admin user document
        if (targetId === 'main') {
          if (currentUser) {
            targetId = currentUser.uid;
          } else if (adminProfile?.uid) {
            targetId = adminProfile.uid;
          } else {
            try {
              const uSnap = await getDocs(collection(db, 'users'));
              if (!uSnap.empty) {
                targetId = uSnap.docs[0].id;
              }
            } catch {
              // Ignore
            }
          }
        }

        // If no target provided in URL/query, or targetId is 'client' or 'cliente', fallback
        if (!targetId || targetId === 'client' || targetId === 'cliente' || targetId === 'undefined' || targetId === 'null') {
          if (currentUser) {
            // Find first client belonging to owner
            const q = query(collection(db, 'profiles'), where('ownerUid', '==', currentUser.uid));
            const snap = await getDocs(q);
            if (!snap.empty) {
              targetId = snap.docs[0].id;
            } else {
              targetId = currentUser.uid;
            }
          } else {
            // If visitor accessed /client without ID, try loading first public client profile or user
            try {
              const allSnap = await getDocs(collection(db, 'profiles'));
              if (!allSnap.empty) {
                targetId = allSnap.docs[0].id;
              } else {
                const allUsers = await getDocs(collection(db, 'users'));
                if (!allUsers.empty) {
                  targetId = allUsers.docs[0].id;
                }
              }
            } catch {
              // Ignore
            }
          }
        }

        if (!targetId) {
          setError('No se especificó ningún perfil de cliente para mostrar.');
          setLoading(false);
          return;
        }

        // Clean & decode targetId
        let decoded = '';
        try {
          decoded = decodeURIComponent(String(targetId)).trim();
        } catch {
          decoded = String(targetId).trim();
        }

        const rawTarget = decoded.replace(/^@/, '').trim();
        const cleanTarget = rawTarget.toLowerCase().trim();

        let resolvedClientData: ClientProfile | null = null;
        let resolvedProfileId: string = rawTarget;
        let resolvedSourceCol: 'profiles' | 'users' = 'profiles';

        // 1. Direct Doc ID lookup in 'profiles' collection
        try {
          const directProfileSnap = await getDoc(doc(db, 'profiles', rawTarget));
          if (directProfileSnap.exists()) {
            resolvedClientData = { id: directProfileSnap.id, ...(directProfileSnap.data() as Omit<ClientProfile, 'id'>) };
            resolvedProfileId = directProfileSnap.id;
            resolvedSourceCol = 'profiles';
          }
        } catch {
          // Ignore
        }

        // 2. Direct Doc ID lookup with cleanTarget in 'profiles'
        if (!resolvedClientData && cleanTarget !== rawTarget) {
          try {
            const cleanSnap = await getDoc(doc(db, 'profiles', cleanTarget));
            if (cleanSnap.exists()) {
              resolvedClientData = { id: cleanSnap.id, ...(cleanSnap.data() as Omit<ClientProfile, 'id'>) };
              resolvedProfileId = cleanSnap.id;
              resolvedSourceCol = 'profiles';
            }
          } catch {
            // Ignore
          }
        }

        // 3. Check 'usernames' registry
        if (!resolvedClientData) {
          try {
            const unameSnap = await getDoc(doc(db, 'usernames', cleanTarget));
            if (unameSnap.exists()) {
              const uDoc = unameSnap.data();
              if (uDoc?.profileId) {
                const pSnap = await getDoc(doc(db, 'profiles', String(uDoc.profileId)));
                if (pSnap.exists()) {
                  resolvedClientData = { id: pSnap.id, ...(pSnap.data() as Omit<ClientProfile, 'id'>) };
                  resolvedProfileId = pSnap.id;
                  resolvedSourceCol = 'profiles';
                }
              } else if (uDoc?.uid) {
                const uSnap = await getDoc(doc(db, 'users', String(uDoc.uid)));
                if (uSnap.exists()) {
                  const uData = uSnap.data() as UserProfile;
                  resolvedClientData = {
                    id: String(uDoc.uid),
                    ownerUid: uData.uid || 'admin',
                    username: uData.username || cleanTarget,
                    clientName: uData.displayName || uData.username || 'Cliente',
                    displayName: uData.displayName,
                    bio: uData.bio,
                    avatarUrl: uData.avatarUrl,
                    theme_preferences: uData.theme_preferences || THEME_PRESETS[0].theme,
                    vcard_details: uData.vcard_details || { fullName: uData.displayName || uData.username || 'Contacto' },
                  };
                  resolvedProfileId = String(uDoc.uid);
                  resolvedSourceCol = 'users';
                }
              }
            }
          } catch {
            // Ignore
          }
        }

        // 4. Query 'profiles' by username
        if (!resolvedClientData) {
          try {
            const profilesRef = collection(db, 'profiles');
            let q = query(profilesRef, where('username', '==', cleanTarget));
            let snap = await getDocs(q);

            if (snap.empty && rawTarget !== cleanTarget) {
              q = query(profilesRef, where('username', '==', rawTarget));
              snap = await getDocs(q);
            }

            if (!snap.empty) {
              const firstDoc = snap.docs[0];
              resolvedClientData = { id: firstDoc.id, ...(firstDoc.data() as Omit<ClientProfile, 'id'>) };
              resolvedProfileId = firstDoc.id;
              resolvedSourceCol = 'profiles';
            }
          } catch {
            // Ignore
          }
        }

        // 5. Direct Doc lookup in 'users' collection
        if (!resolvedClientData) {
          try {
            const userSnap = await getDoc(doc(db, 'users', rawTarget));
            if (userSnap.exists()) {
              const uData = userSnap.data() as UserProfile;
              resolvedClientData = {
                id: userSnap.id,
                ownerUid: uData.uid || 'admin',
                username: uData.username || cleanTarget,
                clientName: uData.displayName || uData.username || 'Cliente',
                displayName: uData.displayName,
                bio: uData.bio,
                avatarUrl: uData.avatarUrl,
                theme_preferences: uData.theme_preferences || THEME_PRESETS[0].theme,
                vcard_details: uData.vcard_details || { fullName: uData.displayName || uData.username || 'Contacto' },
              };
              resolvedProfileId = userSnap.id;
              resolvedSourceCol = 'users';
            }
          } catch {
            // Ignore
          }
        }

        // 6. Broad scan of 'profiles' collection
        if (!resolvedClientData) {
          try {
            const allProfilesSnap = await getDocs(collection(db, 'profiles'));
            for (const docSnap of allProfilesSnap.docs) {
              const d = docSnap.data() as ClientProfile;
              const u = (d.username || '').toLowerCase().trim();
              const cn = (d.clientName || '').toLowerCase().trim();
              const dn = (d.displayName || '').toLowerCase().trim();

              if (
                docSnap.id === rawTarget ||
                docSnap.id.toLowerCase() === cleanTarget ||
                u === cleanTarget ||
                u === rawTarget ||
                (cn && (cn === cleanTarget || cn.replace(/\s+/g, '') === cleanTarget)) ||
                (dn && (dn === cleanTarget || dn.replace(/\s+/g, '') === cleanTarget))
              ) {
                resolvedClientData = { ...d, id: docSnap.id };
                resolvedProfileId = docSnap.id;
                resolvedSourceCol = 'profiles';
                break;
              }
            }
          } catch {
            // Ignore
          }
        }

        // 7. Broad scan of 'users' collection
        if (!resolvedClientData) {
          try {
            const allUsersSnap = await getDocs(collection(db, 'users'));
            for (const docSnap of allUsersSnap.docs) {
              const d = docSnap.data() as UserProfile;
              const u = (d.username || '').toLowerCase().trim();
              const dn = (d.displayName || '').toLowerCase().trim();

              if (docSnap.id === rawTarget || u === cleanTarget || (dn && dn === cleanTarget)) {
                resolvedClientData = {
                  id: docSnap.id,
                  ownerUid: d.uid || 'admin',
                  username: d.username || cleanTarget,
                  clientName: d.displayName || d.username || 'Usuario',
                  displayName: d.displayName,
                  bio: d.bio,
                  avatarUrl: d.avatarUrl,
                  theme_preferences: d.theme_preferences || THEME_PRESETS[0].theme,
                  vcard_details: d.vcard_details || { fullName: d.displayName || d.username || 'Contacto' },
                };
                resolvedProfileId = docSnap.id;
                resolvedSourceCol = 'users';
                break;
              }
            }
          } catch {
            // Ignore
          }
        }

        if (!resolvedClientData) {
          setError('Perfil no encontrado o no existe.');
          setLoading(false);
          return;
        }

        // Successfully found client
        setProfileData(resolvedClientData);
        setSourceCollection(resolvedSourceCol);
        setClientName(resolvedClientData.clientName || '');
        setDisplayName(resolvedClientData.displayName || resolvedClientData.clientName || '');
        setBio(resolvedClientData.bio || '');
        setAvatarUrl(resolvedClientData.avatarUrl || '');
        setCustomDomain(resolvedClientData.customDomain || '');
        setIsPremium(resolvedClientData.isPremium ?? true);
        setTheme(resolvedClientData.theme_preferences || THEME_PRESETS[0].theme);
        setVcard(
          resolvedClientData.vcard_details || {
            fullName: resolvedClientData.displayName || resolvedClientData.clientName,
            company: resolvedClientData.clientName,
            phone: '',
            email: '',
          }
        );

        // Fetch links for this profile in isolated try-catch
        try {
          const linksRef = collection(db, 'links');
          const fetched: LinkItem[] = [];

          // Query by profileId
          const lq = query(linksRef, where('profileId', '==', resolvedProfileId));
          const linksSnap = await getDocs(lq);
          linksSnap.forEach((d) => {
            fetched.push({ id: d.id, ...(d.data() as Omit<LinkItem, 'id'>) });
          });

          // Fallback if no links found and target was main user
          if (fetched.length === 0 && resolvedClientData.ownerUid) {
            const uq = query(linksRef, where('uid', '==', resolvedClientData.ownerUid));
            const uSnap = await getDocs(uq);
            uSnap.forEach((d) => {
              const data = d.data() as Omit<LinkItem, 'id'>;
              if (!data.profileId || data.profileId === 'main' || data.profileId === resolvedProfileId) {
                fetched.push({ id: d.id, ...data });
              }
            });
          }

          fetched.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setLinks(fetched);
        } catch (linkErr) {
          console.warn('Error fetching client links (profile still displayed):', linkErr);
        }
      } catch (err) {
        console.error('Error al cargar perfil del cliente:', err);
        setError('Ocurrió un error al cargar los datos del perfil.');
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [clientId, searchParams, currentUser, authLoading]);

  // Construct standard UserProfile structure for ProfileView preview
  const livePreviewProfile: UserProfile = {
    uid: profileData?.ownerUid || 'client',
    username: profileData?.username || 'perfil',
    email: vcard.email || '',
    displayName: displayName || clientName || profileData?.username || 'Cliente',
    bio: bio || '',
    avatarUrl: avatarUrl || '',
    theme_preferences: theme,
    vcard_details: {
      ...vcard,
      fullName: displayName || clientName || 'Contacto',
    },
  };

  // Save all profile changes
  const handleSaveChanges = async () => {
    if (!profileData) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const updatedVcard: VCardDetails = {
        ...vcard,
        fullName: displayName.trim() || clientName.trim(),
        company: vcard.company?.trim() || clientName.trim(),
      };

      const targetCol = sourceCollection;
      const docRef = doc(db, targetCol, profileData.id);
      const payload = cleanFirestoreData({
        clientName: clientName.trim() || displayName.trim(),
        displayName: displayName.trim() || clientName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        customDomain: customDomain.trim(),
        isPremium,
        theme_preferences: theme,
        vcard_details: updatedVcard,
        updatedAt: new Date().toISOString(),
      });

      await setDoc(docRef, payload, { merge: true });

      // Keep usernames collection in sync if profile has a registered username
      if (profileData.username) {
        try {
          const unameRef = doc(db, 'usernames', profileData.username.toLowerCase());
          await setDoc(
            unameRef,
            {
              username: profileData.username.toLowerCase(),
              ...(targetCol === 'profiles' ? { profileId: profileData.id } : { uid: profileData.id }),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // ignore index sync error
        }
      }

      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              clientName: clientName.trim() || displayName.trim(),
              displayName: displayName.trim() || clientName.trim(),
              bio: bio.trim(),
              avatarUrl: avatarUrl.trim(),
              theme_preferences: theme,
              vcard_details: updatedVcard,
            }
          : null
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error al guardar cambios del perfil:', err);
      setSaveError(err instanceof Error ? err.message : 'Error desconocido al guardar los cambios.');
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Custom Domain Handlers
  const handleSaveDomain = async (domain: string, premium: boolean) => {
    setCustomDomain(domain);
    setIsPremium(premium);
    if (!profileData) return;
    const targetCol = sourceCollection;
    const docRef = doc(db, targetCol, profileData.id);
    await updateDoc(docRef, {
      customDomain: domain,
      isPremium: premium,
      customDomainConfig: {
        domain,
        status: 'pending',
        cnameTarget: 'cname.lumen.link',
        dnsRecordType: 'CNAME',
        lastChecked: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });
    setProfileData((prev) => (prev ? { ...prev, customDomain: domain, isPremium: premium } : null));
  };

  const handleRemoveDomain = async () => {
    setCustomDomain('');
    if (!profileData) return;
    const targetCol = sourceCollection;
    const docRef = doc(db, targetCol, profileData.id);
    await updateDoc(docRef, {
      customDomain: '',
      customDomainConfig: undefined,
      updatedAt: new Date().toISOString(),
    });
    setProfileData((prev) => (prev ? { ...prev, customDomain: '', customDomainConfig: undefined } : null));
  };

  const handleTogglePremium = async (premium: boolean) => {
    setIsPremium(premium);
    if (!profileData) return;
    const targetCol = sourceCollection;
    const docRef = doc(db, targetCol, profileData.id);
    await updateDoc(docRef, {
      isPremium: premium,
      updatedAt: new Date().toISOString(),
    });
    setProfileData((prev) => (prev ? { ...prev, isPremium: premium } : null));
  };

  // Import / upload .vcf contact file to populate phone number and contact details
  const handleImportVCFFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '');
        const parsed = parseVCardString(text);
        if (parsed) {
          setVcard((prev) => ({
            ...prev,
            ...parsed,
            phone: parsed.phone || prev.phone,
            fullName: parsed.fullName || prev.fullName,
            email: parsed.email || prev.email,
            company: parsed.company || prev.company,
            jobTitle: parsed.jobTitle || prev.jobTitle,
          }));
          if (parsed.fullName && !displayName) {
            setDisplayName(parsed.fullName);
          }
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3500);
        }
      } catch (err) {
        console.error('Error parsing .vcf file:', err);
        setSaveError('No se pudo leer el archivo de contacto .vcf.');
        setTimeout(() => setSaveError(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Add or Edit Link
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData || !newLinkTitle.trim() || !newLinkUrl.trim()) return;

    try {
      const formattedUrl = formatExternalUrl(newLinkUrl);

      if (editingLinkId) {
        // Update existing link
        const linkRef = doc(db, 'links', editingLinkId);
        const linkPayload = cleanFirestoreData({
          title: newLinkTitle.trim(),
          url: formattedUrl,
          group_name: newLinkGroup.trim() || '',
          updatedAt: new Date().toISOString(),
        });
        await setDoc(linkRef, linkPayload, { merge: true });

        setLinks((prev) =>
          prev.map((l) =>
            l.id === editingLinkId
              ? { ...l, title: newLinkTitle.trim(), url: formattedUrl, group_name: newLinkGroup.trim() || undefined }
              : l
          )
        );
      } else {
        // Create new link
        const linksRef = collection(db, 'links');
        const linkPayload = cleanFirestoreData({
          uid: profileData.ownerUid || 'client',
          profileId: profileData.id,
          title: newLinkTitle.trim(),
          url: formattedUrl,
          group_name: newLinkGroup.trim() || '',
          order: links.length,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        const newDoc = await addDoc(linksRef, linkPayload);

        setLinks((prev) => [
          ...prev,
          {
            id: newDoc.id,
            uid: profileData.ownerUid || 'client',
            profileId: profileData.id,
            title: newLinkTitle.trim(),
            url: formattedUrl,
            group_name: newLinkGroup.trim() || undefined,
            order: links.length,
            isActive: true,
          },
        ]);
      }

      setIsAddLinkOpen(false);
      setEditingLinkId(null);
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkGroup('');
    } catch (err) {
      console.error('Error al guardar enlace:', err);
      setSaveError('No se pudo guardar el enlace: ' + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('¿Estás seguro de eliminar este enlace?')) return;
    try {
      await deleteDoc(doc(db, 'links', linkId));
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } catch (err) {
      console.error('Error al eliminar enlace:', err);
    }
  };

  const handleToggleLinkActive = async (link: LinkItem) => {
    try {
      await updateDoc(doc(db, 'links', link.id), {
        isActive: !link.isActive,
        updatedAt: new Date().toISOString(),
      });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, isActive: !l.isActive } : l)));
    } catch (err) {
      console.error('Error al cambiar estado del enlace:', err);
    }
  };

  const handleCopyPublicUrl = async () => {
    if (!profileData) return;
    const url = getPublicProfileUrl(profileData.username, profileData.customDomain);
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleDownloadVCF = () => {
    if (!profileData) return;
    const success = generateAndDownloadVCF(livePreviewProfile, {
      publicUrl: getPublicProfileUrl(profileData.username, profileData.customDomain),
      links,
    });
    if (success) {
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  // Quick preset shortcuts for WhatsApp, Instagram, etc.
  const handleAddQuickLink = (title: string, defaultUrl: string, group?: string) => {
    setNewLinkTitle(title);
    setNewLinkUrl(defaultUrl);
    setNewLinkGroup(group || '');
    setEditingLinkId(null);
    setIsAddLinkOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300">
        <RefreshCw className="w-9 h-9 animate-spin text-sky-400 mb-4" />
        <h2 className="text-lg font-bold text-white">Cargando perfil del cliente...</h2>
        <p className="text-xs text-slate-400 mt-1">Preparando la tarjeta digital y opciones de edición.</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No se pudo cargar este perfil</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">{error || 'El cliente solicitado no existe o fue retirado.'}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Panel Principal
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            Página Principal
          </Link>
        </div>
      </div>
    );
  }

  const isManagingAsAdmin = Boolean(isAdmin);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Client Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Client Identity & Back Button */}
          <div className="flex items-center gap-3">
            {isManagingAsAdmin && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                title="Volver a la vista de todos los perfiles"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Todos los Perfiles</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || clientName}
                  className="w-9 h-9 rounded-full object-cover border border-sky-400/60 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                  {(displayName || clientName).charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight flex items-center gap-2">
                  <span>{displayName || clientName}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    @{profileData.username}
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400">
                  {isManagingAsAdmin ? 'Vista exclusiva de cliente • Modo Administrador' : 'Página de tu perfil e información'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Tabs: "Mi Tarjeta Digital" vs "Editar Mi Perfil" */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'card'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mi Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'editor'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Mi Perfil (100%)</span>
              </button>
            </div>

            {/* Quick Share / QR actions */}
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              title="Ver código QR"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopyPublicUrl}
              title="Copiar enlace de mi tarjeta pública"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-xs"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <Link
              to={`/${profileData.username}`}
              title="Abrir página pública"
              className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>

            {currentUser && (
              <button
                type="button"
                onClick={handleSignOut}
                title="Cerrar sesión y salir de esta cuenta"
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ===================== VIEW 1: MI TARJETA DIGITAL ===================== */}
        {activeTab === 'card' && (
          <div className="space-y-6">
            {/* Quick summary and actions bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tarjeta de Presentación Digital
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {displayName || clientName}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 max-w-xl">
                    Tu tarjeta está activa en internet. Las personas pueden escanear tu QR o guardar todos tus datos de contacto con 1 clic.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-sky-400 font-mono">
                    <span>{getPublicProfileUrl(profileData.username, profileData.customDomain)}</span>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadVCF}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>¡Contacto Guardado (.vcf)!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Descargar Mi Contacto (.vcf)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQRModal(true)}
                    className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span>Ver Código QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className="px-5 py-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Personalizar Todo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Interactive Digital Card Mockup */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left: Contact Info & Details Summary */}
              <div className="w-full lg:w-1/2 space-y-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Contact className="w-5 h-5 text-sky-400" />
                    <span>Ficha de Contacto para Teléfonos (vCard)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                        <User className="w-3.5 h-3.5 text-sky-400" />
                        Nombre Completo
                      </span>
                      <p className="text-white font-semibold text-sm">{displayName || clientName}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                        Puesto / Cargo
                      </span>
                      <p className="text-white font-semibold text-sm">{vcard.jobTitle || 'No especificado'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                        <Building className="w-3.5 h-3.5 text-emerald-400" />
                        Empresa / Negocio
                      </span>
                      <p className="text-white font-semibold text-sm">{vcard.company || clientName}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        Teléfono Móvil
                      </span>
                      <p className="text-white font-semibold text-sm">{vcard.phone || 'No configurado'}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 sm:col-span-2">
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                        <Mail className="w-3.5 h-3.5 text-purple-400" />
                        Correo Electrónico
                      </span>
                      <p className="text-white font-semibold text-sm">{vcard.email || 'No configurado'}</p>
                    </div>

                    {vcard.website && (
                      <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-800 sm:col-span-2">
                        <span className="text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                          <Globe className="w-3.5 h-3.5 text-teal-400" />
                          Sitio Web
                        </span>
                        <p className="text-white font-semibold text-sm truncate">{vcard.website}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {links.filter((l) => l.isActive).length} enlaces activos en tu perfil
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('editor');
                        setEditorSection('contact');
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar datos de contacto
                    </button>
                  </div>
                </div>

                {/* Quick Sharing Tips */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    ¿Cómo compartir tu tarjeta digital?
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                    <li>
                      <strong className="text-white">Código QR:</strong> Muéstralo en tu teléfono para que lo escaneen en segundos sin descargar ninguna app.
                    </li>
                    <li>
                      <strong className="text-white">Enlace directo:</strong> Agrégalo a tu biografía de Instagram, firma de correo o envíalo por WhatsApp.
                    </li>
                    <li>
                      <strong className="text-white">Descargar VCF:</strong> Al presionar guardar contacto, se descarga el archivo estándar compatible con iPhone y Android.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: Phone Frame Live Preview */}
              <div className="w-full lg:w-1/2 flex flex-col items-center">
                <div className="w-full max-w-[390px] rounded-[44px] border-[10px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden relative">
                  {/* Phone notch bar */}
                  <div className="h-6 bg-slate-900 flex items-center justify-center relative z-20">
                    <div className="w-24 h-3.5 bg-black rounded-b-xl" />
                  </div>

                  {/* Rendered Live Card */}
                  <div className="min-h-[580px] max-h-[640px] overflow-y-auto">
                    <ProfileView
                      profile={livePreviewProfile}
                      links={links}
                      isPreview={true}
                      onEditAvatar={() => {
                        setActiveTab('editor');
                        setEditorSection('media');
                      }}
                      onEditCardTemplate={() => {
                        setActiveTab('editor');
                        setEditorSection('media');
                      }}
                      onEditBackground={() => {
                        setActiveTab('editor');
                        setEditorSection('media');
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 text-center">
                  Vista previa en vivo exactamente como lo ven tus clientes en su teléfono móvil. Haz clic en la foto, plantilla o fondo para editar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW 2: EDITOR 100% PERSONALIZABLE ===================== */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Editor Navigation & Forms (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Section Sub-Navigation */}
              <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto gap-1">
                {[
                  { id: 'media', label: 'Foto, Tarjeta y Fondo', icon: Camera },
                  { id: 'info', label: 'Datos Básicos', icon: User },
                  { id: 'contact', label: 'Contacto (vCard)', icon: Phone },
                  { id: 'links', label: 'Enlaces', icon: Globe },
                  { id: 'appearance', label: 'Estilo', icon: Palette },
                  { id: 'domain', label: 'Dominio Propio', icon: Server, isPro: true },
                ].map((sec) => {
                  const Icon = sec.icon;
                  const isActive = editorSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setEditorSection(sec.id as any)}
                      className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{sec.label}</span>
                      {sec.isPro && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 ml-0.5">
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SECTION: FOTO, TARJETA Y FONDO (Subir archivos directamente) */}
              {editorSection === 'media' && (
                <div className="space-y-5">
                  <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-2xl text-xs text-sky-300 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 flex-shrink-0 text-sky-400 mt-0.5" />
                    <span>
                      <strong>100% Personalizable desde tu Dispositivo:</strong> Sube tu foto de perfil, la plantilla o diseño de tu tarjeta digital, y tu fondo general. Todo se procesa y optimiza al instante.
                    </span>
                  </div>

                  {/* 1. Foto de Perfil Dropzone */}
                  <ImageDropzone
                    type="avatar"
                    currentValue={avatarUrl}
                    onChange={(url) => setAvatarUrl(url)}
                    onRemove={() => setAvatarUrl('')}
                    label="1. Foto de Perfil o Logotipo"
                    description="Sube una foto de tu rostro o el logo corporativo de tu negocio desde tu dispositivo"
                  />

                  {/* 2. Plantilla de la Tarjeta Digital Dropzone */}
                  <ImageDropzone
                    type="card_template"
                    currentValue={theme.cardTemplateUrl}
                    onChange={(url) =>
                      setTheme((prev) => ({
                        ...prev,
                        cardTemplateUrl: url,
                      }))
                    }
                    onRemove={() =>
                      setTheme((prev) => ({
                        ...prev,
                        cardTemplateUrl: undefined,
                      }))
                    }
                    label="2. Plantilla de la Tarjeta Digital / Banner"
                    description="Sube un archivo de diseño, fondo de tarjeta o plantilla para tu presentación digital desde tu dispositivo"
                    opacity={theme.cardTemplateOpacity ?? 0.95}
                    onOpacityChange={(op) => setTheme((prev) => ({ ...prev, cardTemplateOpacity: op }))}
                  />

                  {/* Plantillas prediseñadas rápidas */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      O elige una plantilla prediseñada para tu tarjeta
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CURATED_CARD_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => {
                            setTheme((prev) => ({
                              ...prev,
                              cardTemplateUrl: undefined,
                              cardBgColor: tmpl.accent === '#eab308' ? '#2a2015' : '#1e293b',
                              cardTextColor: tmpl.textColor,
                              accentColor: tmpl.accent,
                            }));
                          }}
                          className="p-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/60 text-left transition-all group"
                          style={{ background: tmpl.gradient }}
                        >
                          <span className="block text-xs font-bold text-white drop-shadow-md">
                            {tmpl.name}
                          </span>
                          <span className="block text-[10px] text-white/70 drop-shadow-xs">
                            {tmpl.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Fondo General del Perfil Dropzone */}
                  <ImageDropzone
                    type="background"
                    currentValue={theme.bgImageUrl}
                    onChange={(url) =>
                      setTheme((prev) => ({
                        ...prev,
                        bgImageUrl: url,
                        bgType: 'image',
                      }))
                    }
                    onRemove={() =>
                      setTheme((prev) => ({
                        ...prev,
                        bgImageUrl: undefined,
                        bgType: 'solid',
                      }))
                    }
                    label="3. Imagen de Fondo General de Pantalla"
                    description="Sube una foto de tu local, oficina, marca o paisaje para el fondo completo"
                    opacity={theme.bgImageOpacity ?? 0.85}
                    onOpacityChange={(op) => setTheme((prev) => ({ ...prev, bgImageOpacity: op }))}
                    blur={theme.bgImageBlur ?? 0}
                    onBlurChange={(b) => setTheme((prev) => ({ ...prev, bgImageBlur: b }))}
                    overlay={theme.bgImageOverlay ?? 'dark'}
                    onOverlayChange={(ov) => setTheme((prev) => ({ ...prev, bgImageOverlay: ov }))}
                  />

                  {/* Fondos Prediseñados Rápidos */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                    <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      Galería de Fondos de Pantalla
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CURATED_BACKGROUND_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setTheme((prev) => ({
                              ...prev,
                              bgType: 'gradient',
                              bgGradient: preset.gradient,
                              bgImageUrl: undefined,
                              cardTextColor: preset.textColor,
                              cardBgColor: preset.cardBg,
                              accentColor: preset.accent,
                            }));
                          }}
                          className="p-2.5 rounded-xl border border-slate-800 hover:border-sky-500/60 text-left transition-all group"
                          style={{ background: preset.gradient }}
                        >
                          <span className="block text-xs font-bold text-white drop-shadow-md">
                            {preset.name}
                          </span>
                          <span className="block text-[10px] text-white/70 drop-shadow-xs">
                            {preset.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DATOS BÁSICOS */}
              {editorSection === 'info' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Información Principal</span>
                    </h3>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold transition-all">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Subir Contacto / Teléfono (.vcf)</span>
                      <input
                        type="file"
                        accept=".vcf,text/vcard"
                        onChange={handleImportVCFFile}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Nombre Para Mostrar
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ej. Dr. Carlos Mendoza / Clínica Dental"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                        <span>Número de Teléfono / WhatsApp</span>
                        <span className="text-[10px] text-emerald-400 font-normal">Llamar & WhatsApp</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={vcard.phone || ''}
                          onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                          placeholder="+52 33 1234 5678"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Nombre Interno del Cliente / Negocio
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nombre del cliente"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Biografía / Presentación Corta
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Breve descripción de tus servicios, horarios o propuesta de valor..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* SECTION: DATOS DE CONTACTO (vCard) */}
              {editorSection === 'contact' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Ficha de Contacto Telefónico (.vcf)</span>
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Compatible con iPhone & Android
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Teléfono / Celular
                      </label>
                      <input
                        type="tel"
                        value={vcard.phone || ''}
                        onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                        placeholder="+54 9 11 2345 6789"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        value={vcard.email || ''}
                        onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                        placeholder="contacto@empresa.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Cargo / Profesión
                      </label>
                      <input
                        type="text"
                        value={vcard.jobTitle || ''}
                        onChange={(e) => setVcard({ ...vcard, jobTitle: e.target.value })}
                        placeholder="Ej. Gerente General / Especialista"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Empresa / Organización
                      </label>
                      <input
                        type="text"
                        value={vcard.company || ''}
                        onChange={(e) => setVcard({ ...vcard, company: e.target.value })}
                        placeholder="Nombre de la empresa"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Sitio Web Oficial
                      </label>
                      <input
                        type="url"
                        value={vcard.website || ''}
                        onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                        placeholder="https://www.miempresa.com"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Nota / Dirección Física
                      </label>
                      <input
                        type="text"
                        value={vcard.note || ''}
                        onChange={(e) => setVcard({ ...vcard, note: e.target.value })}
                        placeholder="Ej. Av. Libertador 1234, Oficina 5A • Atendemos con cita previa"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadVCF}
                      className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Probar descarga de mi .vcf ahora
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION: ENLACES */}
              {editorSection === 'links' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span>Mis Enlaces y Redes Sociales</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        {links.length} enlaces creados para este perfil
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingLinkId(null);
                        setNewLinkTitle('');
                        setNewLinkUrl('');
                        setNewLinkGroup('');
                        setIsAddLinkOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Enlace</span>
                    </button>
                  </div>

                  {/* Quick Shortcut Buttons to Add Popular Services */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleAddQuickLink('Chatear por WhatsApp', 'https://wa.me/', 'Contacto')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3 h-3" />
                      + WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickLink('Síguenos en Instagram', 'https://instagram.com/', 'Redes Sociales')}
                      className="px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-800/60 text-pink-300 hover:bg-pink-900/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <span>📸</span>
                      + Instagram
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickLink('Cómo Llegar (Google Maps)', 'https://maps.google.com/', 'Ubicación')}
                      className="px-2.5 py-1 rounded-lg bg-sky-950/40 border border-sky-800/60 text-sky-300 hover:bg-sky-900/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <span>📍</span>
                      + Ubicación
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuickLink('Ver Menú / Catálogo', 'https://', 'Servicios')}
                      className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/60 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <span>📋</span>
                      + Catálogo
                    </button>
                  </div>

                  {/* Links List */}
                  <div className="space-y-2 pt-2">
                    {links.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-xs">
                        No tienes ningún enlace creado todavía. Haz clic en <strong>+ Nuevo Enlace</strong> para empezar.
                      </div>
                    ) : (
                      links.map((link) => (
                        <div
                          key={link.id}
                          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            link.isActive
                              ? 'bg-slate-800/60 border-slate-700'
                              : 'bg-slate-900/40 border-slate-800/60 opacity-60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-xs sm:text-sm truncate">
                                {link.title}
                              </span>
                              {link.group_name && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-300 font-mono">
                                  {link.group_name}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                              {link.url}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Open / Test Link */}
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition-all"
                              title="Abrir y probar enlace en una nueva pestaña"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Toggle active */}
                            <button
                              type="button"
                              onClick={() => handleToggleLinkActive(link)}
                              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                                link.isActive
                                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                              title={link.isActive ? 'Enlace visible' : 'Enlace oculto'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setNewLinkTitle(link.title);
                                setNewLinkUrl(link.url);
                                setNewLinkGroup(link.group_name || '');
                                setIsAddLinkOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                              title="Editar enlace"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-all"
                              title="Eliminar enlace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SECTION: ESTILO Y APARIENCIA */}
              {editorSection === 'appearance' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-sky-400" />
                    <span>Colores y Botones</span>
                  </h3>

                  {/* Card shape */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Estilo de Botones
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['rounded-lg', 'rounded-full', 'shadow-hard'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setTheme({ ...theme, buttonStyle: style })}
                          className={`py-2 px-3 border text-xs font-medium text-center transition-all ${
                            style === 'rounded-full'
                              ? 'rounded-full'
                              : style === 'shadow-hard'
                              ? 'rounded-none border-2 border-white'
                              : 'rounded-xl'
                          } ${
                            theme.buttonStyle === style
                              ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {style === 'rounded-full'
                            ? 'Píldora Redonda'
                            : style === 'shadow-hard'
                            ? 'Retro Brutalista'
                            : 'Curvado Suave'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Button Variant */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Acabado de Tarjetas
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['filled', 'glass', 'outline'] as const).map((variant) => (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => setTheme({ ...theme, buttonVariant: variant })}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-all ${
                            theme.buttonVariant === variant
                              ? 'bg-sky-500 text-white border-sky-400 shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {variant === 'filled' ? 'Sólido' : variant === 'glass' ? 'Efecto Cristal' : 'Línea de Contorno'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Color de Acento (Botón VCF)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.accentColor}
                          onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                          className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                        />
                        <span className="text-xs font-mono text-slate-300">{theme.accentColor}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Color de Fondo Base
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={theme.bgColor}
                          onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                          className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                        />
                        <span className="text-xs font-mono text-slate-300">{theme.bgColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DOMINIO PERSONALIZADO (WHITE-LABEL PREMIUM) */}
              {editorSection === 'domain' && (
                <CustomDomainSettings
                  title={`Dominio Personalizado para ${displayName || clientName}`}
                  subtitle="Conecta tu propio dominio web o subdominio para que tu tarjeta y enlaces abran con tu propia marca."
                  currentDomain={customDomain}
                  isPremium={isPremium}
                  onSaveDomain={handleSaveDomain}
                  onRemoveDomain={handleRemoveDomain}
                  onTogglePremium={handleTogglePremium}
                />
              )}

              {/* SAVE BUTTON BAR */}
              <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">
                    ¿Terminaste de hacer cambios?
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Se actualizará tu tarjeta digital pública inmediatamente.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4" />
                      ¡Guardado!
                    </span>
                  )}

                  {saveError && (
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1 animate-fade-in max-w-xs truncate" title={saveError}>
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {saveError}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Phone Mockup (5 cols) */}
            <div className="lg:col-span-5 sticky top-20 flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  Previsualización en Tiempo Real
                </span>
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR
                </button>
              </div>

              <div className="w-full max-w-[380px] rounded-[42px] border-[9px] border-slate-800 bg-slate-950 shadow-2xl overflow-hidden relative">
                {/* Phone top notch */}
                <div className="h-6 bg-slate-900 flex items-center justify-center relative z-20">
                  <div className="w-20 h-3 bg-black rounded-b-xl" />
                </div>

                {/* Rendered View */}
                <div className="min-h-[560px] max-h-[620px] overflow-y-auto">
                  <ProfileView
                    profile={livePreviewProfile}
                    links={links}
                    isPreview={true}
                    onEditAvatar={() => setEditorSection('media')}
                    onEditCardTemplate={() => setEditorSection('media')}
                    onEditBackground={() => setEditorSection('media')}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2.5 text-center">
                Haz clic en la foto, plantilla o fondo en el simulador para editarlo directamente.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Add / Edit Link Modal (Mobile Bottom-Sheet & Tablet/Desktop Dialog) */}
      {isAddLinkOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto pb-safe">
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingLinkId ? 'Editar Enlace' : 'Agregar Nuevo Enlace'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddLinkOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-3.5">
              {/* Comprehensive Quick Type Presets with search & categories */}
              <LinkPresetsSelector
                selectedUrl={newLinkUrl}
                selectedTitle={newLinkTitle}
                onSelectPreset={(preset: LinkPreset) => {
                  setNewLinkTitle(preset.title);
                  setNewLinkUrl(preset.defaultUrl);
                  if (!newLinkGroup || newLinkGroup === 'Contacto' || newLinkGroup === 'Redes Sociales' || newLinkGroup === 'Opiniones & Reseñas') {
                    setNewLinkGroup(preset.defaultGroup);
                  }
                }}
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Título del Enlace
                </label>
                <input
                  type="text"
                  required
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Ej. Escríbeme a WhatsApp / Mi Portafolio"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Dirección URL, Teléfono o Enlace</span>
                  <span className="text-[10px] text-slate-400 font-normal">https://, tel: o wa.me/</span>
                </label>
                <input
                  type="text"
                  required
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://ejemplo.com, tel:+52... o wa.me/..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Grupo o Sección (Opcional)
                </label>
                <input
                  type="text"
                  value={newLinkGroup}
                  onChange={(e) => setNewLinkGroup(e.target.value)}
                  placeholder="Ej. Redes Sociales, Menú, Contacto"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddLinkOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md active:scale-95 transition-transform"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code & Digital Card Modal */}
      <QRCodeGeneratorModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        profile={livePreviewProfile}
        customTitle={`Tarjeta Digital de ${displayName || clientName}`}
        onSaveCardTemplate={async (url) => {
          setTheme((prev) => ({ ...prev, cardTemplateUrl: url }));
          if (profileData) {
            try {
              const updatedTheme = cleanFirestoreData({ ...theme, cardTemplateUrl: url });
              await setDoc(
                doc(db, sourceCollection, profileData.id),
                {
                  theme_preferences: updatedTheme,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch (err) {
              console.error('Error saving card template:', err);
            }
          }
        }}
        onSaveAvatar={async (url) => {
          setAvatarUrl(url);
          if (profileData) {
            try {
              await setDoc(
                doc(db, sourceCollection, profileData.id),
                {
                  avatarUrl: url,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              );
            } catch (err) {
              console.error('Error saving avatar:', err);
            }
          }
        }}
      />
    </div>
  );
}
