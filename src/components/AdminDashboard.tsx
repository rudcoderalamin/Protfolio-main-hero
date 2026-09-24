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
  EyeOff,
  Clock,
  RotateCw,
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
  FileText,
  Database,
  Copy,
  Palette,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import { ProfilePhoto, PhotoRotationConfig } from '../data/portfolioData';
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
  fetchMessagesFromServer,
  isQuotaExceeded,
  compressImageFile
} from '../utils/portfolioStorage';
import { AdminMessagesTab } from './AdminMessagesTab';
import { THEME_PRESETS, colorToHex, generateBackgroundStyles } from '../utils/themeEngine';

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
  | 'theme'
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
  
  // UI Notifications & Direct Database Sync State
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Live');
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Default to true so background Firestore listeners or polling intervals NEVER overwrite active form edits!
  const isLocalUpdateRef = useRef(true);

  // Sync formData with incoming props only if explicitly reset or initial load
  React.useEffect(() => {
    if (isLocalUpdateRef.current) {
      return;
    }
    if (portfolioData) {
      setFormData(portfolioData);
    }
  }, [portfolioData]);

  React.useEffect(() => {
    if (isLocalUpdateRef.current) {
      return;
    }
    if (photos && photos.length > 0) {
      setPhotosList(photos);
    }
  }, [photos]);

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
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);
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

  // Save all portfolio text/data changes directly to the server database
  const handleSaveData = async () => {
    setIsSaving(true);
    setDbSyncStatus('saving');
    try {
      isLocalUpdateRef.current = true;
      await savePortfolioToServer(formData, photosList);
      onUpdatePortfolioData(formData);
      onUpdatePhotos(photosList);
      setDbSyncStatus('saved');
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(time);
      setSaveSuccessMessage('All changes saved to Supabase! Live across all devices worldwide.');
    } catch (err) {
      isLocalUpdateRef.current = true;
      onUpdatePortfolioData(formData);
      onUpdatePhotos(photosList);
      setDbSyncStatus('saved');
      setSaveSuccessMessage('Changes saved locally and synced.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccessMessage(''), 3000);
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

  // Photo Upload Handler (Local file to Compressed Base64)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image for ultra-fast storage and optimal cloud sync
      const base64Url = await compressImageFile(file, 1200, 0.85);
      const newPhoto: ProfilePhoto = {
        id: `photo-${Date.now()}`,
        url: base64Url,
        caption: newPhotoCaption.trim() || `${formData.name} — Photo ${photosList.length + 1}`,
        tag: newPhotoTag || 'Official'
      };
      const updated = [newPhoto, ...photosList];
      setPhotosList(updated);
      onUpdatePhotos(updated);
      setNewPhotoCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSaveSuccessMessage('Photo uploaded and added successfully!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch (err) {
      alert('Error reading photo image file.');
    }
  };

  // Logo Photo Upload Handler (Local file from Device to Compressed Base64)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Url = await compressImageFile(file, 400, 0.9);
      const updated = {
        ...formData,
        logoImageUrl: base64Url,
        navbar: {
          ...formData.navbar,
          logoImageUrl: base64Url
        }
      };
      setFormData(updated);
      onUpdatePortfolioData(updated);
      setSaveSuccessMessage('Logo photo uploaded successfully from device!');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    } catch (err) {
      alert('Error reading logo file.');
    }
  };

  // Favicon Upload Handler (Local file from Device to Compressed Base64)
  const handleFaviconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Url = await compressImageFile(file, 256, 0.9);
      const updated = {
        ...formData,
        faviconUrl: base64Url
      };
      setFormData(updated);
      onUpdatePortfolioData(updated);
      setSaveSuccessMessage('Favicon icon updated successfully! Browser tab icon updated.');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    } catch (err) {
      alert('Error reading favicon file.');
    }
  };

  // Remove Logo Photo & Revert to Inner Text Monogram
  const handleRemoveLogoPhoto = () => {
    const updated = {
      ...formData,
      logoImageUrl: '',
      navbar: {
        ...formData.navbar,
        logoImageUrl: ''
      }
    };
    setFormData(updated);
    onUpdatePortfolioData(updated);
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    setSaveSuccessMessage('Logo photo removed. Reverted to text monogram logo!');
    setTimeout(() => setSaveSuccessMessage(''), 3000);
  };

  // Handle Logo Inner Text / Badge Text Change
  const handleLogoBadgeTextChange = (val: string) => {
    const updated = {
      ...formData,
      brandInitials: val,
      logoBadgeText: val,
      navbar: {
        ...formData.navbar,
        logoBadgeText: val
      }
    };
    setFormData(updated);
    onUpdatePortfolioData(updated);
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

  // Update Photo Auto-Rotation Details & Badge Controller
  const handlePhotoRotationChange = (updates: Partial<PhotoRotationConfig>) => {
    const current: PhotoRotationConfig = formData.photoRotation || {
      showBadge: true,
      autoRotate: true,
      intervalSeconds: formData.autoRotateSeconds || 5,
      badgePrefix: 'Photo',
      badgeAutoRotateText: 'Auto-rotates 5s',
      badgeTooltip: 'Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload.'
    };

    const updatedRotation: PhotoRotationConfig = {
      ...current,
      ...updates
    };

    const updatedFormData = {
      ...formData,
      photoRotation: updatedRotation,
      autoRotateSeconds: updatedRotation.intervalSeconds
    };

    setFormData(updatedFormData);
    onUpdatePortfolioData(updatedFormData);
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
  const photoRotationConfig: PhotoRotationConfig = formData.photoRotation || {
    showBadge: true,
    autoRotate: true,
    intervalSeconds: formData.autoRotateSeconds || 5,
    badgePrefix: 'Photo',
    badgeAutoRotateText: 'Auto-rotates 5s',
    badgeTooltip: 'Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload.'
  };

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
              {dbSyncStatus === 'saving' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-600/60 text-amber-300 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Saving to Supabase...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-[10px] font-semibold" title="Supabase Cloud Database Active">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Supabase Synced ({lastSavedTime})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Supabase Cloud Database Connected • Live Worldwide Across All Devices</span>
            </p>
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
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95'
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
                <span>Save to Supabase</span>
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
              { id: 'navbar_footer', label: 'Logo, Navbar & Footer', icon: Sliders },
              { id: 'theme', label: 'Theme & Background', icon: Palette },
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name
                    </label>
                    {formData.name && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, name: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.name ?? ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="Al Amin Islam"
                  />
                </div>

                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <label className="block text-xs font-semibold text-slate-200">
                        Header Logo Inner Text (লোগোর ভেতরের নাম)
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {(formData.brandInitials || formData.logoBadgeText || formData.navbar?.logoBadgeText) && (
                        <button
                          type="button"
                          onClick={() => handleLogoBadgeTextChange('')}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveTab('navbar_footer')}
                        className="text-[10px] text-sky-400 hover:text-sky-300 underline"
                      >
                        Full Logo Settings →
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.navbar?.logoBadgeText ?? formData.logoBadgeText ?? formData.brandInitials ?? ''}
                      onChange={(e) => handleLogoBadgeTextChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-cyan-300 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                      placeholder="root"
                    />
                    <button
                      type="button"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="px-3 py-2 bg-sky-950/70 border border-sky-800 text-sky-300 hover:bg-sky-900/80 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors"
                      title="Upload custom logo photo from device"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Photo</span>
                    </button>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
                    {['root', 'DEV', 'AI', '</>', 'AMI', 'PRO', 'CODE'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleLogoBadgeTextChange(preset)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-700/60 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Photo status if active */}
                  {(formData.logoImageUrl || formData.navbar?.logoImageUrl) && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/50 mt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.navbar?.logoImageUrl || formData.logoImageUrl}
                          alt="Logo"
                          className="w-6 h-6 object-cover rounded border border-emerald-500/50"
                        />
                        <span className="text-[10px] text-emerald-300 font-medium">Active Photo Logo</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogoPhoto}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Greeting Prefix & Emoji
                    </label>
                    {(formData.greetingPrefix || formData.greetingEmoji) && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, greetingPrefix: '', greetingEmoji: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear Both
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Experience Badge Text
                    </label>
                    {formData.experienceYears && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, experienceYears: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.experienceYears ?? ''}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                    placeholder="1+ Year Exp."
                  />
                </div>

                {/* Photo Auto-Rotation Details Badge Quick Control */}
                <div className="sm:col-span-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <RotateCw className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-white">
                        Photo Auto-Rotation Details Badge (ফটোর নিচের ডিটেইলস ব্যাজ)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {photoRotationConfig.showBadge !== false
                          ? `Visible on site: "${photoRotationConfig.badgePrefix || 'Photo'} 1/N • ${photoRotationConfig.badgeAutoRotateText || 'Auto-rotates 5s'}"`
                          : 'Currently Hidden from visitor view'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handlePhotoRotationChange({
                          showBadge: photoRotationConfig.showBadge === false ? true : false
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        photoRotationConfig.showBadge !== false
                          ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-rose-950/60 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                      }`}
                    >
                      {photoRotationConfig.showBadge !== false ? 'Visible (Show)' : 'Hidden (Hide)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('photos')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Full Settings & Edit Text</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Typewriter Titles */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Typewriter Cycling Titles (Shows in hero with typing effect)
                  </label>
                  {(formData.titles && formData.titles.length > 0) && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, titles: [] })}
                      className="text-[10px] text-rose-400 hover:text-rose-300"
                    >
                      Clear All Titles
                    </button>
                  )}
                </div>
                <div className="space-y-2 mb-3">
                  {formData.titles?.map((title, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title ?? ''}
                        onChange={(e) => {
                          const updated = [...formData.titles];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, titles: updated });
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      {title && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.titles];
                            updated[idx] = '';
                            setFormData({ ...formData, titles: updated });
                          }}
                          className="px-2 py-1 text-[10px] bg-slate-900 border border-slate-800 rounded text-slate-400 hover:text-white"
                          title="Clear title"
                        >
                          Clear
                        </button>
                      )}
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Bio Sentence (Appears right under the typewriter title)
                  </label>
                  {formData.bio && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, bio: '' })}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Clear Bio
                    </button>
                  )}
                </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Email</label>
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, email: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={formData.email ?? ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Phone</label>
                    {formData.phone && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, phone: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.phone ?? ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">WhatsApp Number (e.g. 8801700000000)</label>
                    {formData.whatsappNumber && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, whatsappNumber: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.whatsappNumber ?? ''}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Location</label>
                    {formData.location && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, location: '' })}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Profile Photos & Rotation Cycle</h2>
                  <p className="text-xs text-slate-400">
                    Manage profile photos, auto-rotation cycle, and the photo details badge under the portrait.
                  </p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              {/* DEDICATED SECTION: PHOTO AUTO-ROTATION DETAILS & BADGE CONTROLLER */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                      <RotateCw className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          Photo Details & Auto-Rotation Badge
                        </h3>
                        {photoRotationConfig.showBadge !== false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Currently Visible (অন)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 border border-rose-600/50 text-rose-400 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Currently Hidden (অফ / লুকানো)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ফটোর নিচে যে "Photo 1/3 • Auto-rotates 5s" ডিটেইলসটি রয়েছে, তা এখান থেকে শো/হাইড বা টেক্সট এডিট করতে পারবেন।
                      </p>
                    </div>
                  </div>

                  {/* Primary Hide/Show Quick Button */}
                  <button
                    type="button"
                    onClick={() =>
                      handlePhotoRotationChange({
                        showBadge: photoRotationConfig.showBadge === false ? true : false
                      })
                    }
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                      photoRotationConfig.showBadge !== false
                        ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                        : 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/40'
                    }`}
                  >
                    {photoRotationConfig.showBadge !== false ? (
                      <>
                        <Eye className="w-4 h-4 text-emerald-400" />
                        <span>Badge is SHOWING (হাইড করতে ক্লিক করুন)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-rose-400" />
                        <span>Badge is HIDDEN (শো করতে ক্লিক করুন)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Configuration Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Toggles & Rotation Interval */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-semibold text-white">
                          Show Badge on Website (ফটোর নিচে ব্যাজ প্রদর্শন)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          টগল অন থাকলে ভিজিটররা ফটোর নিচের এই ডিটেইলস ব্যাজটি দেখতে পাবেন
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={photoRotationConfig.showBadge !== false}
                          onChange={(e) => handlePhotoRotationChange({ showBadge: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-semibold text-white">
                          Auto-Rotate Photos (অটো রোটেশন সক্রিয় রাখুন)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          নির্দিষ্ট সময় পর পর স্বয়ংক্রিয়ভাবে ছবি পরিবর্তন হবে
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={photoRotationConfig.autoRotate !== false}
                          onChange={(e) => handlePhotoRotationChange({ autoRotate: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>

                    {/* Rotation Interval Duration */}
                    <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>Rotation Interval (টাইমার)</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-sky-400">
                          {photoRotationConfig.intervalSeconds || 5}s (Seconds)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="20"
                          step="1"
                          value={photoRotationConfig.intervalSeconds || 5}
                          onChange={(e) =>
                            handlePhotoRotationChange({
                              intervalSeconds: parseInt(e.target.value, 10) || 5
                            })
                          }
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {[3, 5, 8, 10].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() =>
                              handlePhotoRotationChange({
                                intervalSeconds: sec,
                                badgeAutoRotateText: `Auto-rotates ${sec}s`
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              (photoRotationConfig.intervalSeconds || 5) === sec
                                ? 'bg-sky-600 text-white border-sky-500'
                                : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                            }`}
                          >
                            {sec}s {sec === 5 && '(Default)'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Editable Texts */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Photo Counter Prefix / Label (যেমন: "Photo" বা "ছবি")
                      </label>
                      <input
                        type="text"
                        value={photoRotationConfig.badgePrefix ?? 'Photo'}
                        onChange={(e) => handlePhotoRotationChange({ badgePrefix: e.target.value })}
                        placeholder="Photo"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        টেক্সট প্রিভিউ: {photoRotationConfig.badgePrefix || 'Photo'} 1/{photosList.length || 2}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Auto-Rotation Tag Text (যেমন: "Auto-rotates 5s" বা "৫ সেকেন্ড পর পর")
                      </label>
                      <input
                        type="text"
                        value={photoRotationConfig.badgeAutoRotateText ?? 'Auto-rotates 5s'}
                        onChange={(e) => handlePhotoRotationChange({ badgeAutoRotateText: e.target.value })}
                        placeholder="Auto-rotates 5s"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Hover Tooltip Text (মাউস হোভার করলে যা দেখাবে)
                      </label>
                      <input
                        type="text"
                        value={
                          photoRotationConfig.badgeTooltip ??
                          'Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload.'
                        }
                        onChange={(e) => handlePhotoRotationChange({ badgeTooltip: e.target.value })}
                        placeholder="Tooltip on hover"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time Preview Banner */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Live Site Preview (ওয়েবসাইটে যেমন দেখাবে)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handlePhotoRotationChange({
                          showBadge: true,
                          autoRotate: true,
                          intervalSeconds: 5,
                          badgePrefix: 'Photo',
                          badgeAutoRotateText: 'Auto-rotates 5s',
                          badgeTooltip:
                            'Click to cycle next photo manually. Automatically changes every 5 seconds & on web reload.'
                        })
                      }
                      className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                    >
                      Reset to Default (ডিফল্ট করুন)
                    </button>
                  </div>

                  <div className="py-3 px-4 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-center min-h-[56px]">
                    {photoRotationConfig.showBadge !== false ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-medium text-sky-700 shadow-2xs">
                        <RotateCw className="w-3 h-3 text-sky-500" />
                        <span>
                          {photoRotationConfig.badgePrefix ? `${photoRotationConfig.badgePrefix} ` : 'Photo '}
                          1/{photosList.length || 2}
                        </span>
                        {photoRotationConfig.badgeAutoRotateText && (
                          <span className="text-[10px] text-sky-600/90 bg-white px-2 py-0.5 rounded-full border border-sky-200 font-medium">
                            {photoRotationConfig.badgeAutoRotateText}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-rose-400/90 font-medium italic">
                        <EyeOff className="w-4 h-4 text-rose-400" />
                        <span>ব্যাজটি এখন সম্পূর্ণ HIDDEN (লুকানো)। পাবলিক সাইটে ফটোর নিচে এটি আর প্রদর্শিত হবে না।</span>
                      </div>
                    )}
                  </div>
                </div>
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
                              (e.target as HTMLImageElement).src = "/Profile-Photo.png";
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
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-slate-400">Pill 1 (Problems Solved)</label>
                      {(formData.heroStats?.stat1Value || formData.heroStats?.stat1Label) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroStats: { ...formData.heroStats, stat1Value: '', stat1Label: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.heroStats?.stat1Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat1Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
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
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                      placeholder="Problems Solved"
                    />
                  </div>

                  {/* Stat 2 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-slate-400">Pill 2 (Projects Count)</label>
                      {(formData.heroStats?.stat2Value || formData.heroStats?.stat2Label) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroStats: { ...formData.heroStats, stat2Value: '', stat2Label: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.heroStats?.stat2Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat2Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
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
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                      placeholder="Fullstack Projects"
                    />
                  </div>

                  {/* Stat 3 */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-slate-400">Pill 3 (Award / Contest)</label>
                      {(formData.heroStats?.stat3Value || formData.heroStats?.stat3Label) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroStats: { ...formData.heroStats, stat3Value: '', stat3Label: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.heroStats?.stat3Value ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          heroStats: { ...formData.heroStats, stat3Value: e.target.value }
                        })
                      }
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
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
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-sky-500"
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">Resume Button Text</label>
                      {formData.heroButtons?.resumeText && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroButtons: { ...formData.heroButtons, resumeText: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">Contact Me Button Text</label>
                      {formData.heroButtons?.contactText && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroButtons: { ...formData.heroButtons, contactText: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-slate-400">Book a Call Button Text</label>
                      {formData.heroButtons?.bookCallText && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              heroButtons: { ...formData.heroButtons, bookCallText: '' }
                            })
                          }
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      )}
                    </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                    {formData.socials?.github && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, github: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
                    {formData.socials?.linkedin && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, linkedin: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Facebook URL</label>
                    {formData.socials?.facebook && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, facebook: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Codeforces URL</label>
                    {formData.socials?.codeforces && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, codeforces: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">CodeChef URL</label>
                    {formData.socials?.codechef && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, codechef: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">LeetCode URL</label>
                    {formData.socials?.leetcode && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, leetcode: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Twitter / X URL</label>
                    {formData.socials?.twitter && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, twitter: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.socials?.twitter || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, twitter: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://x.com/..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">YouTube Channel URL</label>
                    {formData.socials?.youtube && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            socials: { ...formData.socials, youtube: '' }
                          })
                        }
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={formData.socials?.youtube || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        socials: { ...formData.socials, youtube: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    placeholder="https://youtube.com/@..."
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newProj = {
                        id: `proj-${Date.now()}`,
                        title: '',
                        description: '',
                        tech: [],
                        metrics: '',
                        github: '',
                        live: ''
                      };
                      const updated = [newProj, ...(formData.projects || [])];
                      setFormData({ ...formData, projects: updated });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Project</span>
                  </button>
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
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(!formData.projects || formData.projects.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No projects found. Click &quot;Add Blank Project&quot; to insert your portfolio projects.
                  </div>
                ) : (
                  formData.projects.map((proj, pIdx) => (
                    <div key={proj.id || pIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={proj.title ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.projects || []).map((item, i) =>
                                i === pIdx ? { ...item, title: val } : item
                              );
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="Project Title"
                            className="text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded px-2 py-1 focus:border-sky-500 focus:outline-none flex-1"
                          />
                          {proj.title && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.projects || []).map((item, i) =>
                                  i === pIdx ? { ...item, title: '' } : item
                                );
                                setFormData({ ...formData, projects: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear title"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={pIdx === 0}
                            onClick={() => {
                              if (pIdx === 0) return;
                              const updated = [...(formData.projects || [])];
                              const temp = updated[pIdx - 1];
                              updated[pIdx - 1] = updated[pIdx];
                              updated[pIdx] = temp;
                              setFormData({ ...formData, projects: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={pIdx === (formData.projects || []).length - 1}
                            onClick={() => {
                              if (pIdx === (formData.projects || []).length - 1) return;
                              const updated = [...(formData.projects || [])];
                              const temp = updated[pIdx + 1];
                              updated[pIdx + 1] = updated[pIdx];
                              updated[pIdx] = temp;
                              setFormData({ ...formData, projects: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.projects || []).filter((_, i) => i !== pIdx);
                              setFormData({ ...formData, projects: updated });
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer ml-1"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] text-slate-400">Description</label>
                          {proj.description && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.projects || []).map((item, i) =>
                                  i === pIdx ? { ...item, description: '' } : item
                                );
                                setFormData({ ...formData, projects: updated });
                              }}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              Clear text
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={proj.description ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = (formData.projects || []).map((item, i) =>
                              i === pIdx ? { ...item, description: val } : item
                            );
                            setFormData({ ...formData, projects: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                          placeholder="Project Description..."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] text-slate-500">Tech Stack (comma separated)</label>
                            {proj.tech && proj.tech.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.projects || []).map((item, i) =>
                                    i === pIdx ? { ...item, tech: [] } : item
                                  );
                                  setFormData({ ...formData, projects: updated });
                                }}
                                className="text-[9px] text-slate-400 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={proj.tech ? proj.tech.join(', ') : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.projects || []).map((item, i) =>
                                i === pIdx ? { ...item, tech: val.length > 0 ? val.split(',').map((s) => s.trim()).filter(Boolean) : [] } : item
                              );
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="React, Node.js..."
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] text-slate-500">Impact / Metrics Note</label>
                            {proj.metrics && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.projects || []).map((item, i) =>
                                    i === pIdx ? { ...item, metrics: '' } : item
                                  );
                                  setFormData({ ...formData, projects: updated });
                                }}
                                className="text-[9px] text-slate-400 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={proj.metrics ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.projects || []).map((item, i) =>
                                i === pIdx ? { ...item, metrics: val } : item
                              );
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="e.g. 10k+ active users"
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] text-slate-500">Live Demo URL</label>
                            {proj.live && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.projects || []).map((item, i) =>
                                    i === pIdx ? { ...item, live: '' } : item
                                  );
                                  setFormData({ ...formData, projects: updated });
                                }}
                                className="text-[9px] text-slate-400 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={proj.live ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.projects || []).map((item, i) =>
                                i === pIdx ? { ...item, live: val } : item
                              );
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="https://..."
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] text-slate-500">GitHub URL</label>
                            {proj.github && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.projects || []).map((item, i) =>
                                    i === pIdx ? { ...item, github: '' } : item
                                  );
                                  setFormData({ ...formData, projects: updated });
                                }}
                                className="text-[9px] text-slate-400 hover:text-white"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="url"
                            value={proj.github ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.projects || []).map((item, i) =>
                                i === pIdx ? { ...item, github: val } : item
                              );
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="https://github.com/..."
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newCat = {
                        category: '',
                        skills: [{ name: '', level: '' }]
                      };
                      const updated = [...(formData.skills || []), newCat];
                      setFormData({ ...formData, skills: updated });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Category</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newCat = {
                        category: 'New Technical Stack',
                        skills: [
                          { name: 'Primary Tech', level: 'Expert' },
                          { name: 'Secondary Tech', level: 'Intermediate' }
                        ]
                      };
                      const updated = [...(formData.skills || []), newCat];
                      setFormData({ ...formData, skills: updated });
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {(!formData.skills || formData.skills.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No skill categories configured. Click &quot;Add Blank Category&quot; to begin.
                  </div>
                ) : (
                  formData.skills.map((cat, cIdx) => (
                    <div key={cIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={cat.category ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.skills || []).map((c, i) =>
                                i === cIdx ? { ...c, category: val } : c
                              );
                              setFormData({ ...formData, skills: updated });
                            }}
                            placeholder="Category Title (e.g. Frontend & UI)"
                            className="text-xs font-bold text-sky-400 bg-slate-900 border border-slate-800 rounded px-2 py-1 uppercase tracking-wider focus:border-sky-500 focus:outline-none flex-1"
                          />
                          {cat.category && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.skills || []).map((c, i) =>
                                  i === cIdx ? { ...c, category: '' } : c
                                );
                                setFormData({ ...formData, skills: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear category name"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={cIdx === 0}
                            onClick={() => {
                              if (cIdx === 0) return;
                              const updated = [...(formData.skills || [])];
                              const temp = updated[cIdx - 1];
                              updated[cIdx - 1] = updated[cIdx];
                              updated[cIdx] = temp;
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Category Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={cIdx === (formData.skills || []).length - 1}
                            onClick={() => {
                              if (cIdx === (formData.skills || []).length - 1) return;
                              const updated = [...(formData.skills || [])];
                              const temp = updated[cIdx + 1];
                              updated[cIdx + 1] = updated[cIdx];
                              updated[cIdx] = temp;
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Category Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.skills || []).filter((_, i) => i !== cIdx);
                              setFormData({ ...formData, skills: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer ml-1"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {cat.skills?.map((skill, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
                            <input
                              type="text"
                              value={skill.name ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (formData.skills || []).map((c, i) => {
                                  if (i !== cIdx) return c;
                                  const updatedSkills = (c.skills || []).map((s, si) =>
                                    si === sIdx ? { ...s, name: val } : s
                                  );
                                  return { ...c, skills: updatedSkills };
                                });
                                setFormData({ ...formData, skills: updated });
                              }}
                              placeholder="Skill name"
                              className="flex-1 bg-transparent text-xs text-white px-1 focus:outline-none"
                            />
                            {skill.name && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.skills || []).map((c, i) => {
                                    if (i !== cIdx) return c;
                                    const updatedSkills = (c.skills || []).map((s, si) =>
                                      si === sIdx ? { ...s, name: '' } : s
                                    );
                                    return { ...c, skills: updatedSkills };
                                  });
                                  setFormData({ ...formData, skills: updated });
                                }}
                                className="text-[9px] text-slate-500 hover:text-slate-300 px-1"
                                title="Clear skill name"
                              >
                                ×
                              </button>
                            )}
                            <input
                              type="text"
                              value={skill.level ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (formData.skills || []).map((c, i) => {
                                  if (i !== cIdx) return c;
                                  const updatedSkills = (c.skills || []).map((s, si) =>
                                    si === sIdx ? { ...s, level: val } : s
                                  );
                                  return { ...c, skills: updatedSkills };
                                });
                                setFormData({ ...formData, skills: updated });
                              }}
                              placeholder="Level"
                              className="w-20 bg-slate-950 text-[10px] text-sky-300 px-1 py-0.5 rounded border border-slate-800 text-center focus:outline-none"
                            />
                            {skill.level && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.skills || []).map((c, i) => {
                                    if (i !== cIdx) return c;
                                    const updatedSkills = (c.skills || []).map((s, si) =>
                                      si === sIdx ? { ...s, level: '' } : s
                                    );
                                    return { ...c, skills: updatedSkills };
                                  });
                                  setFormData({ ...formData, skills: updated });
                                }}
                                className="text-[9px] text-slate-500 hover:text-slate-300 px-1"
                                title="Clear level"
                              >
                                ×
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.skills || []).map((c, i) => {
                                  if (i !== cIdx) return c;
                                  return { ...c, skills: (c.skills || []).filter((_, si) => si !== sIdx) };
                                });
                                setFormData({ ...formData, skills: updated });
                              }}
                              className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                              title="Delete skill"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.skills || []).map((c, i) => {
                              if (i !== cIdx) return c;
                              return { ...c, skills: [...(c.skills || []), { name: '', level: '' }] };
                            });
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Blank Skill</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.skills || []).map((c, i) => {
                              if (i !== cIdx) return c;
                              return { ...c, skills: [...(c.skills || []), { name: 'New Skill', level: 'Advanced' }] };
                            });
                            setFormData({ ...formData, skills: updated });
                          }}
                          className="text-[11px] text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Skill to {cat.category || 'Category'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newExp = {
                        id: `exp-${Date.now()}`,
                        role: '',
                        company: '',
                        period: '',
                        type: '',
                        highlights: []
                      };
                      const updated = [newExp, ...(formData.experiences || [])];
                      setFormData({ ...formData, experiences: updated });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Experience</span>
                  </button>
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
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add With Template</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(!formData.experiences || formData.experiences.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No experience records found. Click &quot;Add Blank Experience&quot; to add your career roles.
                  </div>
                ) : (
                  formData.experiences.map((exp, eIdx) => (
                    <div key={exp.id || eIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                            <input
                              type="text"
                              value={exp.role ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (formData.experiences || []).map((item, i) =>
                                  i === eIdx ? { ...item, role: val } : item
                                );
                                setFormData({ ...formData, experiences: updated });
                              }}
                              placeholder="Job Title / Role (e.g. Lead Engineer)"
                              className="text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded px-2 py-1 focus:border-sky-500 focus:outline-none w-full"
                            />
                            {exp.role && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.experiences || []).map((item, i) =>
                                    i === eIdx ? { ...item, role: '' } : item
                                  );
                                  setFormData({ ...formData, experiences: updated });
                                }}
                                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                                title="Clear role"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 flex-1 min-w-[180px]">
                            <input
                              type="text"
                              value={exp.company ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = (formData.experiences || []).map((item, i) =>
                                  i === eIdx ? { ...item, company: val } : item
                                );
                                setFormData({ ...formData, experiences: updated });
                              }}
                              placeholder="Company / Organization"
                              className="text-xs text-sky-400 bg-slate-900 border border-slate-800 rounded px-2 py-1 focus:border-sky-500 focus:outline-none w-full"
                            />
                            {exp.company && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.experiences || []).map((item, i) =>
                                    i === eIdx ? { ...item, company: '' } : item
                                  );
                                  setFormData({ ...formData, experiences: updated });
                                }}
                                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                                title="Clear company"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Reorder and Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={eIdx === 0}
                            onClick={() => {
                              if (eIdx === 0) return;
                              const updated = [...(formData.experiences || [])];
                              const temp = updated[eIdx - 1];
                              updated[eIdx - 1] = updated[eIdx];
                              updated[eIdx] = temp;
                              setFormData({ ...formData, experiences: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={eIdx === (formData.experiences || []).length - 1}
                            onClick={() => {
                              if (eIdx === (formData.experiences || []).length - 1) return;
                              const updated = [...(formData.experiences || [])];
                              const temp = updated[eIdx + 1];
                              updated[eIdx + 1] = updated[eIdx];
                              updated[eIdx] = temp;
                              setFormData({ ...formData, experiences: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.experiences || []).filter((_, i) => i !== eIdx);
                              setFormData({ ...formData, experiences: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer ml-1"
                            title="Remove experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={exp.period ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.experiences || []).map((item, i) =>
                                i === eIdx ? { ...item, period: val } : item
                              );
                              setFormData({ ...formData, experiences: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Period (e.g. 2023 - Present)"
                          />
                          {exp.period && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.experiences || []).map((item, i) =>
                                  i === eIdx ? { ...item, period: '' } : item
                                );
                                setFormData({ ...formData, experiences: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear period"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={exp.type ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.experiences || []).map((item, i) =>
                                i === eIdx ? { ...item, type: val } : item
                              );
                              setFormData({ ...formData, experiences: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-white flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Type (e.g. Full-time / Remote)"
                          />
                          {exp.type && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.experiences || []).map((item, i) =>
                                  i === eIdx ? { ...item, type: '' } : item
                                );
                                setFormData({ ...formData, experiences: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear type"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Highlights */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] text-slate-400">Accomplishments & Highlights (One per line)</label>
                          {exp.highlights && exp.highlights.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.experiences || []).map((item, i) =>
                                  i === eIdx ? { ...item, highlights: [] } : item
                                );
                                setFormData({ ...formData, experiences: updated });
                              }}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              Clear bullets
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={exp.highlights ? exp.highlights.join('\n') : ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = (formData.experiences || []).map((item, i) =>
                              i === eIdx ? { ...item, highlights: val.length > 0 ? val.split('\n') : [] } : item
                            );
                            setFormData({ ...formData, experiences: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none leading-relaxed focus:outline-none focus:border-sky-500"
                          placeholder="One bullet point per line..."
                        />
                      </div>
                    </div>
                  ))
                )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newAch = {
                        id: `ach-${Date.now()}`,
                        title: '',
                        organization: '',
                        year: '',
                        description: ''
                      };
                      const updated = [newAch, ...(formData.achievements || [])];
                      setFormData({ ...formData, achievements: updated });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Award</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newAch = {
                        id: `ach-${Date.now()}`,
                        title: 'Honor / Competition Title',
                        organization: 'Organization / Platform',
                        year: new Date().getFullYear().toString(),
                        description: 'Details about the accomplishment or rating rank.'
                      };
                      const updated = [newAch, ...(formData.achievements || [])];
                      setFormData({ ...formData, achievements: updated });
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add With Template</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(!formData.achievements || formData.achievements.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No achievements added yet. Click &quot;Add Blank Award&quot; to insert honors, contests, or hackathon awards.
                  </div>
                ) : (
                  formData.achievements.map((ach, aIdx) => (
                    <div key={ach.id || aIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={ach.title ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.achievements || []).map((item, i) =>
                                i === aIdx ? { ...item, title: val } : item
                              );
                              setFormData({ ...formData, achievements: updated });
                            }}
                            placeholder="Honor / Competition Title"
                            className="text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded px-2 py-1 focus:border-sky-500 focus:outline-none flex-1"
                          />
                          {ach.title && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.achievements || []).map((item, i) =>
                                  i === aIdx ? { ...item, title: '' } : item
                                );
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear title"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Reorder & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={aIdx === 0}
                            onClick={() => {
                              if (aIdx === 0) return;
                              const updated = [...(formData.achievements || [])];
                              const temp = updated[aIdx - 1];
                              updated[aIdx - 1] = updated[aIdx];
                              updated[aIdx] = temp;
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={aIdx === (formData.achievements || []).length - 1}
                            onClick={() => {
                              if (aIdx === (formData.achievements || []).length - 1) return;
                              const updated = [...(formData.achievements || [])];
                              const temp = updated[aIdx + 1];
                              updated[aIdx + 1] = updated[aIdx];
                              updated[aIdx] = temp;
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.achievements || []).filter((_, i) => i !== aIdx);
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer ml-1"
                            title="Remove achievement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={ach.organization ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.achievements || []).map((item, i) =>
                                i === aIdx ? { ...item, organization: val } : item
                              );
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Organization / Platform (e.g. Codeforces, ICPC)"
                          />
                          {ach.organization && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.achievements || []).map((item, i) =>
                                  i === aIdx ? { ...item, organization: '' } : item
                                );
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear organization"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={ach.year ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.achievements || []).map((item, i) =>
                                i === aIdx ? { ...item, year: val } : item
                              );
                              setFormData({ ...formData, achievements: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Year (e.g. 2025)"
                          />
                          {ach.year && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.achievements || []).map((item, i) =>
                                  i === aIdx ? { ...item, year: '' } : item
                                );
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear year"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] text-slate-400">Description & Details</label>
                          {ach.description && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.achievements || []).map((item, i) =>
                                  i === aIdx ? { ...item, description: '' } : item
                                );
                                setFormData({ ...formData, achievements: updated });
                              }}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              Clear text
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={ach.description ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = (formData.achievements || []).map((item, i) =>
                              i === aIdx ? { ...item, description: val } : item
                            );
                            setFormData({ ...formData, achievements: updated });
                          }}
                          placeholder="Details about the rank, rating, or accomplishment..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  ))
                )}
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newEdu = {
                        id: `edu-${Date.now()}`,
                        degree: '',
                        institution: '',
                        period: '',
                        details: ''
                      };
                      const updated = [newEdu, ...(formData.education || [])];
                      setFormData({ ...formData, education: updated });
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Blank Education</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newEdu = {
                        id: `edu-${Date.now()}`,
                        degree: 'Diploma in Computer Science & Technology',
                        institution: 'Polytechnic Institute',
                        period: '2021 - 2025',
                        details: 'Focused on algorithms, software architecture, and practical engineering projects.'
                      };
                      const updated = [newEdu, ...(formData.education || [])];
                      setFormData({ ...formData, education: updated });
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add With Template</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {(!formData.education || formData.education.length === 0) ? (
                  <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
                    No education records added yet. Click &quot;Add Blank Education&quot; to insert degrees or certificates.
                  </div>
                ) : (
                  formData.education.map((edu, edIdx) => (
                    <div key={edu.id || edIdx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="text"
                            value={edu.degree ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.education || []).map((item, i) =>
                                i === edIdx ? { ...item, degree: val } : item
                              );
                              setFormData({ ...formData, education: updated });
                            }}
                            placeholder="Degree / Certificate (e.g. Diploma in CST)"
                            className="text-sm font-bold text-white bg-slate-900 border border-slate-800 rounded px-2 py-1 focus:border-sky-500 focus:outline-none flex-1"
                          />
                          {edu.degree && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.education || []).map((item, i) =>
                                  i === edIdx ? { ...item, degree: '' } : item
                                );
                                setFormData({ ...formData, education: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear degree"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Reorder & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={edIdx === 0}
                            onClick={() => {
                              if (edIdx === 0) return;
                              const updated = [...(formData.education || [])];
                              const temp = updated[edIdx - 1];
                              updated[edIdx - 1] = updated[edIdx];
                              updated[edIdx] = temp;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={edIdx === (formData.education || []).length - 1}
                            onClick={() => {
                              if (edIdx === (formData.education || []).length - 1) return;
                              const updated = [...(formData.education || [])];
                              const temp = updated[edIdx + 1];
                              updated[edIdx + 1] = updated[edIdx];
                              updated[edIdx] = temp;
                              setFormData({ ...formData, education: updated });
                            }}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.education || []).filter((_, i) => i !== edIdx);
                              setFormData({ ...formData, education: updated });
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer ml-1"
                            title="Remove education"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={edu.institution ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.education || []).map((item, i) =>
                                i === edIdx ? { ...item, institution: val } : item
                              );
                              setFormData({ ...formData, education: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Institution / Board"
                          />
                          {edu.institution && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.education || []).map((item, i) =>
                                  i === edIdx ? { ...item, institution: '' } : item
                                );
                                setFormData({ ...formData, education: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear institution"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={edu.period ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = (formData.education || []).map((item, i) =>
                                i === edIdx ? { ...item, period: val } : item
                              );
                              setFormData({ ...formData, education: updated });
                            }}
                            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 flex-1 focus:outline-none focus:border-sky-500"
                            placeholder="Period (e.g. 2021 - 2025)"
                          />
                          {edu.period && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.education || []).map((item, i) =>
                                  i === edIdx ? { ...item, period: '' } : item
                                );
                                setFormData({ ...formData, education: updated });
                              }}
                              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              title="Clear period"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] text-slate-400">Details, Concentrations or Thesis</label>
                          {edu.details && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.education || []).map((item, i) =>
                                  i === edIdx ? { ...item, details: '' } : item
                                );
                                setFormData({ ...formData, education: updated });
                              }}
                              className="text-[10px] text-slate-400 hover:text-white"
                            >
                              Clear details
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={edu.details ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = (formData.education || []).map((item, i) =>
                              i === edIdx ? { ...item, details: val } : item
                            );
                            setFormData({ ...formData, education: updated });
                          }}
                          placeholder="Coursework, concentrations, or thesis details..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 resize-none focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  ))
                )}
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

              {/* WEBSITE BROWSER TAB FAVICON MANAGER (User-Requested) */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-400" />
                      <h3 className="text-sm font-bold text-white">
                        Browser Tab Favicon Icon (ব্রাউজার ট্যাব ফেভিকন আইকন)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ব্রাউজারের ট্যাবের টাইটেলের পাশে যে ফেভিকন আইকন থাকে তা পরিবর্তন করুন। ডিভাইস থেকে ছবি আপলোড করতে পারবেন অথবা সরাসরি ছবির লিঙ্ক দিতে পারবেন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-300 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      Active Favicon
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left: Input controls */}
                  <div className="space-y-4">
                    {/* Option 1: Direct Image URL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Favicon Photo URL (ফেভিকন ছবির লিঙ্ক)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={formData.faviconUrl ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...formData, faviconUrl: val };
                            setFormData(updated);
                            onUpdatePortfolioData(updated);
                          }}
                          placeholder="/Profile-Photo.png or https://..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                        />
                        {formData.faviconUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = { ...formData, faviconUrl: '/Profile-Photo.png' };
                              setFormData(updated);
                              onUpdatePortfolioData(updated);
                            }}
                            className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded shrink-0"
                            title="Reset to default favicon"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Option 2: Device File Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Or Upload Favicon Photo from Device (ডিভাইস থেকে আপলোড করুন)
                      </label>
                      <input
                        ref={faviconFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFaviconFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => faviconFileInputRef.current?.click()}
                        className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-medium text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-sky-400" />
                        <span>Choose Photo from Device / কম্পিউটার বা ফোন থেকে ছবি সিলেক্ট করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Right: Live Browser Tab Simulation Preview */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Live Browser Tab Preview (ব্রাউজার ট্যাবে যেমন দেখাবে):
                    </span>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-t-lg bg-slate-900 border border-b-0 border-slate-700 text-xs text-slate-200 max-w-[260px]">
                        <img
                          src={formData.faviconUrl || '/Profile-Photo.png'}
                          alt="Favicon"
                          className="w-4 h-4 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <span className="truncate font-medium text-[11px]">
                          {formData.name || 'Al Amin Islam'} | Fullstack Developer
                        </span>
                        <X className="w-3 h-3 text-slate-500 shrink-0 ml-auto" />
                      </div>
                      <div className="h-2 bg-slate-900 border-t border-slate-700 rounded-b-md" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      কোনো ফটো আপলোড বা ইউআরএল সেট করলেই তাৎক্ষণিকভাবে ব্রাউজার ট্যাবের আইকন পরিবর্তন হয়ে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* BRAND LOGO, MONOGRAM & PHOTO UPLOAD SECTION */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">
                        Header Logo & Brand Monogram (হেডার লোগো ও ব্র্যান্ডের নাম)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      লোগোর ভেতরের টেক্সট/কোড পরিবর্তন করুন (যেমন: root) অথবা ডিভাইস থেকে ফটো/আইকন আপলোড করুন।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(formData.logoImageUrl || formData.navbar?.logoImageUrl) ? (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Custom Photo Active
                      </span>
                    ) : (
                      <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-semibold flex items-center gap-1.5 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        Text: {formData.navbar?.logoBadgeText || formData.logoBadgeText || formData.brandInitials || 'root'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Left Column: Controls (Text + Photo Upload) */}
                  <div className="space-y-4">
                    {/* 1. Logo Inner Text / Code */}
                    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-200">
                          Logo Inner Text / Code (লোগোর ভেতরের নাম)
                        </label>
                        {(formData.navbar?.logoBadgeText || formData.logoBadgeText || formData.brandInitials) && (
                          <button
                            type="button"
                            onClick={() => handleLogoBadgeTextChange('')}
                            className="text-[10px] text-slate-400 hover:text-white transition-colors"
                          >
                            Clear Text
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formData.navbar?.logoBadgeText ?? formData.logoBadgeText ?? formData.brandInitials ?? ''}
                          onChange={(e) => handleLogoBadgeTextChange(e.target.value)}
                          placeholder="root"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      {/* Quick 1-click Preset Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-500 mr-1">Presets:</span>
                        {['root', 'DEV', 'AI', '</>', 'AMI', 'PRO', 'CODE'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleLogoBadgeTextChange(preset)}
                            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] font-mono border border-slate-700/60 transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        * যখন কোনো ফটো আপলোড থাকবে না, তখন হেডারের নিয়ন বক্সের ভিতরে এই টেক্সটটি জ্বলজ্বল করবে।
                      </p>
                    </div>

                    {/* 2. Photo Upload from Device */}
                    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-200">
                          Logo Photo / Icon (ডিভাইস থেকে ফটো আপলোড)
                        </label>
                        {(formData.logoImageUrl || formData.navbar?.logoImageUrl) && (
                          <button
                            type="button"
                            onClick={handleRemoveLogoPhoto}
                            className="inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove Photo</span>
                          </button>
                        )}
                      </div>

                      {/* Hidden File Input for Device Upload */}
                      <input
                        ref={logoFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileUpload}
                        className="hidden"
                      />

                      {/* Upload CTA or Active Photo Card */}
                      {(formData.logoImageUrl || formData.navbar?.logoImageUrl) ? (
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-emerald-900/50">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-lg overflow-hidden border-2 border-emerald-500/70 p-0.5 bg-slate-900 shrink-0">
                              <img
                                src={formData.navbar?.logoImageUrl || formData.logoImageUrl}
                                alt="Active Logo"
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>Active Logo Photo</span>
                                <Check className="w-3 h-3 text-emerald-400" />
                              </div>
                              <span className="text-[10px] text-slate-400">Showing inside neon logo box</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveLogoPhoto}
                              className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-900 text-rose-400 hover:bg-rose-900/80 transition-colors"
                              title="Delete photo and switch back to text"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="w-full py-3 px-4 border-2 border-dashed border-sky-800/80 hover:border-sky-500 rounded-xl bg-sky-950/20 hover:bg-sky-950/40 text-sky-400 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-full bg-sky-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-4 h-4 text-sky-400" />
                          </div>
                          <span className="text-xs font-bold text-white">
                            ডিভাইস থেকে ফটো আপলোড করুন (Upload from Device)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            PNG, JPG, SVG, WebP (Max 5MB)
                          </span>
                        </button>
                      )}

                      {/* Optional URL input fallback */}
                      <div className="pt-1">
                        <label className="block text-[10px] text-slate-400 mb-1">
                          অথবা অনলাইন ইমেজ লিংক দিন (Optional Image URL):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.navbar?.logoImageUrl ?? formData.logoImageUrl ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const updated = {
                                ...formData,
                                logoImageUrl: val,
                                navbar: { ...formData.navbar, logoImageUrl: val }
                              };
                              setFormData(updated);
                              onUpdatePortfolioData(updated);
                            }}
                            placeholder="https://images.unsplash.com/... or /custom-logo.png"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                          {(formData.navbar?.logoImageUrl || formData.logoImageUrl) && (
                            <button
                              type="button"
                              onClick={handleRemoveLogoPhoto}
                              className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Interactive Rotating Neon Preview & Brand Labels */}
                  <div className="space-y-4">
                    {/* Live Real-Time Interactive Rotating Neon Logo Preview */}
                    <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-slate-200">
                            Live Navbar Header Preview (রিয়েল-টাইম প্রিভিউ):
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                            Header Output
                          </span>
                        </div>

                        {/* Top Navbar Simulation Container */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-3">
                            {/* The Real Rotating Multi-Color Neon Border Badge */}
                            <div className="h-11 min-w-11 px-2 neon-rotating-logo-box shrink-0">
                              <div className={`neon-logo-inner overflow-hidden ${(formData.navbar?.logoImageUrl || formData.logoImageUrl) ? 'p-1' : 'px-2'}`}>
                                {(formData.navbar?.logoImageUrl || formData.logoImageUrl) ? (
                                  <img
                                    src={formData.navbar?.logoImageUrl || formData.logoImageUrl}
                                    alt="Logo"
                                    className="w-full h-full object-cover rounded-[10px]"
                                  />
                                ) : (
                                  <span className="neon-logo-letters font-black uppercase text-xs sm:text-sm font-mono tracking-wider">
                                    {formData.navbar?.logoBadgeText || formData.logoBadgeText || formData.brandInitials || 'root'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Name & Subtitle beside Logo */}
                            <div className="flex flex-col text-left">
                              <div className="flex items-center gap-1.5">
                                <span className="neon-live-text text-sm font-extrabold tracking-tight">
                                  {formData.navbar?.brandText || formData.name || 'Al Amin Islam'}
                                </span>
                                {formData.navbar?.showStatusDot !== false && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                {formData.navbar?.showStatusDot !== false && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                                )}
                                <span>
                                  {formData.navbar?.brandSubtitle || formData.logoSubtitle || 'Fullstack Developer'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            {(formData.navbar?.logoImageUrl || formData.logoImageUrl) ? (
                              <span className="text-emerald-400">Photo Mode</span>
                            ) : (
                              <span className="text-cyan-400">Text Mode</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Brand Title & Subtitle Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Brand Title (Header)
                          </label>
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
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Logo Subtitle / Tagline (লোগোর সাবটাইটেল / Powered by টেক্সট)
                          </label>
                          <input
                            type="text"
                            value={formData.navbar?.brandSubtitle !== undefined ? formData.navbar.brandSubtitle : (formData.logoSubtitle ?? '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({
                                ...formData,
                                logoSubtitle: val,
                                navbar: { ...formData.navbar, brandSubtitle: val }
                              });
                            }}
                            placeholder="Fullstack Developer or Powered by SITA"
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Subtitle / Powered by Link URL (নতুন ট্যাব খোলার জন্য ব্যাকগ্রাউন্ড লিংক)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="url"
                              value={formData.navbar?.brandSubtitleUrl ?? ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  navbar: { ...formData.navbar, brandSubtitleUrl: val }
                                });
                              }}
                              placeholder="https://example.com or https://sita.com"
                              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                            />
                            {Boolean(formData.navbar?.brandSubtitleUrl) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    navbar: { ...formData.navbar, brandSubtitleUrl: '' }
                                  });
                                }}
                                className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded shrink-0"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            এখানে লিংক দিলে ইউজার সাইটে সাবটাইটেল/পাওয়ারড বাই টেক্সটে ক্লিক করলে নতুন ট্যাবে লিঙ্কটি খুলে যাবে।
                          </span>
                        </div>
                      </div>

                      {/* Status Dot Toggle */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                        <span className="text-xs text-slate-300">Pulsating Active Status Dot</span>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.navbar?.showStatusDot !== false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                navbar: { ...formData.navbar, showStatusDot: e.target.checked }
                              })
                            }
                            className="w-4 h-4 rounded text-sky-600 bg-slate-950 border-slate-700 focus:ring-sky-500"
                          />
                          <span className="text-xs text-slate-400">Show Dot</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navbar Navigation Item Labels */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Navbar Links & Buttons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

              {/* Footer Section & Clickable Links & Executable Code */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Footer Settings, Clickable Links & Executable Code</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Add custom clickable links (Facebook, Developer Credits) & run custom HTML code
                  </span>
                </div>

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

                {/* Custom Clickable Footer Links (e.g. Facebook, Developed by Al Amin Islam, etc.) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                        <span>Custom Clickable Footer Links</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Add links with custom titles that directly open the URL on tap (e.g., "Facebook", "Developed by Al Amin Islam")
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const currentLinks = formData.footer?.links || [];
                        const newLink = {
                          id: `link_${Date.now()}`,
                          label: 'Developed by Al Amin Islam',
                          url: 'https://facebook.com',
                          openNewTab: true
                        };
                        setFormData({
                          ...formData,
                          footer: {
                            ...formData.footer,
                            links: [...currentLinks, newLink]
                          }
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Footer Link</span>
                    </button>
                  </div>

                  {/* Links List */}
                  {(!formData.footer?.links || formData.footer.links.length === 0) ? (
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                      No custom footer links added yet. Click &quot;Add Footer Link&quot; to insert Facebook, Developer profile, or personal social links.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.footer.links.map((link, idx) => (
                        <div
                          key={link.id || idx}
                          className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-3"
                        >
                          {/* Label input */}
                          <div className="w-full sm:w-1/3">
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Link Title / Display Text
                            </label>
                            <input
                              type="text"
                              value={link.label ?? ''}
                              onChange={(e) => {
                                const updated = (formData.footer?.links || []).map((l, i) =>
                                  i === idx ? { ...l, label: e.target.value } : l
                                );
                                setFormData({
                                  ...formData,
                                  footer: { ...formData.footer, links: updated }
                                });
                              }}
                              placeholder="e.g. Developed by Al Amin Islam"
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          {/* URL input */}
                          <div className="w-full sm:flex-1">
                            <label className="block text-[10px] text-slate-400 mb-1">
                              Target Web URL (Destination Link)
                            </label>
                            <input
                              type="text"
                              value={link.url ?? ''}
                              onChange={(e) => {
                                const updated = (formData.footer?.links || []).map((l, i) =>
                                  i === idx ? { ...l, url: e.target.value } : l
                                );
                                setFormData({
                                  ...formData,
                                  footer: { ...formData.footer, links: updated }
                                });
                              }}
                              placeholder="https://facebook.com/..."
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white focus:outline-none focus:border-sky-500"
                            />
                          </div>

                          {/* New tab checkbox */}
                          <div className="flex items-center gap-2 self-start sm:self-center mt-2 sm:mt-4">
                            <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={link.openNewTab !== false}
                                onChange={(e) => {
                                  const updated = [...(formData.footer?.links || [])];
                                  updated[idx] = { ...updated[idx], openNewTab: e.target.checked };
                                  setFormData({
                                    ...formData,
                                    footer: { ...formData.footer, links: updated }
                                  });
                                }}
                                className="w-3.5 h-3.5 rounded text-sky-600 bg-slate-950 border-slate-700"
                              />
                              <span>New Tab</span>
                            </label>
                          </div>

                          {/* Actions: Test link & Delete */}
                          <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-4">
                            {link.url && (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400"
                                title="Test Open Link"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                const updated = formData.footer?.links?.filter((_, i) => i !== idx) || [];
                                setFormData({
                                  ...formData,
                                  footer: { ...formData.footer, links: updated }
                                });
                              }}
                              className="p-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Custom HTML / Executable Code (User requested code runner) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Custom Footer Executable Code / HTML Snippet</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Write custom HTML code here to run and render directly in the footer (e.g. customized links, badges, or scripts)
                      </p>
                    </div>

                    {/* Quick Code Insert Helper Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const snippet = `<a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="font-bold text-sky-500 hover:underline">Facebook</a>`;
                          setFormData({
                            ...formData,
                            footer: {
                              ...formData.footer,
                              customHtml: (formData.footer?.customHtml ? formData.footer.customHtml + '\n' : '') + snippet
                            }
                          });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-sky-400 font-semibold"
                      >
                        + Insert Facebook Link
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const snippet = `<span>Developed by <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:underline font-bold">Al Amin Islam</a></span>`;
                          setFormData({
                            ...formData,
                            footer: {
                              ...formData.footer,
                              customHtml: (formData.footer?.customHtml ? formData.footer.customHtml + '\n' : '') + snippet
                            }
                          });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 font-semibold"
                      >
                        + Insert &quot;Developed by&quot; HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            footer: {
                              ...formData.footer,
                              customHtml: ''
                            }
                          });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-[10px] text-slate-400 hover:text-rose-300 font-semibold"
                      >
                        Clear Code
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={formData.footer?.customHtml ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, customHtml: e.target.value }
                      })
                    }
                    placeholder={`e.g. <a href="https://facebook.com/yourprofile" target="_blank" class="text-sky-400 hover:underline font-bold">Developed by Al Amin Islam</a>`}
                    className="w-full font-mono text-xs px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />

                  {formData.footer?.customHtml && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Code Live Execution Preview:
                      </span>
                      <div
                        dangerouslySetInnerHTML={{ __html: formData.footer.customHtml }}
                        className="text-xs text-slate-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: THEME & BACKGROUND (User-requested feature) */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5 text-sky-400" />
                    <span>Website Theme, Colors & Background Design</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Change website canvas colors, pattern designs (Blueprint, Cyber, Matrix, Aurora, Minimal), and light/dark modes
                  </p>
                </div>
                <button
                  onClick={handleSaveData}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Theme</span>
                </button>
              </div>

              {/* Quick 1-Click Theme Presets */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Quick 1-Click Theme Presets
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = formData.theme?.preset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            theme: {
                              ...formData.theme,
                              preset: preset.id,
                              backgroundColor: preset.bgColor,
                              patternType: preset.pattern,
                              gridColor: preset.gridColorHex,
                              patternOpacity: preset.opacity,
                              gridSize: preset.gridSize,
                              textColorMode: preset.textColorMode,
                              accentColor: preset.accent
                            }
                          });
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-500 shadow-md ring-1 ring-sky-500'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                            style={{ backgroundColor: preset.bgColor }}
                          />
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{preset.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">
                            {preset.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Theme Customizer Form */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Custom Colors & Background Patterns
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Background Color Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          formData.theme?.backgroundColor &&
                          formData.theme.backgroundColor.startsWith('#') &&
                          formData.theme.backgroundColor.length === 7
                            ? formData.theme.backgroundColor
                            : '#ffffff'
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, backgroundColor: e.target.value }
                          })
                        }
                        className="w-10 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.backgroundColor ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, backgroundColor: e.target.value }
                          })
                        }
                        placeholder="#ffffff"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-sky-500"
                      />
                      {formData.theme?.backgroundColor && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, backgroundColor: '' }
                            })
                          }
                          className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                          title="Clear field"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Accent Brand Color */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={
                          formData.theme?.accentColor &&
                          formData.theme.accentColor.startsWith('#') &&
                          formData.theme.accentColor.length === 7
                            ? formData.theme.accentColor
                            : '#0284c7'
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, accentColor: e.target.value }
                          })
                        }
                        className="w-10 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.accentColor ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, accentColor: e.target.value }
                          })
                        }
                        placeholder="#0284c7"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-sky-500"
                      />
                      {formData.theme?.accentColor && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, accentColor: '' }
                            })
                          }
                          className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                          title="Clear field"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Text Color / Canvas Mode (Light / Dark Mode) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Text & Component Color Mode
                    </label>
                    <select
                      value={formData.theme?.textColorMode || 'dark'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: {
                            ...formData.theme,
                            textColorMode: e.target.value as 'dark' | 'light'
                          }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white"
                    >
                      <option value="dark">Dark Text Mode (for light/white backgrounds)</option>
                      <option value="light">Light Text / Dark Mode (for black/dark navy backgrounds)</option>
                    </select>
                  </div>

                  {/* Pattern Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Background Pattern Style
                    </label>
                    <select
                      value={formData.theme?.patternType || 'dots'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, patternType: e.target.value }
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white"
                    >
                      <option value="dots">Modern Dot Matrix Pattern</option>
                      <option value="dots-dark">Cyber Stardust Dots</option>
                      <option value="dots-dense">Dense Tech Micropoints</option>
                      <option value="blueprint">Blueprint Technical Grid</option>
                      <option value="isometric">Diamond Isometric Mesh (45°)</option>
                      <option value="crosshairs">Technical Drafting Crosshairs</option>
                      <option value="hexagon">Futuristic Hexagon Honeycomb</option>
                      <option value="circuit">Circuit Board PCB Trace</option>
                      <option value="cyber">Cyber Matrix Digital Grid</option>
                      <option value="aurora">Cosmic Aurora Ambient Mesh</option>
                      <option value="spotlight">Focused Radial Spotlight</option>
                      <option value="obsidian">Obsidian Subtle Cyber</option>
                      <option value="minimal">Minimalist (Solid Color, No Grid)</option>
                    </select>
                  </div>

                  {/* Grid Lines / Dots Color with Quick Swatches */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Grid Lines / Pattern Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorToHex(formData.theme?.gridColor)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, gridColor: e.target.value }
                          })
                        }
                        className="w-10 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme?.gridColor ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, gridColor: e.target.value }
                          })
                        }
                        placeholder="rgba(56, 189, 248, 0.18) or #38bdf8"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                      {formData.theme?.gridColor && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, gridColor: '' }
                            })
                          }
                          className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                          title="Clear field"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {/* Quick Swatches */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {[
                        { color: '#00f0ff', label: 'Cyan' },
                        { color: '#38bdf8', label: 'Sky' },
                        { color: '#10b981', label: 'Emerald' },
                        { color: '#f43f5e', label: 'Rose' },
                        { color: '#f59e0b', label: 'Amber' },
                        { color: '#a855f7', label: 'Violet' },
                        { color: '#64748b', label: 'Slate' },
                        { color: '#ffffff', label: 'White' },
                        { color: '#090d16', label: 'Navy' }
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          title={swatch.label}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, gridColor: swatch.color }
                            })
                          }
                          className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                          style={{ backgroundColor: swatch.color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Grid Size Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Grid / Dot Spacing
                      </label>
                      <span className="text-[10px] text-sky-400 font-mono">
                        {formData.theme?.gridSize || 34}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={64}
                      value={formData.theme?.gridSize || 34}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, gridSize: Number(e.target.value) }
                        })
                      }
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                  </div>

                  {/* Background Grid Lines Opacity Slider (User Requested) */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Background Grid Lines Opacity (ব্যাকগ্রাউন্ড গার্ডের/গ্রিডের লাইনের অপাসসিটি)
                      </label>
                      <span className="text-[11px] text-sky-400 font-mono font-bold">
                        {formData.theme?.patternOpacity ?? 25}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={formData.theme?.patternOpacity ?? 25}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          theme: { ...formData.theme, patternOpacity: Number(e.target.value) }
                        })
                      }
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    {/* Quick Preset Buttons for Opacity */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {[
                        { label: '0% Off', val: 0 },
                        { label: '12% Soft', val: 12 },
                        { label: '25% Subtle', val: 25 },
                        { label: '50% Medium', val: 50 },
                        { label: '80% Bold', val: 80 },
                        { label: '100% Solid', val: 100 }
                      ].map((preset) => (
                        <button
                          key={preset.val}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, patternOpacity: preset.val }
                            })
                          }
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                            (formData.theme?.patternOpacity ?? 25) === preset.val
                              ? 'bg-sky-600 text-white font-bold'
                              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Responsive Edge RGB Blinking Lines (User Requested) */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>Edge RGB Blinking & Traveling Lines (চারদিকের আরজিবি ব্লিংক লাইন)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Device-responsive RGB blinking, pulsing and traveling laser lines on the outermost edges & sides
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.theme?.rgbBorderBlink !== false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, rgbBorderBlink: e.target.checked }
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  {/* Optional Background Photo URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Custom Background Wallpaper / Photo URL (Optional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formData.theme?.backgroundImageUrl ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            theme: { ...formData.theme, backgroundImageUrl: e.target.value }
                          })
                        }
                        placeholder="https://images.unsplash.com/... or /custom-bg.jpg"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                      {formData.theme?.backgroundImageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              theme: { ...formData.theme, backgroundImageUrl: '' }
                            })
                          }
                          className="px-2 py-1 text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                          title="Clear field"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-Time Live Preview Canvas Container */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Live Background Canvas & UI Card Preview:
                  </span>
                  <div
                    className="w-full h-44 rounded-xl border border-slate-700/60 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-inner"
                    style={{
                      ...generateBackgroundStyles(formData.theme),
                      color: formData.theme?.textColorMode === 'light' ? '#f8fafc' : '#0f172a'
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-md bg-sky-600 flex items-center justify-center text-white text-[11px] font-mono font-bold tracking-tight">
                          {formData.navbar?.logoBadgeText || formData.logoBadgeText || formData.brandInitials || 'root'}
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">
                            {formData.navbar?.brandText || formData.name || 'Root'}
                          </div>
                          <div className="text-[9px] opacity-70 leading-tight">
                            {formData.logoSubtitle || 'Software & Web Developer'}
                          </div>
                        </div>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                        style={{
                          borderColor: formData.theme?.accentColor || '#0284c7',
                          color: formData.theme?.accentColor || '#0284c7'
                        }}
                      >
                        Theme Active
                      </span>
                    </div>

                    {/* Edge RGB Lines Preview indicator inside preview box */}
                    {formData.theme?.rgbBorderBlink !== false && (
                      <>
                        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 animate-pulse pointer-events-none" />
                        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-pink-500 via-purple-500 to-cyan-400 animate-pulse pointer-events-none" />
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 animate-pulse pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 via-purple-500 to-cyan-400 animate-pulse pointer-events-none" />
                      </>
                    )}

                    <div className="flex items-center justify-center gap-3.5 my-auto relative z-10 py-1">
                      {/* Mini Avatar */}
                      <div className="relative w-12 h-12 shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden border border-white/50 bg-slate-200 shadow-sm">
                          <img
                            src={photos[0]?.url || '/Profile-Photo.png'}
                            alt="Preview"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>

                      <div className="text-left">
                        <h4 className="text-sm font-extrabold tracking-tight">
                          {formData.name || 'Al Amin Islam'}
                        </h4>
                        <p className="text-[11px] opacity-75 mt-0.5 line-clamp-1">
                          {formData.bio || 'Frontend Web Developer & Competitive Programmer'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[9px] text-sky-400 font-mono mt-0.5">
                          Grid Opacity: {formData.theme?.patternOpacity ?? 25}%
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between text-[10px] opacity-70 border-t pt-2 relative z-10"
                      style={{
                        borderColor:
                          formData.theme?.textColorMode === 'light'
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(0,0,0,0.1)'
                      }}
                    >
                      <span>
                        {formData.footer?.copyrightText?.replace(/\{year\}/g, '2026') ||
                          '© 2026 Built with Next.js & Tailwind CSS'}
                      </span>
                      <span className="font-semibold text-sky-500">
                        {formData.footer?.links?.[0]?.label || 'Developed by Al Amin Islam'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SECURITY & BACKUP */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white">Security, Supabase Database & Recovery</h2>
                <p className="text-xs text-slate-400">Manage Supabase cloud connection, change passkey, or export complete JSON backup</p>
              </div>

              {/* Supabase Cloud Database Connection Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Supabase Cloud Database (Connected)</h3>
                      <p className="text-[11px] text-slate-400">Live synchronization active across all devices worldwide</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-600/60 text-emerald-300 text-xs font-semibold w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Realtime Sync Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Supabase Project URL</span>
                    <span className="font-mono text-sky-400 text-xs break-all">https://davrjqtvfjcnhietowuy.supabase.co</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Client Publishable Key</span>
                    <span className="font-mono text-slate-300 text-xs break-all">sb_publishable_vjUUthGI20UQ2uOoZ4MNsw_vnuJKB4o</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">Supabase SQL Schema Script</span>
                      <p className="text-[11px] text-slate-400">
                        Paste and run this SQL in Supabase SQL Editor to create <code className="text-emerald-400">portfolio</code> & <code className="text-emerald-400">messages</code> tables.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const sql = `-- 1. Create Portfolio Table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id TEXT PRIMARY KEY DEFAULT 'global',
  data JSONB NOT NULL,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  admin_password TEXT DEFAULT 'admin123',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on portfolio" ON public.portfolio FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert/update on portfolio" ON public.portfolio FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  topic TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on messages" ON public.messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public select on messages" ON public.messages FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on messages" ON public.messages FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on messages" ON public.messages FOR DELETE TO public USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;`;
                        navigator.clipboard.writeText(sql);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2500);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      {copiedSql ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied SQL!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy SQL Setup Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
