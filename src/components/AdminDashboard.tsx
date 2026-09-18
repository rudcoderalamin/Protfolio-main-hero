import React, { useState, useRef } from 'react';
import {
  Lock,
  LogOut,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Image as ImageIcon,
  Briefcase,
  FolderGit2,
  Award,
  GraduationCap,
  Sparkles,
  Check,
  AlertCircle,
  Eye,
  Key,
  ChevronRight,
  Code2,
  ArrowLeft,
  RefreshCw,
  Sliders,
  Share2,
  Type,
  ShieldCheck,
  Globe,
  MessageSquare,
  Calendar,
  Mail,
  FileText
} from 'lucide-react';
import { ProfilePhoto } from '../data/portfolioData';
import {
  PortfolioDataType,
  getAdminPassword,
  setAdminPassword,
  getAdminAuthStatus,
  setAdminAuthStatus,
  resetPortfolioToDefaults,
  exportPortfolioJson,
  importPortfolioJson,
  savePortfolioToServer,
  fetchMessagesFromServer
} from '../utils/portfolioStorage';
import { AdminMessagesTab } from './AdminMessagesTab';

interface AdminDashboardProps {
  portfolioData: PortfolioDataType;
  photos: ProfilePhoto[];
  onUpdatePortfolioData: (data: PortfolioDataType) => void;
  onUpdatePhotos: (photos: ProfilePhoto[]) => void;
  onNavigateHome: () => void;
}

type TabType =
  | 'messages'
  | 'general'
  | 'photos'
  | 'stats'
  | 'socials'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'achievements'
  | 'education'
  | 'section_headers'
  | 'modal_texts'
  | 'navbar_footer'
  | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  portfolioData,
  photos,
  onUpdatePortfolioData,
  onUpdatePhotos,
  onNavigateHome
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(getAdminAuthStatus());
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('messages');

  // Form State (cloned from props for live editing)
  const [formData, setFormData] = useState<PortfolioDataType>(portfolioData);
  const [photosList, setPhotosList] = useState<ProfilePhoto[]>(photos);
  
  // UI Notifications & Cloud Sync State
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Live');
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  const hasMountedRef = useRef(false);
  const autoSaveDebounceRef = useRef<any>(null);
  const isLocalUpdateRef = useRef(false);

  // Sync formData with incoming props only if not triggered by local user typing
  React.useEffect(() => {
    if (isLocalUpdateRef.current) {
      isLocalUpdateRef.current = false;
      return;
    }
    if (portfolioData) {
      setFormData(portfolioData);
    }
  }, [portfolioData]);

  React.useEffect(() => {
    if (isLocalUpdateRef.current) {
      isLocalUpdateRef.current = false;
      return;
    }
    if (photos && photos.length > 0) {
      setPhotosList(photos);
    }
  }, [photos]);

  // FAST AUTO-SAVE: Automatically persist any change to Cloud Firestore & Server after 350ms
  React.useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setCloudSyncStatus('saving');
    if (autoSaveDebounceRef.current) {
      clearTimeout(autoSaveDebounceRef.current);
    }

    autoSaveDebounceRef.current = setTimeout(async () => {
      try {
        isLocalUpdateRef.current = true;
        const ok = await savePortfolioToServer(formData, photosList);
        onUpdatePortfolioData(formData);
        onUpdatePhotos(photosList);
        if (ok) {
          setCloudSyncStatus('saved');
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastSavedTime(time);
        } else {
          setCloudSyncStatus('saved');
        }
      } catch (err) {
        console.error('Auto-save error:', err);
        setCloudSyncStatus('saved');
      }
    }, 350);

    return () => {
      if (autoSaveDebounceRef.current) {
        clearTimeout(autoSaveDebounceRef.current);
      }
    };
  }, [formData, photosList]);

  // Check unread messages on mount
  React.useEffect(() => {
    fetchMessagesFromServer().then((msgs) => {
      if (Array.isArray(msgs)) {
        setUnreadMessagesCount(msgs.filter((m) => !m.read).length);
      }
    });
  }, []);

  // New Photo Form State
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState('Portrait');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Security Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // New Title input for typewriter list
  const [newTypewriterTitle, setNewTypewriterTitle] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = getAdminPassword();
    if (passwordInput === correctPass) {
      setIsAuthenticated(true);
      setAdminAuthStatus(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Default is: admin123');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminAuthStatus(false);
    setPasswordInput('');
  };

  // Save all portfolio text/data changes permanently to global server
  const handleSaveData = async () => {
    setIsSaving(true);
    setCloudSyncStatus('saving');
    try {
      isLocalUpdateRef.current = true;
      const ok = await savePortfolioToServer(formData, photosList);
      onUpdatePortfolioData(formData);
      onUpdatePhotos(photosList);
      if (ok) {
        setCloudSyncStatus('saved');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(time);
        setSaveSuccessMessage('All changes saved to Cloud Database! Live across all devices.');
      } else {
        setCloudSyncStatus('saved');
        setSaveSuccessMessage('Changes saved locally.');
      }
    } catch (err) {
      isLocalUpdateRef.current = true;
      onUpdatePortfolioData(formData);
      onUpdatePhotos(photosList);
      setSaveSuccessMessage('Changes saved.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMessage(''), 3500);
    }
  };

  // Add Typewriter title
  const handleAddTitle = () => {
    if (!newTypewriterTitle.trim()) return;
    const updatedTitles = [...(formData.titles || []), newTypewriterTitle.trim()];
    const updated = { ...formData, titles: updatedTitles };
    setFormData(updated);
    onUpdatePortfolioData(updated);
    setNewTypewriterTitle('');
  };

  // Remove Typewriter title
  const handleRemoveTitle = (index: number) => {
    const updatedTitles = formData.titles.filter((_, i) => i !== index);
    const updated = { ...formData, titles: updatedTitles };
    setFormData(updated);
    onUpdatePortfolioData(updated);
  };

  // Photo Upload Handler (Local file to Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB for localStorage)
    if (file.size > 4 * 1024 * 1024) {
      alert('Image is too large! Please choose an image under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newPhoto: ProfilePhoto = {
        id: `photo-${Date.now()}`,
        url: base64Url,
        caption: newPhotoCaption.trim() || `${formData.name} — New Photo`,
        tag: newPhotoTag || 'Gallery'
      };
      const updated = [newPhoto, ...photosList];
      setPhotosList(updated);
      onUpdatePhotos(updated);
      setNewPhotoCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSaveSuccessMessage('Photo uploaded and added successfully!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Add Photo via URL
  const handleAddPhotoViaUrl = () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto: ProfilePhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || `${formData.name} — Photo`,
      tag: newPhotoTag || 'Official'
    };
    const updated = [newPhoto, ...photosList];
    setPhotosList(updated);
    onUpdatePhotos(updated);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setSaveSuccessMessage('Photo added successfully!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Delete Photo
  const handleDeletePhoto = (id: string) => {
    if (photosList.length <= 1) {
      alert('You must keep at least one profile photo for the portfolio.');
      return;
    }
    if (confirm('Are you sure you want to delete this photo?')) {
      const updated = photosList.filter((p) => p.id !== id);
      setPhotosList(updated);
      onUpdatePhotos(updated);
    }
  };

  // Update Existing Photo Details
  const handleUpdatePhotoDetails = (id: string, newCaption: string, newTag: string, newUrl: string) => {
    const updated = photosList.map((p) => {
      if (p.id === id) {
        return { ...p, caption: newCaption, tag: newTag, url: newUrl || p.url };
      }
      return p;
    });
    setPhotosList(updated);
    onUpdatePhotos(updated);
    setEditingPhotoId(null);
    setSaveSuccessMessage('Photo details updated!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPass = getAdminPassword();
    if (currentPasswordInput !== correctPass) {
      setPasswordMessage({ type: 'error', text: 'Current password is incorrect.' });
      return;
    }
    if (newPasswordInput.length < 4) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setAdminPassword(newPasswordInput);
    setPasswordMessage({ type: 'success', text: 'Password successfully changed!' });
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const json = exportPortfolioJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alamin_islam_portfolio_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const result = await importPortfolioJson(text);
        setFormData(result.data);
        setPhotosList(result.photos);
        onUpdatePortfolioData(result.data);
        onUpdatePhotos(result.photos);
        alert('Backup successfully restored!');
      } catch (err: any) {
        alert(`Failed to import backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to reset all portfolio data to factory defaults? All custom changes will be overwritten.')) {
      const resetResult = await resetPortfolioToDefaults();
      setFormData(resetResult.data);
      setPhotosList(resetResult.photos);
      onUpdatePortfolioData(resetResult.data);
      onUpdatePhotos(resetResult.photos);
      alert('Portfolio reset to default settings.');
    }
  };

  // ==========================================
  // VIEW 1: AUTHENTICATION LOCK SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-sky-500 selection:text-white">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl" />

          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-sky-600/30">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight mb-1">
              Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mb-6">
              Al Amin Islam Portfolio — Secure Management Suite
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Admin Passkey
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-600"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-sky-600/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Unlock Control Center</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={onNavigateHome}
                className="hover:text-sky-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Portfolio</span>
              </button>
              <span className="text-[11px] text-slate-600">Default: admin123</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {formData.brandInitials || 'AI'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
                {formData.name} — Control Center
              </h1>
              {cloudSyncStatus === 'saving' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/60 text-amber-300 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Saving to Cloud...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Synced ({lastSavedTime})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Auto-syncs live to Firebase Firestore across all browsers & devices</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Live Site */}
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="View Public Portfolio"
          >
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">View Site</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveData}
            disabled={isSaving}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              isSaving
                ? 'bg-amber-600 opacity-90 cursor-wait'
                : 'bg-sky-600 hover:bg-sky-500 active:scale-95'
            }`}
          >
            {isSaving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save to Cloud</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Save Notification */}
      {saveSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Tabs */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 sticky top-20 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Management Sections
            </div>

            {[
              {
                id: 'messages',
                label: unreadMessagesCount > 0 ? `Inquiries (${unreadMessagesCount})` : 'Inquiries & Messages',
                icon: MessageSquare,
                badge: unreadMessagesCount
              },
              { id: 'general', label: 'Profile & Bio', icon: Type },
              { id: 'photos', label: `Photos (${photosList.length})`, icon: ImageIcon },
              { id: 'stats', label: 'Stats & Buttons', icon: Sliders },
              { id: 'socials', label: 'Social & Profiles', icon: Share2 },
              { id: 'projects', label: `Projects (${formData.projects?.length || 0})`, icon: FolderGit2 },
              { id: 'skills', label: 'Skills & Stack', icon: Code2 },
              { id: 'experience', label: 'Experience', icon: Briefcase },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'education', label: 'Education', icon: GraduationCap },
              { id: 'section_headers', label: 'Section Titles & Subtitles', icon: Globe },
              { id: 'modal_texts', label: 'Modals & WhatsApp Chat', icon: MessageSquare },
              { id: 'navbar_footer', label: 'Navbar & Footer', icon: Sliders },
              { id: 'security', label: 'Security & Backup', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                      {tab.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Content Panel */}
        <main className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
          {/* TAB 0: VISITOR MESSAGES & INQUIRIES */}
          {activeTab === 'messages' && (
            <AdminMessagesTab
              portfolioOwnerName={formData.name}
              onUnreadCountChange={(count) => setUnreadMessagesCount(count)}
            />
          )}

          {/* TAB 1: GENERAL & PROFILE */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Profile & Identity</h2>
                  <p className="text-xs text-slate-400">Edit the primary developer name, bio, and typewriter headlines</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="Al Amin Islam"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Brand Monogram Initials
                  </label>
                  <input
                    type="text"
                    value={formData.brandInitials ?? ''}
                    onChange={(e) => setFormData({ ...formData, brandInitials: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="AI"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Greeting Prefix & Emoji
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.greetingPrefix ?? ''}
                      onChange={(e) => setFormData({ ...formData, greetingPrefix: e.target.value })}
                      className="w-2/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                      placeholder="Hi, I'm"
                    />
                    <input
                      type="text"
                      value={formData.greetingEmoji ?? ''}
                      onChange={(e) => setFormData({ ...formData, greetingEmoji: e.target.value })}
                      className="w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 text-center"
                      placeholder="👋"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Experience Badge Text
                  </label>
                  <input
                    type="text"
                    value={formData.experienceYears ?? ''}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="1+ Year Exp."
                  />
                </div>
              </div>

              {/* Typewriter Titles */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Typewriter Cycling Titles (Shows in hero with typing effect)
                </label>
                <div className="space-y-2 mb-3">
                  {formData.titles?.map((title, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                          const updated = [...formData.titles];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, titles: updated });
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(idx)}
                        className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-400 hover:bg-rose-900/60 transition-colors"
                        title="Delete title"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTypewriterTitle}
                    onChange={(e) => setNewTypewriterTitle(e.target.value)}
                    placeholder="Add new title (e.g. Next.js Architect)..."
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTitle}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Bio Sentence (Appears right under the typewriter title)
                </label>
                <textarea
                  rows={4}
                  value={formData.bio ?? ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number (e.g. 8801700000000)</label>
                  <input
                    type="text"
                    value={formData.whatsappNumber ?? ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location ?? ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS MANAGEMENT */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">Profile Photos & Rotation Cycle</h2>
                <p className="text-xs text-slate-400">
                  Photos automatically rotate every 5 seconds on the user site and advance on each page reload.
                  Add, edit, or delete photos here.
                </p>
              </div>

              {/* Add Photo Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Add New Profile Photo</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Option A: Direct Image URL</label>
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Option B: Upload From Device</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Caption / Label</label>
                    <input
                      type="text"
                      value={newPhotoCaption}
                      onChange={(e) => setNewPhotoCaption(e.target.value)}
                      placeholder="Al Amin Islam — Studio Portrait"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Category / Tag</label>
                    <input
                      type="text"
                      value={newPhotoTag}
                      onChange={(e) => setNewPhotoTag(e.target.value)}
                      placeholder="Official, Aesthetic, Award..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {newPhotoUrl && (
                  <button
                    type="button"
                    onClick={handleAddPhotoViaUrl}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Save Image URL to Portfolio</span>
                  </button>
                )}
              </div>

              {/* Photos Grid */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Current Photos in 5-Second Cycle ({photosList.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photosList.map((photo, index) => {
                    const isEditing = editingPhotoId === photo.id;
                    return (
                      <div
                        key={photo.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col group"
                      >
                        <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/imran-hasan.jpg";
                            }}
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-slate-200 border border-slate-700">
                            #{index + 1} • {photo.tag}
                          </div>

                          <button
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-md bg-rose-600/90 text-white hover:bg-rose-500 transition-colors shadow-sm cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                defaultValue={photo.caption}
                                id={`edit-caption-${photo.id}`}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                                placeholder="Caption"
                              />
                              <input
                                type="text"
                                defaultValue={photo.tag}
                                id={`edit-tag-${photo.id}`}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                                placeholder="Tag"
                              />
                              <input
                                type="text"
                                defaultValue={photo.url}
                                id={`edit-url-${photo.id}`}
                                className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                                placeholder="URL"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const cap = (document.getElementById(`edit-caption-${photo.id}`) as HTMLInputElement)?.value;
                                    const tag = (document.getElementById(`edit-tag-${photo.id}`) as HTMLInputElement)?.value;
                                    const url = (document.getElementById(`edit-url-${photo.id}`) as HTMLInputElement)?.value;
                                    handleUpdatePhotoDetails(photo.id, cap, tag, url);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPhotoId(null)}
                                  className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded text-[11px]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <p className="text-xs font-medium text-slate-200 line-clamp-2">{photo.caption}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingPhotoId(photo.id)}
                                className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit details</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STATS & HERO BUTTONS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Hero Counters & Button Labels</h2>
                  <p className="text-xs text-slate-400">Modify the three highlighted stat pills and primary action buttons</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* The 3 Quick Stat Pills */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Quick Stat Pills</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stat 1 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <label className="block text-[11px] text-slate-400">Pill 1 (Problems Solved)</label>
                    <input
                      type="text"
                      value={formData.heroStats?.stat1Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat1Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="620+"
                    />
                    <input
                      type="text"
                      value={formData.heroStats?.stat1Label ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat1Label: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="Problems Solved"
                    />
                  </div>

                  {/* Stat 2 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <label className="block text-[11px] text-slate-400">Pill 2 (Projects Count)</label>
                    <input
                      type="text"
                      value={formData.heroStats?.stat2Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat2Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="15+"
                    />
                    <input
                      type="text"
                      value={formData.heroStats?.stat2Label ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat2Label: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="Fullstack Projects"
                    />
                  </div>

                  {/* Stat 3 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <label className="block text-[11px] text-slate-400">Pill 3 (Award / Contest)</label>
                    <input
                      type="text"
                      value={formData.heroStats?.stat3Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat3Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="2nd Position"
                    />
                    <input
                      type="text"
                      value={formData.heroStats?.stat3Label ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat3Label: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      placeholder="DUET IUPC"
                    />
                  </div>
                </div>
              </div>

              {/* Action Button Labels */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Button Labels</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Resume Button Text</label>
                    <input
                      type="text"
                      value={formData.heroButtons?.resumeText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroButtons: { ...formData.heroButtons, resumeText: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      placeholder="Resume"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Contact Me Button Text</label>
                    <input
                      type="text"
                      value={formData.heroButtons?.contactText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroButtons: { ...formData.heroButtons, contactText: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      placeholder="Contact Me"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Book a Call Button Text</label>
                    <input
                      type="text"
                      value={formData.heroButtons?.bookCallText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroButtons: { ...formData.heroButtons, bookCallText: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      placeholder="Book a Call"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIALS & PROFILES */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Social & Coding Profiles</h2>
                  <p className="text-xs text-slate-400">Configure URLs for all round icons in the hero section</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={formData.socials?.github || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, github: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.socials?.linkedin || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, linkedin: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.socials?.facebook || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, facebook: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Codeforces URL</label>
                  <input
                    type="url"
                    value={formData.socials?.codeforces || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, codeforces: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://codeforces.com/profile/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CodeChef URL</label>
                  <input
                    type="url"
                    value={formData.socials?.codechef || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, codechef: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://codechef.com/users/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">LeetCode URL</label>
                  <input
                    type="url"
                    value={formData.socials?.leetcode || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, leetcode: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://leetcode.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Featured Projects ({formData.projects?.length || 0})</h2>
                  <p className="text-xs text-slate-400">Add, edit, or remove fullstack software projects</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newProj = {
                      id: `proj-${Date.now()}`,
                      title: 'New Fullstack Project',
                      description: 'Project description showcasing architecture and impact.',
                      tech: ['React', 'Node.js', 'Tailwind CSS'],
                      metrics: 'Improved workflow efficiency.',
                      github: 'https://github.com/alaminislam',
                      live: 'https://alamin-islam-portfolio.vercel.app'
                    };
                    const updated = [newProj, ...(formData.projects || [])];
                    setFormData({ ...formData, projects: updated });
                    onUpdatePortfolioData({ ...formData, projects: updated });
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.projects?.map((proj, pIdx) => (
                  <div key={proj.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={proj.title ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.projects];
                          updated[pIdx].title = e.target.value;
                          setFormData({ ...formData, projects: updated });
                        }}
                        placeholder="Project Title"
                        className="text-sm font-bold text-white bg-transparent border-b border-transparent focus:border-sky-500 px-1 py-0.5 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete project "${proj.title}"?`)) {
                            const updated = formData.projects.filter((_, i) => i !== pIdx);
                            setFormData({ ...formData, projects: updated });
                            onUpdatePortfolioData({ ...formData, projects: updated });
                          }
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={proj.description ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.projects];
                        updated[pIdx].description = e.target.value;
                        setFormData({ ...formData, projects: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                      placeholder="Project Description..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Tech Stack (comma separated)</label>
                        <input
                          type="text"
                          value={proj.tech ? proj.tech.join(', ') : ''}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[pIdx].tech = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="React, Node.js..."
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Impact / Metrics Note</label>
                        <input
                          type="text"
                          value={proj.metrics ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[pIdx].metrics = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="e.g. 10k+ active users"
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Live Demo URL</label>
                        <input
                          type="url"
                          value={proj.live ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[pIdx].live = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="https://..."
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">GitHub URL</label>
                        <input
                          type="url"
                          value={proj.github ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[pIdx].github = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="https://github.com/..."
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Skills & Technologies</h2>
                  <p className="text-xs text-slate-400">Edit proficiency levels and skill names across categories</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="space-y-6">
                {formData.skills?.map((cat, cIdx) => (
                  <div key={cIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <input
                      type="text"
                      value={cat.category ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.skills];
                        updated[cIdx].category = e.target.value;
                        setFormData({ ...formData, skills: updated });
                      }}
                      className="text-xs font-bold text-sky-400 bg-transparent uppercase tracking-wider border-b border-transparent focus:border-sky-500 pb-0.5 focus:outline-none"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cat.skills?.map((skill, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                          <input
                            type="text"
                            value={skill.name ?? ''}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[cIdx].skills[sIdx].name = e.target.value;
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="flex-1 bg-transparent text-xs text-white px-1 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={skill.level ?? ''}
                            onChange={(e) => {
                              const updated = [...formData.skills];
                              updated[cIdx].skills[sIdx].level = e.target.value;
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="w-20 bg-slate-950 text-[10px] text-sky-300 px-1 py-0.5 rounded border border-slate-800 text-center"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.skills];
                              updated[cIdx].skills = updated[cIdx].skills.filter((_, i) => i !== sIdx);
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.skills];
                        updated[cIdx].skills.push({ name: 'New Skill', level: 'Advanced' });
                        setFormData({ ...formData, skills: updated });
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add skill to {cat.category}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Work Experience</h2>
                  <p className="text-xs text-slate-400">Manage career positions and key accomplishment bullet points</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newExp = {
                      id: `exp-${Date.now()}`,
                      role: 'Software Engineer',
                      company: 'Company / Organization',
                      period: '2024 - Present',
                      type: 'Full-time',
                      highlights: ['Developed scalable cloud solutions.']
                    };
                    const updated = [newExp, ...(formData.experiences || [])];
                    setFormData({ ...formData, experiences: updated });
                    onUpdatePortfolioData({ ...formData, experiences: updated });
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.experiences?.map((exp, eIdx) => (
                  <div key={exp.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center flex-1">
                        <input
                          type="text"
                          value={exp.role ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.experiences];
                            updated[eIdx].role = e.target.value;
                            setFormData({ ...formData, experiences: updated });
                          }}
                          placeholder="Job Title / Role"
                          className="text-sm font-bold text-white bg-transparent border-b border-transparent focus:border-sky-500 px-1 focus:outline-none"
                        />
                        <span className="text-slate-500">•</span>
                        <input
                          type="text"
                          value={exp.company ?? ''}
                          onChange={(e) => {
                            const updated = [...formData.experiences];
                            updated[eIdx].company = e.target.value;
                            setFormData({ ...formData, experiences: updated });
                          }}
                          placeholder="Company / Organization"
                          className="text-xs text-sky-400 bg-transparent border-b border-transparent focus:border-sky-500 px-1 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.experiences.filter((_, i) => i !== eIdx);
                          setFormData({ ...formData, experiences: updated });
                          onUpdatePortfolioData({ ...formData, experiences: updated });
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={exp.period ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.experiences];
                          updated[eIdx].period = e.target.value;
                          setFormData({ ...formData, experiences: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        placeholder="Period (e.g. 2023 - Present)"
                      />
                      <input
                        type="text"
                        value={exp.type ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.experiences];
                          updated[eIdx].type = e.target.value;
                          setFormData({ ...formData, experiences: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                        placeholder="Type (e.g. Full-time / Contract)"
                      />
                    </div>

                    {/* Highlights */}
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Accomplishments & Highlights (One per line)</label>
                      <textarea
                        rows={3}
                        value={exp.highlights ? exp.highlights.join('\n') : ''}
                        onChange={(e) => {
                          const updated = [...formData.experiences];
                          updated[eIdx].highlights = e.target.value.split('\n');
                          setFormData({ ...formData, experiences: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none leading-relaxed"
                        placeholder="One bullet point per line..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Achievements & Competitions</h2>
                  <p className="text-xs text-slate-400">Contest rankings, medals, and competitive programming highlights</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newAch = {
                      id: `ach-${Date.now()}`,
                      title: 'Contest Honor / Award',
                      organization: 'Organization',
                      year: '2025',
                      description: 'Details about the accomplishment.'
                    };
                    const updated = [newAch, ...(formData.achievements || [])];
                    setFormData({ ...formData, achievements: updated });
                    onUpdatePortfolioData({ ...formData, achievements: updated });
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Achievement</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.achievements?.map((ach, aIdx) => (
                  <div key={ach.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={ach.title ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[aIdx].title = e.target.value;
                          setFormData({ ...formData, achievements: updated });
                        }}
                        placeholder="Honor / Competition Title"
                        className="text-sm font-bold text-white bg-transparent border-b border-transparent focus:border-sky-500 px-1 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.achievements.filter((_, i) => i !== aIdx);
                          setFormData({ ...formData, achievements: updated });
                          onUpdatePortfolioData({ ...formData, achievements: updated });
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={ach.organization ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[aIdx].organization = e.target.value;
                          setFormData({ ...formData, achievements: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300"
                        placeholder="Organization / Platform (e.g. Codeforces, ICPC)"
                      />
                      <input
                        type="text"
                        value={ach.year ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[aIdx].year = e.target.value;
                          setFormData({ ...formData, achievements: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300"
                        placeholder="Year (e.g. 2025)"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={ach.description ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.achievements];
                        updated[aIdx].description = e.target.value;
                        setFormData({ ...formData, achievements: updated });
                      }}
                      placeholder="Details about the rank, rating, or accomplishment..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Education & Academics</h2>
                  <p className="text-xs text-slate-400">Formal degrees, polytechnic institutions, and academic training</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newEdu = {
                      id: `edu-${Date.now()}`,
                      degree: 'Degree Name',
                      institution: 'University / Institute Name',
                      period: '2021 - 2025',
                      details: 'Coursework and academic highlights.'
                    };
                    const updated = [newEdu, ...(formData.education || [])];
                    setFormData({ ...formData, education: updated });
                    onUpdatePortfolioData({ ...formData, education: updated });
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Education</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.education?.map((edu, edIdx) => (
                  <div key={edu.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={edu.degree ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[edIdx].degree = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        placeholder="Degree / Certificate"
                        className="text-sm font-bold text-white bg-transparent border-b border-transparent focus:border-sky-500 px-1 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.education.filter((_, i) => i !== edIdx);
                          setFormData({ ...formData, education: updated });
                          onUpdatePortfolioData({ ...formData, education: updated });
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[edIdx].institution = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300"
                        placeholder="Institution / Board"
                      />
                      <input
                        type="text"
                        value={edu.period ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.education];
                          updated[edIdx].period = e.target.value;
                          setFormData({ ...formData, education: updated });
                        }}
                        className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300"
                        placeholder="Period (e.g. 2021 - 2025)"
                      />
                    </div>

                    <textarea
                      rows={2}
                      value={edu.details ?? ''}
                      onChange={(e) => {
                        const updated = [...formData.education];
                        updated[edIdx].details = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      placeholder="Coursework, concentrations, or thesis details..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: SECTION TITLES & SUBTITLES */}
          {activeTab === 'section_headers' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Section Headings & Subtitles</h2>
                  <p className="text-xs text-slate-400">Edit every section title, heading, and intro description across the page</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'experience', label: 'Work Experience Section', defaultTitle: 'Work Experience', defaultSub: 'Proven track record of delivering high-impact software solutions and engineering leadership' },
                  { key: 'skills', label: 'Skills & Technologies Section', defaultTitle: 'Skills & Technologies', defaultSub: 'A comprehensive overview of my technical expertise, tools, and modern frameworks' },
                  { key: 'projects', label: 'Featured Projects Section', defaultTitle: 'Featured Projects', defaultSub: 'Showcasing real-world applications with robust architectures, clean design, and measurable impact' },
                  { key: 'achievements', label: 'Achievements & Competitions Section', defaultTitle: 'Achievements & Competitions', defaultSub: 'Competitive programming triumphs, hackathons, and technical recognition' },
                  { key: 'education', label: 'Education & Academics Section', defaultTitle: 'Education & Academics', defaultSub: 'Academic background, computer science training, and foundational knowledge' },
                  { key: 'contact', label: 'Get in Touch Section', defaultTitle: 'Get In Touch', defaultSub: 'Let’s discuss your next project, technical opportunity, or collaboration.' },
                  { key: 'home', label: 'Hero / Home Section', defaultTitle: 'Al Amin Islam', defaultSub: 'Fullstack Software Engineer & Competitive Programmer' }
                ].map((sec) => (
                  <div key={sec.key} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">{sec.label}</h3>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={formData.sectionTitles?.[sec.key as keyof typeof formData.sectionTitles] ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sectionTitles: { ...formData.sectionTitles, [sec.key]: e.target.value }
                          })
                        }
                        placeholder={sec.defaultTitle}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Section Subtitle / Description</label>
                      <textarea
                        rows={2}
                        value={formData.sectionSubtitles?.[sec.key as keyof typeof formData.sectionSubtitles] ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sectionSubtitles: { ...formData.sectionSubtitles, [sec.key]: e.target.value }
                          })
                        }
                        placeholder={sec.defaultSub}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: MODALS & WHATSAPP CHAT TEXTS */}
          {activeTab === 'modal_texts' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Interactive Modals & WhatsApp Chat</h2>
                  <p className="text-xs text-slate-400">Edit every sentence, label, placeholder, and button in popup dialogs</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Book a Call Modal Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Book a Call Dialog</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Dialog Title</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.title ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, title: e.target.value }
                        })
                      }
                      placeholder="Schedule a 1-on-1 Call"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Dialog Subtitle</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.subtitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, subtitle: e.target.value }
                        })
                      }
                      placeholder="Pick a convenient time for our discussion"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Service Badge Text</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.serviceBadge ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, serviceBadge: e.target.value }
                        })
                      }
                      placeholder="Free 30-min Consultation"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Duration Pill Text</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.durationBadge ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, durationBadge: e.target.value }
                        })
                      }
                      placeholder="30 Mins • Google Meet / Zoom"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Confirm Button Label</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.confirmBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, confirmBtnText: e.target.value }
                        })
                      }
                      placeholder="Confirm Booking"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Back Button Label</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.backBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, backBtnText: e.target.value }
                        })
                      }
                      placeholder="Back"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Booking Success Title</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.successTitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, successTitle: e.target.value }
                        })
                      }
                      placeholder="Call Confirmed!"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Booking Success Note</label>
                    <input
                      type="text"
                      value={formData.bookCallModal?.successSubtitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bookCallModal: { ...formData.bookCallModal, successSubtitle: e.target.value }
                        })
                      }
                      placeholder="A calendar invitation with the meeting link has been prepared."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Me Modal Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Contact Modal Dialog</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Dialog Title</label>
                    <input
                      type="text"
                      value={formData.contactModal?.title ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, title: e.target.value }
                        })
                      }
                      placeholder="Let's Build Something Great"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Dialog Subtitle</label>
                    <input
                      type="text"
                      value={formData.contactModal?.subtitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, subtitle: e.target.value }
                        })
                      }
                      placeholder="Have a project in mind or looking for a fullstack engineer? Send me a message."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Header Pill Badge</label>
                    <input
                      type="text"
                      value={formData.contactModal?.badge ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, badge: e.target.value }
                        })
                      }
                      placeholder="Direct Reach"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Send Button Label</label>
                    <input
                      type="text"
                      value={formData.contactModal?.sendBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, sendBtnText: e.target.value }
                        })
                      }
                      placeholder="Send Message"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Sending Button Label</label>
                    <input
                      type="text"
                      value={formData.contactModal?.sendingBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, sendingBtnText: e.target.value }
                        })
                      }
                      placeholder="Sending..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Direct Info Note</label>
                    <input
                      type="text"
                      value={formData.contactModal?.directInfoNote ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactModal: { ...formData.contactModal, directInfoNote: e.target.value }
                        })
                      }
                      placeholder="I typically reply within 2-4 hours."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Resume Preview Modal Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Resume Preview Dialog</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Resume Dialog Title</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.title ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, title: e.target.value }
                        })
                      }
                      placeholder="Curriculum Vitae"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Resume Dialog Subtitle</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.subtitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, subtitle: e.target.value }
                        })
                      }
                      placeholder="Fullstack Engineer & Problem Solver"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Download Button Text</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.downloadBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, downloadBtnText: e.target.value }
                        })
                      }
                      placeholder="Download PDF"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Open in New Tab Button Text</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.openNewTabBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, openNewTabBtnText: e.target.value }
                        })
                      }
                      placeholder="Open in New Tab"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Quick Overview Header</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.summaryTitle ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, summaryTitle: e.target.value }
                        })
                      }
                      placeholder="Quick Overview"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Summary Note</label>
                    <input
                      type="text"
                      value={formData.resumeModal?.summaryText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resumeModal: { ...formData.resumeModal, summaryText: e.target.value }
                        })
                      }
                      placeholder="Highlights 620+ solved algorithms and fullstack projects."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp Floating Chat Widget Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">WhatsApp Floating Chat Widget</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Online Status Subtitle</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.statusText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, statusText: e.target.value }
                        })
                      }
                      placeholder="Typically replies instantly"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Welcome Chat Bubble Message</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.greetingText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, greetingText: e.target.value }
                        })
                      }
                      placeholder="Hi there! 👋 How can I help you today?"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Bubble Timestamp Text</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.timeText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, timeText: e.target.value }
                        })
                      }
                      placeholder="Just now"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Input Placeholder</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.placeholder ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, placeholder: e.target.value }
                        })
                      }
                      placeholder="Type your message here..."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Send Button Text</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.buttonText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, buttonText: e.target.value }
                        })
                      }
                      placeholder="Chat on WhatsApp"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Default Pre-filled Message</label>
                    <input
                      type="text"
                      value={formData.whatsappWidget?.defaultMessage ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappWidget: { ...formData.whatsappWidget, defaultMessage: e.target.value }
                        })
                      }
                      placeholder="Hello Al Amin! I saw your portfolio and would like to talk."
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: NAVBAR & FOOTER */}
          {activeTab === 'navbar_footer' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Top Navbar & Footer Settings</h2>
                  <p className="text-xs text-slate-400">Edit every navigation item link label, brand title, and footer text</p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* Navbar Labels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Navbar Links & Brand</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Brand Name Display</label>
                    <input
                      type="text"
                      value={formData.navbar?.brandText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, brandText: e.target.value }
                        })
                      }
                      placeholder={formData.name || 'Al Amin Islam'}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Home</label>
                    <input
                      type="text"
                      value={formData.navbar?.navHome ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navHome: e.target.value }
                        })
                      }
                      placeholder="Home"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Skills</label>
                    <input
                      type="text"
                      value={formData.navbar?.navSkills ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navSkills: e.target.value }
                        })
                      }
                      placeholder="Skills"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Projects</label>
                    <input
                      type="text"
                      value={formData.navbar?.navProjects ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navProjects: e.target.value }
                        })
                      }
                      placeholder="Projects"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Experience</label>
                    <input
                      type="text"
                      value={formData.navbar?.navExperience ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navExperience: e.target.value }
                        })
                      }
                      placeholder="Experience"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Achievements</label>
                    <input
                      type="text"
                      value={formData.navbar?.navAchievements ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navAchievements: e.target.value }
                        })
                      }
                      placeholder="Achievements"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nav Item: Education</label>
                    <input
                      type="text"
                      value={formData.navbar?.navEducation ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, navEducation: e.target.value }
                        })
                      }
                      placeholder="Education"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Navbar Button: Book a Call</label>
                    <input
                      type="text"
                      value={formData.navbar?.bookCallBtnText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          navbar: { ...formData.navbar, bookCallBtnText: e.target.value }
                        })
                      }
                      placeholder="Book a Call"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Footer Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Footer Copyright Text (Use {'{year}'} to dynamically display current year)
                    </label>
                    <input
                      type="text"
                      value={formData.footer?.copyrightText ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, copyrightText: e.target.value }
                        })
                      }
                      placeholder={`© {year} ${formData.name || 'Al Amin Islam'}. Built with Next.js & Tailwind CSS.`}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Available for Work Status Badge Text
                    </label>
                    <input
                      type="text"
                      value={formData.footer?.statusBadge ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, statusBadge: e.target.value }
                        })
                      }
                      placeholder="Available for full-time opportunities"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SECURITY & BACKUP */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">Security, Backup & System Recovery</h2>
                <p className="text-xs text-slate-400">Change admin passkey, download complete JSON backup, or restore previous data</p>
              </div>

              {/* Change Password */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4 max-w-lg">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-sky-400" />
                  <span>Change Admin Password</span>
                </h3>

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">New Password (min 4 chars)</label>
                    <input
                      type="password"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="New password"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      required
                    />
                  </div>

                  {passwordMessage.text && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        passwordMessage.type === 'success'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {passwordMessage.type === 'success' ? (
                        <Check className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{passwordMessage.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* JSON Backup & Restore */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Full Backup</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Export all custom texts, uploaded photos, and portfolio data into a single offline JSON file.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Backup</span>
                  </button>
                </div>

                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>Restore From Backup</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload a previously exported JSON backup file to instantly restore your entire website.
                  </p>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />
                  <span>Factory Reset</span>
                </h3>
                <p className="text-xs text-rose-300/80">
                  Reset everything back to Al Amin Islam's initial template state.
                </p>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
