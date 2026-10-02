import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Copy,
  Check,
  Eye,
  LogOut,
  Layers,
  Palette,
  Contact,
  Smartphone,
  Save,
  CheckCircle2,
  FolderTree,
  Link2,
  FolderPlus,
  RefreshCw,
  Share2,
  Users,
  Building2,
  ChevronDown,
  Briefcase,
  Search,
  UserCheck,
  ArrowLeft,
  X,
  AlertCircle,
  QrCode,
  CreditCard,
  Phone,
  MessageCircle,
  UploadCloud,
  PhoneCall,
  Mail,
  MailCheck,
  UserPlus,
  Send,
  ShieldCheck,
  Utensils,
  HeartPulse,
  Globe,
  Server,
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLinks } from '../hooks/useLinks';
import { useClients } from '../hooks/useClients';
import { ProfileView } from '../components/ProfileView';
import { QRCodeCard } from '../components/QRCodeCard';
import { QRCodeGeneratorModal } from '../components/QRCodeModal';
import { ImageDropzone } from '../components/ImageDropzone';
import { CustomDomainSettings } from '../components/CustomDomainSettings';
import { THEME_PRESETS } from '../utils/themePresets';
import { PREMADE_PROFILE_TEMPLATES } from '../utils/premadeTemplates';
import { CURATED_BACKGROUND_PRESETS, CURATED_CARD_TEMPLATES } from '../utils/imageUpload';
import { downloadVCard, generateAndDownloadVCF, parseVCardString } from '../utils/vcard';
import { cleanFirestoreData } from '../utils/cleanFirestoreData';
import { LinkPresetsSelector } from '../components/LinkPresetsSelector';
import { LinkPreset } from '../utils/linkPresets';
import { ThemePreferences, VCardDetails, LinkItem, UserProfile, ClientProfile } from '../types';
import { getPublicProfileUrl, getClientPortalUrl, formatExternalUrl } from '../utils/urlHelper';
import { copyToClipboard } from '../utils/clipboard';

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser, profile, signOut, updateTheme, updateVCard, updateBasicProfile, updateFullProfile, loading, isAdmin } = useAuth();
  const { clients, loading: clientsLoading, addClient, updateClient, assignClientEmail, unlinkClientEmail, deleteClient, checkUsernameAvailable } = useClients(currentUser?.uid);

  // Active profile selection: 'main' (own profile) or clientId
  const [activeClientId, setActiveClientId] = useState<string>('main');

  // Currently active client object (if not 'main')
  const activeClient = activeClientId !== 'main' ? clients.find((c) => c.id === activeClientId) || null : null;

  // Tabs: 'clients' | 'media' | 'links' | 'appearance' | 'vcard' | 'domain'
  const [activeTab, setActiveTab] = useState<'clients' | 'media' | 'links' | 'appearance' | 'vcard' | 'domain'>('clients');

  // Multi-profile Links hook: scoped by profileId
  const {
    links,
    loading: linksLoading,
    groups,
    addLink,
    updateLink,
    deleteLink,
    reorderLinks,
    toggleLinkActive,
  } = useLinks(currentUser?.uid, activeClientId);

  // Link Add/Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkGroup, setLinkGroup] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

  // Filter by group
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Copy feedback & toast messages
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [isSavingVCard, setIsSavingVCard] = useState(false);

  // References to prevent background snapshots from resetting user input while editing
  const lastLoadedProfileIdRef = useRef<string | null>(null);
  const hasLoadedInitialProfileRef = useRef<boolean>(false);

  // Mobile preview modal
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // QR Code & Digital Business Card Modal state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrProfile, setSelectedQrProfile] = useState<UserProfile | ClientProfile | null>(null);

  // Client switcher dropdown open state
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);

  // New Client Modal state
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientUsername, setNewClientUsername] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('Servicios');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientTemplateId, setNewClientTemplateId] = useState('corporate');
  const [newClientSubmitting, setNewClientSubmitting] = useState(false);
  const [newClientError, setNewClientError] = useState<string | null>(null);
  const [newClientUsernameChecking, setNewClientUsernameChecking] = useState(false);
  const [newClientUsernameAvailable, setNewClientUsernameAvailable] = useState<boolean | null>(null);

  // Assign / Manage Client Email Modal state
  const [assignEmailClient, setAssignEmailClient] = useState<ClientProfile | null>(null);
  const [assignEmailInput, setAssignEmailInput] = useState('');
  const [assignEmailSubmitting, setAssignEmailSubmitting] = useState(false);
  const [assignEmailError, setAssignEmailError] = useState<string | null>(null);
  const [copiedInviteMsgId, setCopiedInviteMsgId] = useState<string | null>(null);

  // Edit Client Basic Info Modal state
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientIndustry, setEditClientIndustry] = useState('');

  // Search filter for clients tab
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Editable Theme state
  const [localTheme, setLocalTheme] = useState<ThemePreferences>(
    activeClient?.theme_preferences || profile?.theme_preferences || THEME_PRESETS[0].theme
  );

  // Editable Profile state
  const [displayName, setDisplayName] = useState(
    activeClient ? (activeClient.displayName || activeClient.clientName) : (profile?.displayName || '')
  );
  const [bio, setBio] = useState(activeClient ? (activeClient.bio || '') : (profile?.bio || ''));
  const [avatarUrl, setAvatarUrl] = useState(activeClient ? (activeClient.avatarUrl || '') : (profile?.avatarUrl || ''));

  // Editable vCard state
  const [vcardForm, setVcardForm] = useState<VCardDetails>(
    activeClient?.vcard_details || profile?.vcard_details || {
      fullName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      website: '',
      note: '',
    }
  );

  // Keep local fields in sync when active profile changes (switching between 'main' and a client)
  useEffect(() => {
    const isProfileSwitch = activeClientId !== lastLoadedProfileIdRef.current;
    const isInitialLoad = !hasLoadedInitialProfileRef.current && (profile !== null || activeClient !== null);

    if (isProfileSwitch || isInitialLoad) {
      lastLoadedProfileIdRef.current = activeClientId;
      if (profile || activeClient) {
        hasLoadedInitialProfileRef.current = true;
      }

      if (activeClientId === 'main') {
        if (profile) {
          if (profile.theme_preferences) setLocalTheme(profile.theme_preferences);
          setDisplayName(profile.displayName || '');
          setBio(profile.bio || '');
          setAvatarUrl(profile.avatarUrl || '');
          if (profile.vcard_details) setVcardForm(profile.vcard_details);
        }
      } else if (activeClient) {
        if (activeClient.theme_preferences) setLocalTheme(activeClient.theme_preferences);
        setDisplayName(activeClient.displayName || activeClient.clientName || '');
        setBio(activeClient.bio || '');
        setAvatarUrl(activeClient.avatarUrl || '');
        if (activeClient.vcard_details) setVcardForm(activeClient.vcard_details);
      }
    }
  }, [activeClientId, activeClient, profile]);

  // Auth redirection & Admin Guard
  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/auth?mode=signin');
    } else if (!loading && currentUser && !isAdmin) {
      // Non-admin users are strictly routed to their client portal
      navigate(`/client/${profile?.assignedProfileId || ''}`);
    } else if (!loading && currentUser && !profile?.username) {
      navigate('/onboarding');
    }
  }, [currentUser, profile, loading, isAdmin, navigate]);

  // Username availability check debouncer for new client
  useEffect(() => {
    if (!newClientUsername.trim()) {
      setNewClientUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setNewClientUsernameChecking(true);
      const isFree = await checkUsernameAvailable(newClientUsername);
      setNewClientUsernameAvailable(isFree);
      setNewClientUsernameChecking(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [newClientUsername]);

  // Current active handle & public URL
  const currentUsername = activeClient ? activeClient.username : profile?.username;
  const currentCustomDomain = activeClient ? (activeClient.customDomain || profile?.customDomain) : profile?.customDomain;
  const publicUrl = currentUsername ? getPublicProfileUrl(currentUsername, currentCustomDomain) : '';

  const handleCopyPublicUrl = async () => {
    if (publicUrl) {
      const ok = await copyToClipboard(publicUrl);
      if (ok) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    }
  };

  // Open add modal
  const handleOpenAddModal = () => {
    setEditingLinkId(null);
    setLinkTitle('');
    setLinkUrl('');
    setLinkGroup(selectedGroupFilter !== 'all' ? selectedGroupFilter : '');
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setLinkTitle(link.title);
    setLinkUrl(link.url);
    setLinkGroup(link.group_name || '');
    setIsAddModalOpen(true);
  };

  // Submit link add/edit
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    setLinkSaving(true);
    try {
      const finalUrl = formatExternalUrl(linkUrl);

      if (editingLinkId) {
        await updateLink(editingLinkId, {
          title: linkTitle.trim(),
          url: finalUrl,
          group_name: linkGroup.trim(),
        });
      } else {
        await addLink({
          title: linkTitle.trim(),
          url: finalUrl,
          group_name: linkGroup.trim(),
        });
      }
      setIsAddModalOpen(false);
      setLinkTitle('');
      setLinkUrl('');
      setLinkGroup('');
      setEditingLinkId(null);
    } catch (err) {
      console.error('Error saving link:', err);
    } finally {
      setLinkSaving(false);
    }
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
          setVcardForm((prev) => ({
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
          setSaveSuccessMsg(`¡Datos y número de teléfono (${parsed.phone || 'extraído'}) importados del archivo!`);
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }
      } catch (err) {
        console.error('Error parsing .vcf file:', err);
        setSaveErrorMsg('No se pudo leer el archivo .vcf.');
        setTimeout(() => setSaveErrorMsg(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Move link up/down
  const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newList = [...links];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    await reorderLinks(newList);
  };

  // Save Appearance & Profile settings
  const handleSaveAppearance = async () => {
    setIsSavingAppearance(true);
    setSaveErrorMsg(null);
    try {
      if (activeClientId === 'main') {
        await updateFullProfile({
          theme_preferences: localTheme,
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
          vcard_details: vcardForm,
        });
      } else if (activeClient) {
        await updateClient(activeClient.id, {
          theme_preferences: localTheme,
          displayName: displayName.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim(),
          vcard_details: vcardForm,
        });
      }
      setSaveSuccessMsg('¡Diseño, perfil y número de teléfono guardados con éxito!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save appearance:', err);
      setSaveErrorMsg('Error al guardar diseño: ' + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setSaveErrorMsg(null), 4500);
    } finally {
      setIsSavingAppearance(false);
    }
  };

  // Save vCard settings
  const handleSaveVCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVCard(true);
    setSaveErrorMsg(null);
    try {
      if (activeClientId === 'main') {
        await updateVCard(vcardForm);
      } else if (activeClient) {
        await updateClient(activeClient.id, {
          vcard_details: vcardForm,
        });
      }
      setSaveSuccessMsg('¡Tarjeta digital vCard guardada!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to save vCard:', err);
      setSaveErrorMsg('Error al guardar vCard: ' + (err instanceof Error ? err.message : String(err)));
      setTimeout(() => setSaveErrorMsg(null), 4500);
    } finally {
      setIsSavingVCard(false);
    }
  };

  // Test vCard download client-side
  const handleTestDownloadVCard = () => {
    const success = generateAndDownloadVCF(livePreviewProfile, {
      publicUrl: getPublicProfileUrl(currentUsername),
      links,
    });
    if (success) {
      setSaveSuccessMsg(`¡Ficha de contacto estándar (.vcf) de @${currentUsername} descargada!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    }
  };

  // Handle Add New Client submission
  const handleCreateNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewClientError(null);
    if (!newClientName.trim() || !newClientUsername.trim()) return;

    setNewClientSubmitting(true);
    try {
      const createdId = await addClient({
        clientName: newClientName.trim(),
        username: newClientUsername.trim(),
        clientEmail: newClientEmail.trim(),
        templateId: newClientTemplateId,
        industry: newClientIndustry.trim(),
        displayName: newClientName.trim(),
        vcard: {
          fullName: newClientName.trim(),
          company: newClientName.trim(),
          email: newClientEmail.trim(),
          phone: newClientPhone.trim(),
        },
      });

      setIsNewClientModalOpen(false);
      setNewClientName('');
      setNewClientUsername('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientTemplateId('corporate');
      setNewClientUsernameAvailable(null);

      // Immediately switch to the newly created client and go to Links tab
      setActiveClientId(createdId);
      setActiveTab('links');
      setSaveSuccessMsg(`¡Perfil de "${newClientName}" creado con plantilla lista!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      setNewClientError(err.message || 'Error al crear el cliente.');
    } finally {
      setNewClientSubmitting(false);
    }
  };

  // Handle Assign / Update Client Email
  const handleSaveAssignedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmailClient || !assignEmailInput.trim()) return;
    setAssignEmailSubmitting(true);
    setAssignEmailError(null);
    try {
      await assignClientEmail(assignEmailClient.id, assignEmailInput.trim());
      setSaveSuccessMsg(`¡Correo ${assignEmailInput.trim()} asignado a ${assignEmailClient.clientName}!`);
      setAssignEmailClient(null);
      setAssignEmailInput('');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (err: any) {
      setAssignEmailError(err.message || 'Error al asignar el correo');
    } finally {
      setAssignEmailSubmitting(false);
    }
  };

  // Handle Unlink Client Email
  const handleUnlinkEmail = async (client: ClientProfile) => {
    if (!window.confirm(`¿Desvincular el acceso del correo ${client.clientEmail} de esta tarjeta?`)) return;
    try {
      await unlinkClientEmail(client.id);
      setSaveSuccessMsg(`Correo desvinculado de ${client.clientName}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error unlinking email:', err);
    }
  };

  // Handle Edit Client Details
  const handleSaveEditedClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editClientName.trim()) return;

    try {
      await updateClient(editingClient.id, {
        clientName: editClientName.trim(),
        industry: editClientIndustry.trim(),
      });
      setEditingClient(null);
      setSaveSuccessMsg('Datos del cliente actualizados');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error updating client info:', err);
    }
  };

  // Handle Delete Client
  const handleDeleteClient = async (client: ClientProfile) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el cliente "${client.clientName}" (@${client.username})? Se liberará el enlace y se eliminarán sus enlaces.`
    );
    if (!confirmDelete) return;

    try {
      await deleteClient(client);
      if (activeClientId === client.id) {
        setActiveClientId('main');
      }
      setSaveSuccessMsg(`Cliente @${client.username} eliminado.`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Error deleting client:', err);
    }
  };

  // Active profile snapshot for live simulator preview
  const livePreviewProfile: UserProfile = {
    uid: currentUser?.uid || 'preview',
    username: currentUsername || 'username',
    email: currentUser?.email || '',
    displayName: displayName || currentUsername || 'Nombre',
    bio: bio,
    avatarUrl: avatarUrl,
    theme_preferences: localTheme,
    vcard_details: vcardForm,
  };

  // Filtered links for dashboard list
  const displayedLinks = links.filter((link) => {
    if (selectedGroupFilter === 'all') return true;
    if (selectedGroupFilter === 'ungrouped') return !link.group_name?.trim();
    return link.group_name?.trim() === selectedGroupFilter;
  });

  // Filtered clients list
  const filteredClients = clients.filter((c) => {
    const q = clientSearchQuery.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      (c.industry && c.industry.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top App Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Lumen<span className="text-sky-400">.Link</span></span>
            </Link>

            {/* Client / Profile Switcher Dropdown */}
            <div className="relative">
              <button
                id="client-switcher-btn"
                onClick={() => setIsClientSwitcherOpen(!isClientSwitcherOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  activeClientId !== 'main'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                {activeClientId !== 'main' ? (
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                )}
                <span className="max-w-[130px] sm:max-w-[170px] truncate">
                  {activeClientId !== 'main' ? activeClient?.clientName : 'Mi Perfil Principal'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Switcher Menu */}
              {isClientSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Seleccionar Cuenta / Cliente</span>
                    <span className="text-sky-400">{clients.length + 1} perfiles</span>
                  </div>

                  {/* Main Profile Option */}
                  <button
                    onClick={() => {
                      setActiveClientId('main');
                      setIsClientSwitcherOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                      activeClientId === 'main'
                        ? 'bg-sky-500/10 text-sky-300 font-bold border border-sky-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold flex-shrink-0">
                        {profile?.username?.charAt(0).toUpperCase() || 'M'}
                      </div>
                      <div className="truncate">
                        <p className="font-bold truncate">Mi Perfil Principal</p>
                        <p className="text-[10px] text-slate-400 font-mono">@{profile?.username}</p>
                      </div>
                    </div>
                    {activeClientId === 'main' && <Check className="w-4 h-4 text-sky-400" />}
                  </button>

                  {/* Clients Section */}
                  {clients.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase">
                        Clientes Administrados ({clients.length})
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {clients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setActiveClientId(c.id);
                              setIsClientSwitcherOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                              activeClientId === c.id
                                ? 'bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">
                                {c.clientName.charAt(0).toUpperCase()}
                              </div>
                              <div className="truncate">
                                <p className="font-bold truncate">{c.clientName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">@{c.username}</p>
                              </div>
                            </div>
                            {activeClientId === c.id && <Check className="w-4 h-4 text-amber-400" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons inside switcher */}
                  <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setIsClientSwitcherOpen(false);
                        setIsNewClientModalOpen(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Cliente</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsClientSwitcherOpen(false);
                        setActiveTab('clients');
                      }}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Public Link Pill for Active Profile */}
            {currentUsername && (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                <span className="text-slate-400 font-mono">lumen.link/</span>
                <span className="font-bold text-sky-400">@{currentUsername}</span>

                <button
                  id="dash-copy-url-btn"
                  onClick={handleCopyPublicUrl}
                  title="Copiar enlace público"
                  className="p-1 hover:text-white text-slate-400 transition-colors ml-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <Link
                  id="dash-view-public-page-btn"
                  to={`/${currentUsername}`}
                  title="Abrir perfil público"
                  className="p-1 hover:text-white text-slate-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Quick QR Code Button */}
            {currentUsername && (
              <button
                id="header-open-qr-modal-btn"
                type="button"
                onClick={() => {
                  setSelectedQrProfile(livePreviewProfile);
                  setIsQrModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all shadow-xs"
                title="Generar y descargar código QR de la tarjeta digital"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Código QR</span>
              </button>
            )}

            {/* Quick Standard .vcf Download Button */}
            {currentUsername && (
              <button
                id="header-download-vcf-btn"
                type="button"
                onClick={handleTestDownloadVCard}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all shadow-xs"
                title="Generar y descargar archivo estándar .vcf para guardar en la agenda telefónica"
              >
                <Contact className="w-3.5 h-3.5" />
                <span>Descargar .vcf</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <button
              id="dash-mobile-preview-toggle-btn"
              onClick={() => setShowMobilePreviewModal(true)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Vista previa</span>
            </button>

            {/* Sign Out */}
            <button
              id="dash-signout-btn"
              onClick={() => signOut()}
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-xs flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Agency Client Mode Alert Banner */}
      {activeClientId !== 'main' && activeClient && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Modo Administrador:</strong> Editando perfil de{' '}
                <strong>{activeClient.clientName}</strong> (
                <span className="font-mono">@{activeClient.username}</span>)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/client/${activeClient.id}`}
                className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all"
                title="Abrir la página exclusiva que ve este cliente"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver como Cliente</span>
              </Link>

              <button
                type="button"
                onClick={async () => {
                  const clientPortalUrl = getClientPortalUrl(activeClient.id);
                  const ok = await copyToClipboard(clientPortalUrl);
                  if (ok) {
                    setSaveSuccessMsg(`¡Enlace del portal exclusivo para "${activeClient.clientName}" copiado!`);
                    setTimeout(() => setSaveSuccessMsg(null), 3500);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1 text-xs transition-all"
                title="Copiar enlace del portal para enviárselo a tu cliente"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar Enlace Cliente</span>
              </button>

              <button
                onClick={() => setActiveClientId('main')}
                className="font-bold text-slate-400 hover:text-white flex items-center gap-1 text-[11px] ml-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver a Mi Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Error Toast */}
      {saveErrorMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3.5 xs:px-4 sm:px-6 py-5 sm:py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start pb-24 md:pb-8">
        {/* Left Column: Editor Tabs & Panels */}
        <div className="col-span-12 md:col-span-7 xl:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1 touch-pan-x scroll-smooth">
            {/* Master Clients Tab: Todos los Perfiles */}
            <button
              id="tab-clients-btn"
              onClick={() => setActiveTab('clients')}
              className={`flex-1 min-w-[125px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'clients'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Todos los Perfiles</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20 font-mono">
                {clients.length}
              </span>
            </button>

            {/* Media Tab: Foto, Tarjeta y Fondo */}
            <button
              id="tab-media-btn"
              onClick={() => setActiveTab('media')}
              className={`flex-1 min-w-[125px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'media'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Foto, Tarjeta y Fondo</span>
            </button>

            <button
              id="tab-links-btn"
              onClick={() => setActiveTab('links')}
              className={`flex-1 min-w-[105px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'links'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Enlaces</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/20">
                {links.length}
              </span>
            </button>

            <button
              id="tab-appearance-btn"
              onClick={() => setActiveTab('appearance')}
              className={`flex-1 min-w-[105px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'appearance'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Diseño</span>
            </button>

            <button
              id="tab-vcard-btn"
              onClick={() => setActiveTab('vcard')}
              className={`flex-1 min-w-[95px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'vcard'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Contact className="w-4 h-4" />
              <span>vCard</span>
            </button>

            {/* Tab Dominio Propio (White-Label Premium) */}
            <button
              id="tab-domain-btn"
              onClick={() => setActiveTab('domain')}
              className={`flex-1 min-w-[130px] py-3 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'domain'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-4 h-4 text-indigo-300" />
              <span>Dominio Propio</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                PRO
              </span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB: FOTO, TARJETA Y FONDO (100% Personalizable con subida directa) */}
          {/* ======================================================== */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="p-4 bg-sky-950/30 border border-sky-800/40 rounded-2xl text-xs text-sky-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-sky-400 mt-0.5" />
                <div>
                  <strong className="text-white block text-sm mb-0.5">
                    {activeClientId !== 'main'
                      ? `Foto, Plantilla y Fondo de ${activeClient?.clientName}`
                      : 'Foto, Plantilla y Fondo de Mi Perfil'}
                  </strong>
                  <span>
                    Sube tu foto de perfil, la plantilla o diseño de tu tarjeta digital, y la imagen de fondo con un solo clic desde tu teléfono o computadora. Todo se comprime y procesa al instante.
                  </span>
                </div>
              </div>

              {/* 1. Foto de Perfil Dropzone */}
              <ImageDropzone
                type="avatar"
                currentValue={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
                onRemove={() => setAvatarUrl('')}
                label="1. Foto de Perfil / Logotipo"
                description={
                  activeClientId !== 'main'
                    ? `Sube la foto personal o logo corporativo de ${activeClient?.clientName}`
                    : 'Sube tu foto de perfil personal o logo corporativo desde tu dispositivo'
                }
              />

              {/* 2. Plantilla de la Tarjeta Digital Dropzone */}
              <ImageDropzone
                type="card_template"
                currentValue={localTheme.cardTemplateUrl}
                onChange={(url) =>
                  setLocalTheme((prev) => ({
                    ...prev,
                    cardTemplateUrl: url,
                  }))
                }
                onRemove={() =>
                  setLocalTheme((prev) => ({
                    ...prev,
                    cardTemplateUrl: undefined,
                  }))
                }
                label="2. Plantilla de la Tarjeta Digital / Banner"
                description={
                  activeClientId !== 'main'
                    ? `Sube el diseño de tarjeta o plantilla para ${activeClient?.clientName}`
                    : 'Sube el diseño o plantilla para la tarjeta digital, banner y tarjetas desde tu dispositivo'
                }
                opacity={localTheme.cardTemplateOpacity ?? 0.95}
                onOpacityChange={(op) => setLocalTheme((prev) => ({ ...prev, cardTemplateOpacity: op }))}
              />

              {/* Plantillas prediseñadas rápidas para tarjetas */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Galería Rápida de Plantillas de Tarjetas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CURATED_CARD_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setLocalTheme((prev) => ({
                          ...prev,
                          cardTemplateUrl: undefined,
                          cardBgColor: tmpl.accent === '#eab308' ? '#2a2015' : '#1e293b',
                          cardTextColor: tmpl.textColor,
                          accentColor: tmpl.accent,
                        }));
                      }}
                      className="p-3 rounded-xl border border-slate-800 hover:border-emerald-500/60 text-left transition-all group"
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
                currentValue={localTheme.bgImageUrl}
                onChange={(url) =>
                  setLocalTheme((prev) => ({
                    ...prev,
                    bgImageUrl: url,
                    bgType: 'image',
                  }))
                }
                onRemove={() =>
                  setLocalTheme((prev) => ({
                    ...prev,
                    bgImageUrl: undefined,
                    bgType: 'solid',
                  }))
                }
                label="3. Imagen de Fondo General de la Pantalla"
                description="Sube una foto de tu negocio, oficina, textura o paisaje para el fondo completo"
                opacity={localTheme.bgImageOpacity ?? 0.85}
                onOpacityChange={(op) => setLocalTheme((prev) => ({ ...prev, bgImageOpacity: op }))}
                blur={localTheme.bgImageBlur ?? 0}
                onBlurChange={(b) => setLocalTheme((prev) => ({ ...prev, bgImageBlur: b }))}
                overlay={localTheme.bgImageOverlay ?? 'dark'}
                onOverlayChange={(ov) => setLocalTheme((prev) => ({ ...prev, bgImageOverlay: ov }))}
              />

              {/* Fondos prediseñados rápidos */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Galería de Fondos de Pantalla Prediseñados
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CURATED_BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setLocalTheme((prev) => ({
                          ...prev,
                          bgType: 'gradient',
                          bgGradient: preset.gradient,
                          bgImageUrl: undefined,
                          cardTextColor: preset.textColor,
                          cardBgColor: preset.cardBg,
                          accentColor: preset.accent,
                        }));
                      }}
                      className="p-3 rounded-xl border border-slate-800 hover:border-sky-500/60 text-left transition-all group"
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

              {/* Guardar Cambios Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Los cambios se reflejan en el simulador en tiempo real.
                </span>
                <button
                  type="button"
                  onClick={handleSaveAppearance}
                  disabled={isSavingAppearance}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isSavingAppearance ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Foto, Tarjeta y Fondo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: LINKS & GROUPS MANAGEMENT                         */}
          {/* ======================================================== */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  id="add-new-link-btn"
                  onClick={handleOpenAddModal}
                  className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Enlace</span>
                </button>

                {/* Group Filter Chips */}
                {groups.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                    <button
                      onClick={() => setSelectedGroupFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex-shrink-0 ${
                        selectedGroupFilter === 'all'
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-400 hover:text-white bg-slate-900/60'
                      }`}
                    >
                      Todos ({links.length})
                    </button>
                    {groups.map((grp) => (
                      <button
                        key={grp}
                        onClick={() => setSelectedGroupFilter(grp)}
                        className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex-shrink-0 ${
                          selectedGroupFilter === grp
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                            : 'text-slate-400 hover:text-white bg-slate-900/60'
                        }`}
                      >
                        {grp}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedGroupFilter('ungrouped')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex-shrink-0 ${
                        selectedGroupFilter === 'ungrouped'
                          ? 'bg-slate-800 text-white border border-slate-700'
                          : 'text-slate-500 hover:text-white bg-slate-900/40'
                      }`}
                    >
                      Sin grupo
                    </button>
                  </div>
                )}
              </div>

              {/* Links List */}
              <div className="space-y-3">
                {linksLoading ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Cargando enlaces...</div>
                ) : displayedLinks.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl border border-dashed border-slate-800 text-center bg-slate-900/30 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                      <Link2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {activeClientId !== 'main'
                        ? `No hay enlaces para ${activeClient?.clientName}`
                        : 'No hay enlaces agregados aún'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Agrega redes sociales, sitios web, WhatsApp, menús o tiendas para este perfil.
                    </p>
                    <button
                      onClick={handleOpenAddModal}
                      className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear primer enlace</span>
                    </button>
                  </div>
                ) : (
                  displayedLinks.map((link, index) => (
                    <div
                      key={link.id}
                      id={`dash-link-card-${link.id}`}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between gap-4 group"
                    >
                      {/* Left: Reorder Controls */}
                      <div className="flex flex-col gap-1 text-slate-500">
                        <button
                          disabled={index === 0}
                          onClick={() => handleMoveLink(index, 'up')}
                          className="p-1 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition-colors"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={index === displayedLinks.length - 1}
                          onClick={() => handleMoveLink(index, 'down')}
                          className="p-1 hover:text-white disabled:opacity-20 hover:bg-slate-800 rounded transition-colors"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{link.title}</h4>
                          {link.group_name && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-sky-400 border border-slate-700 truncate max-w-[140px]">
                              {link.group_name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate font-mono">{link.url}</p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5">
                        {/* Open / Test Link */}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-xl transition-colors"
                          title="Abrir y probar enlace en una nueva pestaña"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Active Toggle */}
                        <button
                          id={`toggle-link-${link.id}`}
                          onClick={() => toggleLinkActive(link.id, link.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            link.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {link.isActive ? 'Activo' : 'Oculto'}
                        </button>

                        <button
                          id={`edit-link-${link.id}`}
                          onClick={() => handleOpenEditModal(link)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`delete-link-${link.id}`}
                          onClick={() => deleteLink(link.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: APPEARANCE & PROFILE CUSTOMIZATION                */}
          {/* ======================================================== */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Profile Bio & Avatar Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>
                      {activeClientId !== 'main'
                        ? `Identidad de ${activeClient?.clientName}`
                        : 'Identidad del Perfil'}
                    </span>
                  </h3>

                  {/* Subir archivo .vcf con teléfono */}
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
                    <label htmlFor="dash-display-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nombre para mostrar en el perfil
                    </label>
                    <input
                      id="dash-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej. Dra. Sofía Martínez / Taco Loco"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dash-phone" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Número de Teléfono / WhatsApp</span>
                      <span className="text-[10px] text-emerald-400 font-normal">Botones de Llamar y Chat</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="dash-phone"
                        type="tel"
                        value={vcardForm.phone || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, phone: e.target.value })}
                        placeholder="+52 33 1234 5678"
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dash-avatar-url" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      URL del Logo / Foto de Perfil
                    </label>
                    <input
                      id="dash-avatar-url"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://... enlace de imagen o logo"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="dash-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Correo Electrónico de Contacto
                    </label>
                    <input
                      id="dash-email"
                      type="email"
                      value={vcardForm.email || ''}
                      onChange={(e) => setVcardForm({ ...vcardForm, email: e.target.value })}
                      placeholder="contacto@ejemplo.com"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dash-bio" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Biografía o Eslogan
                  </label>
                  <textarea
                    id="dash-bio"
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Descripción corta, horario de atención, especialidad..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Preset Themes Selector */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-400" />
                  <span>Plantillas de Temas</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = localTheme.presetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setLocalTheme({ ...preset.theme, presetId: preset.id })}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-sky-500 ring-2 ring-sky-500/20 bg-slate-800'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                        }`}
                      >
                        <div className="space-y-1">
                          <div
                            className="w-full h-8 rounded-lg mb-2 border border-black/10 flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: preset.theme.bgGradient || preset.theme.bgColor,
                              color: preset.theme.cardTextColor,
                            }}
                          >
                            Aa
                          </div>
                          <span className="text-xs font-bold text-white block truncate">{preset.name}</span>
                        </div>
                        {isSelected && (
                          <span className="mt-2 text-[10px] font-bold text-sky-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Activo
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Theme Customizer */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Ajustes Personalizados de Color y Fuente</span>
                </h3>

                {/* Color pickers */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Color de Fondo
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={localTheme.bgColor || '#0f172a'}
                        onChange={(e) =>
                          setLocalTheme({
                            ...localTheme,
                            bgColor: e.target.value,
                            bgType: 'solid',
                            bgGradient: undefined,
                            presetId: 'custom',
                          })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {localTheme.bgColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Relleno de Botón/Tarjeta
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={localTheme.cardBgColor || '#1e293b'}
                        onChange={(e) =>
                          setLocalTheme({ ...localTheme, cardBgColor: e.target.value, presetId: 'custom' })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {localTheme.cardBgColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Color de Texto
                    </label>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="color"
                        value={localTheme.cardTextColor || '#ffffff'}
                        onChange={(e) =>
                          setLocalTheme({ ...localTheme, cardTextColor: e.target.value, presetId: 'custom' })
                        }
                        className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        {localTheme.cardTextColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Typography Style */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Tipografía</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['sans', 'serif', 'mono', 'rounded'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setLocalTheme({ ...localTheme, fontStyle: f, presetId: 'custom' })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${
                          localTheme.fontStyle === f
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Style / Shape */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Forma de Botón</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'rounded-lg', label: 'Redondeado' },
                      { id: 'rounded-full', label: 'Píldora' },
                      { id: 'rounded-none', label: 'Cuadrado' },
                      { id: 'shadow-hard', label: 'Brutal' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setLocalTheme({
                            ...localTheme,
                            buttonStyle: b.id as any,
                            presetId: 'custom',
                          })
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                          localTheme.buttonStyle === b.id
                            ? 'bg-sky-500 text-slate-950 border-sky-400'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Appearance Button */}
                <button
                  id="save-appearance-btn"
                  type="button"
                  onClick={handleSaveAppearance}
                  disabled={isSavingAppearance}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {isSavingAppearance ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando diseño...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Diseño y Cambios</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: VCARD DIGITAL BUSINESS CARD BUILDER               */}
          {/* ======================================================== */}
          {activeTab === 'vcard' && (
            <div className="space-y-6">
              {/* Live QR Code Generator Card */}
              <QRCodeCard
                profile={livePreviewProfile}
                onOpenAdvancedModal={() => {
                  setSelectedQrProfile(livePreviewProfile);
                  setIsQrModalOpen(true);
                }}
              />

              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Contact className="w-5 h-5 text-sky-400" />
                      <span>Tarjeta Digital de Contacto (vCard)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Los visitantes podrán pulsar el botón "Guardar Contacto" y descargar la ficha (.vcf) directamente en su teléfono.
                    </p>
                  </div>

                  <button
                    id="test-download-vcard-btn"
                    type="button"
                    onClick={handleTestDownloadVCard}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-2 self-start"
                  >
                    <span>Probar Descarga .vcf</span>
                  </button>
                </div>

                <form onSubmit={handleSaveVCard} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vcard-fullname" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Nombre Completo <span className="text-sky-400">*</span>
                      </label>
                      <input
                        id="vcard-fullname"
                        type="text"
                        required
                        value={vcardForm.fullName || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, fullName: e.target.value })}
                        placeholder="Ej. Dra. Sofía Martínez"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="vcard-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        id="vcard-phone"
                        type="tel"
                        value={vcardForm.phone || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, phone: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vcard-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Correo de Contacto
                      </label>
                      <input
                        id="vcard-email"
                        type="email"
                        value={vcardForm.email || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, email: e.target.value })}
                        placeholder="contacto@cliente.com"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="vcard-website" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Sitio Web Oficial
                      </label>
                      <input
                        id="vcard-website"
                        type="text"
                        value={vcardForm.website || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, website: e.target.value })}
                        placeholder="www.cliente.com"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="vcard-jobtitle" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cargo / Puesto
                      </label>
                      <input
                        id="vcard-jobtitle"
                        type="text"
                        value={vcardForm.jobTitle || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, jobTitle: e.target.value })}
                        placeholder="Ej. Odontóloga Principal"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="vcard-company" className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Empresa / Marca
                      </label>
                      <input
                        id="vcard-company"
                        type="text"
                        value={vcardForm.company || ''}
                        onChange={(e) => setVcardForm({ ...vcardForm, company: e.target.value })}
                        placeholder="Ej. Clínica Dental Sonrisa"
                        className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="vcard-note" className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nota o Mensaje Adicional (opcional)
                    </label>
                    <textarea
                      id="vcard-note"
                      rows={2}
                      value={vcardForm.note || ''}
                      onChange={(e) => setVcardForm({ ...vcardForm, note: e.target.value })}
                      placeholder="Ej. Agendamiento de citas de lunes a viernes."
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    id="save-vcard-btn"
                    type="submit"
                    disabled={isSavingVCard}
                    className="w-full py-3.5 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
                  >
                    {isSavingVCard ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Guardando ficha...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar Ficha de Contacto</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: DOMINIO PERSONALIZADO (WHITE-LABEL PREMIUM)        */}
          {/* ======================================================== */}
          {activeTab === 'domain' && (
            <CustomDomainSettings
              title={
                activeClientId !== 'main'
                  ? `Dominio Personalizado para ${activeClient?.clientName}`
                  : 'Dominio Personalizado de Mi Perfil Principal'
              }
              subtitle={
                activeClientId !== 'main'
                  ? `Configura un dominio o subdominio propio exclusivo (ej. tarjeta.${activeClient?.username}.com) para tu cliente.`
                  : 'Conecta tu propio dominio web (ej. links.tudominio.com) para tu tarjeta de presentación digital.'
              }
              currentDomain={
                activeClientId !== 'main'
                  ? (activeClient?.customDomain || '')
                  : (profile?.customDomain || '')
              }
              isPremium={
                activeClientId !== 'main'
                  ? (activeClient?.isPremium ?? true)
                  : (profile?.isPremium ?? true)
              }
              onSaveDomain={async (domain, premium) => {
                if (activeClientId !== 'main' && activeClient) {
                  await updateClient(activeClient.id, {
                    customDomain: domain,
                    isPremium: premium,
                    customDomainConfig: {
                      domain,
                      status: 'pending',
                      cnameTarget: 'cname.lumen.link',
                      dnsRecordType: 'CNAME',
                      lastChecked: new Date().toISOString(),
                    },
                  });
                } else if (currentUser) {
                  await updateDoc(doc(db, 'users', currentUser.uid), {
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
                }
              }}
              onRemoveDomain={async () => {
                if (activeClientId !== 'main' && activeClient) {
                  await updateClient(activeClient.id, {
                    customDomain: '',
                    customDomainConfig: undefined,
                  });
                } else if (currentUser) {
                  await updateDoc(doc(db, 'users', currentUser.uid), {
                    customDomain: '',
                    customDomainConfig: undefined,
                    updatedAt: new Date().toISOString(),
                  });
                }
              }}
              onTogglePremium={async (premium) => {
                if (activeClientId !== 'main' && activeClient) {
                  await updateClient(activeClient.id, {
                    isPremium: premium,
                  });
                } else if (currentUser) {
                  await updateDoc(doc(db, 'users', currentUser.uid), {
                    isPremium: premium,
                    updatedAt: new Date().toISOString(),
                  });
                }
              }}
            />
          )}

          {/* ======================================================== */}
          {/* TAB 4: CLIENTS MANAGEMENT (AGENCY HUB)                   */}
          {/* ======================================================== */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              {/* Header Card & Stats */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-400" />
                      <span>Gestión de Clientes (Modo Agencia)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Crea y administra múltiples páginas de Link-in-Bio para tus clientes, cada una con su propio enlace único, enlaces, diseño y tarjeta vCard.
                    </p>
                  </div>

                  <button
                    id="open-new-client-modal-btn"
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 self-start sm:self-auto flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Cliente</span>
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400">Total Clientes</p>
                    <p className="text-2xl font-black text-amber-400 mt-1">{clients.length}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400">Perfil en Edición</p>
                    <p className="text-sm font-bold text-white mt-2 truncate">
                      {activeClientId !== 'main' ? activeClient?.clientName : 'Mi Cuenta Principal'}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
                    <p className="text-[11px] font-semibold text-slate-400">Plataforma</p>
                    <p className="text-xs font-bold text-sky-400 mt-2">Lumen.Link Multi-Tenant</p>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              {clients.length > 0 && (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Buscar clientes por nombre, usuario o categoría..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Clients List */}
              <div className="space-y-3">
                {clientsLoading ? (
                  <div className="p-8 text-center text-slate-500 text-sm">Cargando clientes...</div>
                ) : clients.length === 0 ? (
                  <div className="py-16 px-6 rounded-3xl border border-dashed border-slate-800 text-center bg-slate-900/30 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white">Aún no tienes clientes registrados</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Crea el perfil de tu primer cliente (por ejemplo un restaurante, doctor, creador o empresa) y podrás administrar sus enlaces y estilo de forma totalmente independiente.
                    </p>
                    <button
                      onClick={() => setIsNewClientModalOpen(true)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-xs font-bold text-slate-950 inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Crear mi primer cliente</span>
                    </button>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No se encontraron clientes con el término "{clientSearchQuery}".
                  </div>
                ) : (
                  <>
                    {/* Master Card for Administrator's Own Profile */}
                    <div
                      id="main-admin-profile-card"
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        activeClientId === 'main'
                          ? 'bg-sky-500/10 border-sky-500/40 ring-1 ring-sky-500/30'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {profile?.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt="Mi Perfil"
                            className="w-12 h-12 rounded-2xl object-cover border border-sky-400/50 shadow-md flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            {(profile?.displayName || profile?.username || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">
                              {profile?.displayName || 'Mi Perfil Principal'}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                              Perfil Administrador
                            </span>
                            {activeClientId === 'main' && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-400 text-slate-950">
                                Activo
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="font-mono text-sky-400 font-semibold">@{profile?.username}</span>
                            <span>&bull;</span>
                            <a
                              href={`/${profile?.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-white inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Ver página pública</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-1">
                            {profile?.bio || 'Tu tarjeta digital principal.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                        <Link
                          to={`/client/main`}
                          className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
                          title="Ver en formato página exclusiva"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Página</span>
                        </Link>

                        <button
                          onClick={() => {
                            setActiveClientId('main');
                            setActiveTab('media');
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            activeClientId === 'main'
                              ? 'bg-sky-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>{activeClientId === 'main' ? 'Editando' : 'Editar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Client Profiles */}
                    {filteredClients.map((client) => {
                      const isSelected = activeClientId === client.id;
                      const safeUsername = (client.username || client.id || '').replace(/^@/, '').trim();
                      const clientDomain = client.customDomain || profile?.customDomain;
                      const clientPublicUrl = getPublicProfileUrl(safeUsername, clientDomain);
                      const clientPortalUrl = getClientPortalUrl(client.id, clientDomain);

                      return (
                        <div
                          key={client.id}
                          id={`client-card-${client.id}`}
                          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-amber-500/5 border-amber-500/40 ring-1 ring-amber-500/20'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Left: Info */}
                          <div className="flex items-start gap-3.5">
                            {client.avatarUrl ? (
                              <img
                                src={client.avatarUrl}
                                alt={client.clientName}
                                className="w-12 h-12 rounded-2xl object-cover border border-amber-400/40 shadow-md flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 text-slate-950 font-black text-base flex items-center justify-center flex-shrink-0 shadow-md">
                                {client.clientName.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white">{client.clientName}</h4>
                                {client.industry && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                                    {client.industry}
                                  </span>
                                )}
                                {client.theme_preferences?.bgImageUrl && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                                    Fondo Personalizado
                                  </span>
                                )}
                                {client.customDomain && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 font-mono">
                                    <Globe className="w-3 h-3 text-emerald-400" />
                                    <span>{client.customDomain}</span>
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                                    Seleccionado
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                                <span className="font-mono text-sky-400 font-semibold">@{client.username}</span>
                                <span>&bull;</span>
                                <a
                                  href={clientPublicUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-white inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>Página pública</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              {/* Client Assigned Email & Registration Status */}
                              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                                {client.clientEmail ? (
                                  <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                                    <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                                    <span className="font-mono text-slate-200 text-xs">{client.clientEmail}</span>
                                    {client.clientStatus === 'active' ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 ml-1">
                                        <ShieldCheck className="w-3 h-3" /> Vinculado & Activo
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 ml-1">
                                        <AlertCircle className="w-3 h-3" /> Invitación pendiente
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAssignEmailClient(client);
                                      setAssignEmailInput('');
                                      setAssignEmailError(null);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-1 rounded-xl border border-amber-400/25 transition-all"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    <span>Asignar correo a este cliente</span>
                                  </button>
                                )}
                              </div>

                              {client.bio && (
                                <p className="text-xs text-slate-500 line-clamp-1 max-w-md pt-0.5">{client.bio}</p>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center">
                            {/* Asignar / Cambiar Correo */}
                            <button
                              type="button"
                              onClick={() => {
                                setAssignEmailClient(client);
                                setAssignEmailInput(client.clientEmail || '');
                                setAssignEmailError(null);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Asignar o cambiar el correo electrónico con el que tu cliente iniciará sesión"
                            >
                              <MailCheck className="w-4 h-4 text-amber-400" />
                              <span className="hidden xl:inline">Correo</span>
                            </button>

                            {/* Copiar invitación para WhatsApp */}
                            {client.clientEmail && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const inviteUrl = `${window.location.origin}/auth?mode=signup&email=${encodeURIComponent(client.clientEmail || '')}`;
                                  const msg = `¡Hola ${client.clientName}! Tu tarjeta digital ya fue diseñada y está lista. Accede con tu correo ${client.clientEmail} en este enlace: ${inviteUrl}`;
                                  const ok = await copyToClipboard(msg);
                                  if (ok) {
                                    setCopiedInviteMsgId(client.id);
                                    setSaveSuccessMsg(`¡Mensaje de invitación para ${client.clientName} copiado!`);
                                    setTimeout(() => {
                                      setCopiedInviteMsgId(null);
                                      setSaveSuccessMsg(null);
                                    }, 3500);
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                                title="Copiar invitación con enlace directo para WhatsApp"
                              >
                                {copiedInviteMsgId === client.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4 text-emerald-400" />}
                                <span className="hidden xl:inline">Invitar</span>
                              </button>
                            )}

                            {/* Ver como Cliente (Dedicated Client Page) */}
                            <Link
                              to={`/client/${client.id}`}
                              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 shadow-xs"
                              title="Abrir la página exclusiva que ve tu cliente (solo su perfil y su información)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Página Cliente</span>
                            </Link>

                            {/* Copiar enlace del cliente */}
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await copyToClipboard(clientPortalUrl);
                                if (ok) {
                                  setSaveSuccessMsg(`¡Enlace del portal exclusivo para "${client.clientName}" copiado!`);
                                  setTimeout(() => setSaveSuccessMsg(null), 3500);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Copiar enlace exclusivo para enviárselo a tu cliente"
                            >
                              <Copy className="w-4 h-4" />
                              <span className="hidden xl:inline">Enlace</span>
                            </button>

                            {/* Manage in Admin */}
                            <button
                              id={`manage-client-${client.id}`}
                              onClick={() => {
                                setActiveClientId(client.id);
                                setActiveTab('media');
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-amber-400 text-slate-950 shadow-md'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white'
                              }`}
                              title="Editar fotos, fondo, datos, enlaces y tarjeta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{isSelected ? 'Editando' : 'Editar'}</span>
                            </button>

                            {/* QR Modal */}
                            <button
                              id={`client-qr-${client.id}`}
                              type="button"
                              onClick={() => {
                                setSelectedQrProfile(client);
                                setIsQrModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Generar y descargar código QR de este cliente"
                            >
                              <QrCode className="w-4 h-4" />
                              <span className="hidden xl:inline">QR</span>
                            </button>

                            {/* Download standard .vcf for this client */}
                            <button
                              id={`client-vcf-${client.id}`}
                              type="button"
                              onClick={() => {
                                const success = generateAndDownloadVCF(client, {
                                  publicUrl: clientPublicUrl,
                                });
                                if (success) {
                                  setSaveSuccessMsg(`¡Ficha de contacto (.vcf) de "${client.clientName}" descargada!`);
                                  setTimeout(() => setSaveSuccessMsg(null), 3500);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Descargar ficha de contacto estándar .vcf para guardar en la agenda telefónica"
                            >
                              <Contact className="w-4 h-4" />
                              <span className="hidden xl:inline">.vcf</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteClient(client)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Live Device Simulator (Sticky on Tablet & Desktop) */}
        <div className="hidden md:block md:col-span-5 xl:col-span-5 sticky top-20 lg:top-24">
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 shadow-2xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Simulador en Tiempo Real</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {activeClientId !== 'main' ? `Cliente: @${activeClient?.username}` : 'En Vivo'}
              </span>
            </div>

            {/* Smartphone frame */}
            <div className="w-full max-w-[320px] rounded-[40px] border-[6px] border-slate-800 bg-slate-950 p-2 shadow-2xl ring-1 ring-slate-700/60">
              {/* Dynamic Island notch */}
              <div className="w-20 h-3.5 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

              {/* Viewport */}
              <div className="rounded-[30px] overflow-hidden max-h-[520px] overflow-y-auto no-scrollbar border border-slate-800">
                <ProfileView
                  profile={livePreviewProfile}
                  links={links}
                  isPreview={true}
                  onEditAvatar={() => setActiveTab('media')}
                  onEditCardTemplate={() => setActiveTab('media')}
                  onEditBackground={() => setActiveTab('media')}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-3">
              Muestra exactamente cómo se verá la página pública. Haz clic en la foto, plantilla o fondo para editar.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-sm sm:max-w-md h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl pb-safe">
            {/* Grab handle on mobile */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />
            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Simulador en Tiempo Real</span>
              </span>
              <button
                onClick={() => setShowMobilePreviewModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 sm:p-3">
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
                <ProfileView
                  profile={livePreviewProfile}
                  links={links}
                  isPreview={true}
                  onEditAvatar={() => {
                    setShowMobilePreviewModal(false);
                    setActiveTab('media');
                  }}
                  onEditCardTemplate={() => {
                    setShowMobilePreviewModal(false);
                    setActiveTab('media');
                  }}
                  onEditBackground={() => {
                    setShowMobilePreviewModal(false);
                    setActiveTab('media');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Link Modal (Mobile Bottom-Sheet & Tablet/Desktop Centered Dialog) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92dvh] overflow-y-auto pb-safe">
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingLinkId ? 'Editar Enlace' : 'Agregar Nuevo Enlace'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* Comprehensive Quick Type Presets with search & categories */}
              <LinkPresetsSelector
                selectedUrl={linkUrl}
                selectedTitle={linkTitle}
                onSelectPreset={(preset: LinkPreset) => {
                  setLinkTitle(preset.title);
                  setLinkUrl(preset.defaultUrl);
                  if (!linkGroup || linkGroup === 'Contacto' || linkGroup === 'Redes Sociales' || linkGroup === 'Opiniones & Reseñas') {
                    setLinkGroup(preset.defaultGroup);
                  }
                }}
              />

              <div>
                <label htmlFor="modal-link-title" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título del Enlace <span className="text-sky-400">*</span>
                </label>
                <input
                  id="modal-link-title"
                  type="text"
                  required
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ej. Menú del Restaurante / Chatear por WhatsApp"
                  className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-base sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="modal-link-url" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>URL, Teléfono o Enlace de Destino <span className="text-sky-400">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">https://, tel: o wa.me/</span>
                </label>
                <input
                  id="modal-link-url"
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... o +523312345678"
                  className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-base sm:text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="modal-link-group" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Grupo / Categoría (Opcional)
                </label>
                <input
                  id="modal-link-group"
                  type="text"
                  value={linkGroup}
                  onChange={(e) => setLinkGroup(e.target.value)}
                  placeholder="Ej. Redes Sociales, Servicios, Catálogo"
                  className="w-full px-3.5 py-3 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-base sm:text-sm focus:outline-none focus:border-sky-500"
                />
                {groups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-500 self-center">Existentes:</span>
                    {groups.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setLinkGroup(g)}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  id="modal-save-link-btn"
                  type="submit"
                  disabled={linkSaving}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-sky-500/20 active:scale-95"
                >
                  {linkSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{editingLinkId ? 'Actualizar' : 'Guardar Enlace'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Client Profile Wizard (Mobile Bottom-Sheet & Tablet/Desktop Dialog) */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg p-5 sm:p-8 shadow-2xl space-y-5 max-h-[92dvh] overflow-y-auto pb-safe">
            {/* Mobile drag handle */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registrar Nuevo Cliente</h3>
                  <p className="text-xs text-slate-400">Crea una página de Link-in-Bio para este negocio</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newClientError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{newClientError}</span>
              </div>
            )}

            <form onSubmit={handleCreateNewClient} className="space-y-4">
              <div>
                <label htmlFor="new-client-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del Negocio o Cliente <span className="text-amber-400">*</span>
                </label>
                <input
                  id="new-client-name"
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => {
                    setNewClientName(e.target.value);
                    if (!newClientUsername) {
                      setNewClientUsername(
                        e.target.value
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .replace(/[^a-z0-9_-]/g, '_')
                      );
                    }
                  }}
                  placeholder="Ej. Clínica Dental Sonrisa / Café Roma"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label htmlFor="new-client-username" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enlace público único (Handle) <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5 focus-within:border-amber-400 transition-all">
                  <span className="font-mono text-sm text-slate-500 select-none">lumen.link/</span>
                  <input
                    id="new-client-username"
                    type="text"
                    required
                    value={newClientUsername}
                    onChange={(e) =>
                      setNewClientUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                    }
                    placeholder="caferoma"
                    className="bg-transparent text-white font-semibold text-sm placeholder-slate-600 focus:outline-none w-full ml-1"
                  />
                  <div className="flex items-center ml-2">
                    {newClientUsernameChecking && (
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    {!newClientUsernameChecking && newClientUsernameAvailable === true && (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Disponible
                      </span>
                    )}
                    {!newClientUsernameChecking && newClientUsernameAvailable === false && (
                      <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                        <X className="w-4 h-4" /> Ocupado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="new-client-industry" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoría / Industria
                  </label>
                  <select
                    id="new-client-industry"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    <option value="Restaurante / Alimentos">Restaurante / Alimentos</option>
                    <option value="Salud y Medicina">Salud y Medicina</option>
                    <option value="Inmobiliaria">Inmobiliaria</option>
                    <option value="Servicios Profesionales">Servicios Profesionales</option>
                    <option value="Comercio / E-commerce">Comercio / E-commerce</option>
                    <option value="Creador de Contenido">Creador de Contenido</option>
                    <option value="Belleza y Estética">Belleza y Estética</option>
                    <option value="Educación / Cursos">Educación / Cursos</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="new-client-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Teléfono / WhatsApp (vCard)
                  </label>
                  <input
                    id="new-client-phone"
                    type="tel"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Client Registered Email Assignment (Optional but recommended) */}
              <div>
                <label htmlFor="new-client-email" className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Correo de Acceso del Cliente (Opcional)</span>
                  <span className="text-[10px] text-amber-400 font-semibold">Acceso automático</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="new-client-email"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="cliente@gmail.com o empresa@correo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cuando tu cliente inicie sesión o se registre con este correo, accederá automáticamente a su perfil ya hecho.
                </p>
              </div>

              {/* Premade Profile Template Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Plantilla de Perfil Ya Hecho</span>
                  <span className="text-[10px] text-sky-400 font-semibold">Incluye enlaces predefinidos</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PREMADE_PROFILE_TEMPLATES.map((tmpl) => {
                    const isSelected = newClientTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          setNewClientTemplateId(tmpl.id);
                          if (tmpl.category !== 'General') {
                            setNewClientIndustry(tmpl.category);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-white ring-1 ring-amber-400/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-base">
                              {tmpl.id === 'corporate' && '💼'}
                              {tmpl.id === 'health' && '🩺'}
                              {tmpl.id === 'restaurant' && '🍽️'}
                              {tmpl.id === 'creator' && '📱'}
                              {tmpl.id === 'realestate' && '🏠'}
                              {tmpl.id === 'blank' && '⚡'}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                          </div>
                          <p className="text-xs font-bold leading-tight line-clamp-1">{tmpl.name}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{tmpl.category}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  id="submit-new-client-btn"
                  type="submit"
                  disabled={newClientSubmitting || newClientUsernameAvailable === false}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-400/20"
                >
                  {newClientSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Crear Perfil Ya Hecho</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign / Manage Client Access Email */}
      {assignEmailClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <MailCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Gestionar Correo del Cliente</h3>
                  <p className="text-[11px] text-slate-400">Cliente: {assignEmailClient.clientName}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignEmailClient(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignEmailError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{assignEmailError}</span>
              </div>
            )}

            {/* Current status explanation */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Estado actual:</span>
                {assignEmailClient.clientEmail ? (
                  assignEmailClient.clientStatus === 'active' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Cliente Registrado & Vinculado
                    </span>
                  ) : (
                    <span className="text-amber-300 font-bold flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" /> Invitación pendiente (aún no se registra)
                    </span>
                  )
                ) : (
                  <span className="text-slate-500 font-medium text-[11px]">Sin correo asignado</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Asigna el correo con el que tu cliente iniciará sesión. Cuando se registre o entre a la plataforma, verá este perfil ya hecho de inmediato sin tener que crear nada desde cero.
              </p>
            </div>

            <form onSubmit={handleSaveAssignedEmail} className="space-y-4">
              <div>
                <label htmlFor="assign-email-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico del Cliente
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="assign-email-input"
                    type="email"
                    required
                    value={assignEmailInput}
                    onChange={(e) => setAssignEmailInput(e.target.value)}
                    placeholder="cliente@gmail.com o empresa@correo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* WhatsApp quick invite copy button */}
              {assignEmailClient.clientEmail && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                  <p className="font-semibold text-emerald-400 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> Enviar Invitación al Cliente
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Copia este mensaje preparado para enviárselo por WhatsApp o correo a tu cliente:
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      const inviteUrl = `${window.location.origin}/auth?mode=signup&email=${encodeURIComponent(assignEmailClient.clientEmail || '')}`;
                      const msg = `¡Hola ${assignEmailClient.clientName}! Tu tarjeta digital ya fue diseñada y está lista. Accede con tu correo ${assignEmailClient.clientEmail} en este enlace: ${inviteUrl}`;
                      const ok = await copyToClipboard(msg);
                      if (ok) {
                        setSaveSuccessMsg(`¡Mensaje para ${assignEmailClient.clientName} copiado!`);
                        setTimeout(() => setSaveSuccessMsg(null), 3500);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Copiar Mensaje de WhatsApp</span>
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-2">
                {assignEmailClient.clientEmail ? (
                  <button
                    type="button"
                    onClick={() => handleUnlinkEmail(assignEmailClient)}
                    className="px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    Desvincular
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignEmailClient(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={assignEmailSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/20"
                  >
                    {assignEmailSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Guardar y Asignar</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Client Basic Info */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Editar Cliente</h3>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>

            <form onSubmit={handleSaveEditedClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del Negocio
                </label>
                <input
                  type="text"
                  required
                  value={editClientName}
                  onChange={(e) => setEditClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Categoría / Industria
                </label>
                <input
                  type="text"
                  value={editClientIndustry}
                  onChange={(e) => setEditClientIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code & Digital Business Card Generator Modal */}
      {selectedQrProfile && (
        <QRCodeGeneratorModal
          isOpen={isQrModalOpen}
          onClose={() => {
            setIsQrModalOpen(false);
            setSelectedQrProfile(null);
          }}
          profile={selectedQrProfile}
          customTitle={`Código QR y Tarjeta Digital • @${selectedQrProfile.username}`}
          onSaveCardTemplate={async (url) => {
            setLocalTheme((prev) => ({ ...prev, cardTemplateUrl: url }));
            try {
              if (activeClientId === 'main') {
                await updateTheme({ ...localTheme, cardTemplateUrl: url });
              } else if (activeClient) {
                await updateClient(activeClient.id, {
                  theme_preferences: { ...localTheme, cardTemplateUrl: url },
                });
              }
              setSaveSuccessMsg('Plantilla de tarjeta guardada con éxito.');
              setTimeout(() => setSaveSuccessMsg(null), 3000);
            } catch (err) {
              console.error('Error saving template:', err);
              setSaveErrorMsg('Error al guardar plantilla: ' + (err instanceof Error ? err.message : String(err)));
              setTimeout(() => setSaveErrorMsg(null), 4000);
            }
          }}
          onSaveAvatar={async (url) => {
            setAvatarUrl(url);
            try {
              if (activeClientId === 'main') {
                await updateBasicProfile({ avatarUrl: url });
              } else if (activeClient) {
                await updateClient(activeClient.id, { avatarUrl: url });
              }
              setSaveSuccessMsg('Foto de perfil guardada con éxito.');
              setTimeout(() => setSaveSuccessMsg(null), 3000);
            } catch (err) {
              console.error('Error saving avatar:', err);
              setSaveErrorMsg('Error al guardar foto: ' + (err instanceof Error ? err.message : String(err)));
              setTimeout(() => setSaveErrorMsg(null), 4000);
            }
          }}
        />
      )}

      {/* Mobile Ergonomic Bottom Tab Bar (Thumb-Zone navigation for phones < 768px) */}
      <nav
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/90 px-2 pt-1 pb-safe flex items-center justify-around shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-xl transition-all ${
            activeTab === 'clients'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Perfiles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('media')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-xl transition-all ${
            activeTab === 'media'
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('links')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-xl transition-all ${
            activeTab === 'links'
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Link2 className="w-5 h-5 mb-0.5" />
            {links.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-sky-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                {links.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">Enlaces</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-xl transition-all ${
            activeTab === 'appearance'
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">Diseño</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMobilePreviewModal(true)}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[54px] py-1 px-1 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all font-semibold"
        >
          <div className="relative">
            <Smartphone className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] leading-tight">Simulador</span>
        </button>
      </nav>
    </div>
  );
}
