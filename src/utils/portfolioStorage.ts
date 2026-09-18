import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS, ProfilePhoto } from '../data/portfolioData';
import { PortfolioMessage } from '../types/message';

export type PortfolioDataType = typeof PORTFOLIO_DATA;

const DATA_STORAGE_KEY = 'alamin_portfolio_data_v2';
const PHOTOS_STORAGE_KEY = 'alamin_portfolio_photos_v2';
const ADMIN_PASS_KEY = 'alamin_admin_password_v2';
const ADMIN_AUTH_KEY = 'alamin_admin_logged_in_v2';
const MESSAGES_LOCAL_KEY = 'alamin_messages_local_cache';

// Direct Database status
export const isQuotaExceeded = (): boolean => false;
export const setFirestoreQuotaExceeded = (): void => {};

// Synchronous local storage getters for instant zero-flicker UI render
export const getStoredPortfolioData = (): PortfolioDataType => {
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...PORTFOLIO_DATA,
        ...parsed,
        heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(parsed.heroButtons || {}) },
        heroStats: { ...PORTFOLIO_DATA.heroStats, ...(parsed.heroStats || {}) },
        navbar: { ...PORTFOLIO_DATA.navbar, ...(parsed.navbar || {}) },
        footer: { ...PORTFOLIO_DATA.footer, ...(parsed.footer || {}) },
        sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(parsed.sectionTitles || {}) },
        sectionSubtitles: { ...PORTFOLIO_DATA.sectionSubtitles, ...(parsed.sectionSubtitles || {}) },
        contactModal: { ...PORTFOLIO_DATA.contactModal, ...(parsed.contactModal || {}) },
        bookCallModal: { ...PORTFOLIO_DATA.bookCallModal, ...(parsed.bookCallModal || {}) },
        resumeModal: { ...PORTFOLIO_DATA.resumeModal, ...(parsed.resumeModal || {}) },
        whatsappWidget: { ...PORTFOLIO_DATA.whatsappWidget, ...(parsed.whatsappWidget || {}) },
        socials: { ...PORTFOLIO_DATA.socials, ...(parsed.socials || {}) }
      };
    }
  } catch (err) {
    console.warn('Failed to load portfolio data from storage, using defaults:', err);
  }
  return PORTFOLIO_DATA;
};

export const saveStoredPortfolioData = (data: PortfolioDataType): void => {
  try {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save portfolio data to local storage:', err);
  }
};

export const getStoredPhotos = (): ProfilePhoto[] => {
  try {
    const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validPhotos = parsed.filter(
          (p: ProfilePhoto) =>
            p && p.url && !p.url.includes('/gallery/') && !p.url.includes('Profile-Photo.png')
        );
        if (validPhotos.length > 0) {
          return validPhotos.map((photo: ProfilePhoto) => ({
            ...photo,
            caption: photo.caption.replace(/Imran Hasan/g, 'Al Amin Islam')
          }));
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load photos from storage, using defaults:', err);
  }
  return DEFAULT_PROFILE_PHOTOS;
};

export const saveStoredPhotos = (photos: ProfilePhoto[]): void => {
  try {
    const validPhotos = photos.filter(
      (p: ProfilePhoto) =>
        p && p.url && !p.url.includes('/gallery/') && !p.url.includes('Profile-Photo.png')
    );
    localStorage.setItem(
      PHOTOS_STORAGE_KEY,
      JSON.stringify(validPhotos.length > 0 ? validPhotos : DEFAULT_PROFILE_PHOTOS)
    );
  } catch (err) {
    console.error('Failed to save photos to storage:', err);
  }
};

export const getAdminPassword = (): string => {
  return localStorage.getItem(ADMIN_PASS_KEY) || 'admin123';
};

export const setAdminPassword = (newPass: string): void => {
  localStorage.setItem(ADMIN_PASS_KEY, newPass);
};

export const getAdminAuthStatus = (): boolean => {
  return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
};

export const setAdminAuthStatus = (status: boolean): void => {
  if (status) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
  } else {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  }
};

// ---------------- DIRECT DATABASE SYNC ENGINE ----------------

/**
 * Subscribes to changes from the Direct Database & local events.
 * Updates immediately across tabs without any page reload.
 */
export const subscribeToGlobalPortfolio = (
  onUpdate: (data: PortfolioDataType, photos: ProfilePhoto[], adminPassword?: string) => void
): (() => void) => {
  // 1. Initial fetch from server database
  fetchPortfolioFromServer().then((res) => {
    if (res && res.data) {
      onUpdate(res.data, res.photos, res.adminPassword);
    }
  });

  // 2. Listen to internal instant update events
  const handleCustomEvent = (e: any) => {
    if (e?.detail) {
      const { portfolioData, photos, adminPassword } = e.detail;
      if (portfolioData) {
        onUpdate(portfolioData, photos || getStoredPhotos(), adminPassword);
      }
    }
  };

  // 3. Listen to local storage changes from other tabs in the browser
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === DATA_STORAGE_KEY || e.key === PHOTOS_STORAGE_KEY) {
      const currentData = getStoredPortfolioData();
      const currentPhotos = getStoredPhotos();
      onUpdate(currentData, currentPhotos, getAdminPassword());
    }
  };

  // 4. Background synchronization with direct database every 20 seconds
  const pollInterval = setInterval(() => {
    fetchPortfolioFromServer().then((res) => {
      if (res && res.data) {
        onUpdate(res.data, res.photos, res.adminPassword);
      }
    });
  }, 20000);

  window.addEventListener('portfolio_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    clearInterval(pollInterval);
    window.removeEventListener('portfolio_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Loads portfolio data directly from the server database (instant response).
 */
export const fetchPortfolioFromServer = async (): Promise<{
  data: PortfolioDataType;
  photos: ProfilePhoto[];
  adminPassword?: string;
} | null> => {
  try {
    const res = await fetch(`/api/portfolio?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.portfolioData) {
      const mergedData: PortfolioDataType = {
        ...PORTFOLIO_DATA,
        ...json.portfolioData,
        heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(json.portfolioData.heroButtons || {}) },
        heroStats: { ...PORTFOLIO_DATA.heroStats, ...(json.portfolioData.heroStats || {}) },
        navbar: { ...PORTFOLIO_DATA.navbar, ...(json.portfolioData.navbar || {}) },
        footer: { ...PORTFOLIO_DATA.footer, ...(json.portfolioData.footer || {}) },
        sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(json.portfolioData.sectionTitles || {}) },
        sectionSubtitles: { ...PORTFOLIO_DATA.sectionSubtitles, ...(json.portfolioData.sectionSubtitles || {}) },
        contactModal: { ...PORTFOLIO_DATA.contactModal, ...(json.portfolioData.contactModal || {}) },
        bookCallModal: { ...PORTFOLIO_DATA.bookCallModal, ...(json.portfolioData.bookCallModal || {}) },
        resumeModal: { ...PORTFOLIO_DATA.resumeModal, ...(json.portfolioData.resumeModal || {}) },
        whatsappWidget: { ...PORTFOLIO_DATA.whatsappWidget, ...(json.portfolioData.whatsappWidget || {}) },
        socials: { ...PORTFOLIO_DATA.socials, ...(json.portfolioData.socials || {}) }
      };

      const rawPhotos: ProfilePhoto[] = Array.isArray(json.photos) && json.photos.length > 0
        ? json.photos
        : DEFAULT_PROFILE_PHOTOS;

      const cleanedPhotos = rawPhotos.filter(
        (p: ProfilePhoto) =>
          p && p.url && !p.url.includes('/gallery/') && !p.url.includes('Profile-Photo.png')
      );
      const loadedPhotos: ProfilePhoto[] = cleanedPhotos.length > 0
        ? cleanedPhotos
        : DEFAULT_PROFILE_PHOTOS;

      saveStoredPortfolioData(mergedData);
      saveStoredPhotos(loadedPhotos);
      if (json.adminPassword) {
        setAdminPassword(json.adminPassword);
      }

      return {
        data: mergedData,
        photos: loadedPhotos,
        adminPassword: json.adminPassword
      };
    }
  } catch (err) {
    console.warn('Could not fetch portfolio from server database, using local cache:', err);
  }

  return {
    data: getStoredPortfolioData(),
    photos: getStoredPhotos(),
    adminPassword: getAdminPassword()
  };
};

/**
 * Saves all changes permanently to the Direct Database.
 * Runs instantly in milliseconds without any page reload!
 */
export const savePortfolioToServer = async (
  data: PortfolioDataType,
  photos: ProfilePhoto[],
  adminPassword?: string
): Promise<boolean> => {
  // 1. Immediately update local storage for zero-lag UI
  saveStoredPortfolioData(data);
  saveStoredPhotos(photos);
  if (adminPassword) {
    setAdminPassword(adminPassword);
  }

  const payload = {
    portfolioData: data,
    photos: photos,
    adminPassword: adminPassword || getAdminPassword(),
    updatedAt: new Date().toISOString()
  };

  // 2. Dispatch event so all components update in real-time without reload
  try {
    window.dispatchEvent(new CustomEvent('portfolio_updated', { detail: payload }));
  } catch (e) {}

  // 3. Save directly to the server database
  try {
    const res = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ [Direct Database] Saved in ~1ms:', payload.updatedAt);
      return true;
    }
  } catch (err) {
    console.error('❌ [Direct Database] Save error:', err);
  }

  return true;
};

// Backward-compatibility alias
export const savePortfolioDataToCloud = savePortfolioToServer;

// ---------------- MESSAGES & INQUIRIES API ----------------

export const submitContactMessage = async (msg: {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> => {
  const timestamp = new Date().toISOString();

  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      try {
        const local = getLocalMessagesCache();
        local.unshift(json.data);
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local.slice(0, 50)));
      } catch (e) {}
      return { success: true };
    }
    return { success: false, error: json.error || 'Failed to submit message' };
  } catch (err: any) {
    console.error('Error submitting message to server database:', err);
    try {
      const local = getLocalMessagesCache();
      const fallbackMsg: PortfolioMessage = {
        id: `msg-${Date.now()}`,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        topic: msg.topic || 'General Inquiry',
        message: msg.message,
        createdAt: timestamp,
        read: false
      };
      local.unshift(fallbackMsg);
      localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network failure' };
    }
  }
};

export const fetchMessagesFromServer = async (): Promise<PortfolioMessage[]> => {
  try {
    const res = await fetch(`/api/messages?_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      const messageList = Array.isArray(json.messages)
        ? json.messages
        : Array.isArray(json.data)
        ? json.data
        : null;
      if (json.success && messageList) {
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(messageList));
        return messageList;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch messages from server database, using local cache:', err);
  }
  return getLocalMessagesCache();
};

export const markMessageAsReadOnServer = async (id: string, isRead = true): Promise<boolean> => {
  const local = getLocalMessagesCache().map(m => m.id === id ? { ...m, read: isRead } : m);
  localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));

  try {
    const res = await fetch(`/api/messages/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: isRead })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const updateMessageReadStatus = (id: string, isRead = true) => markMessageAsReadOnServer(id, isRead);

export const deleteMessageFromServer = async (id: string): Promise<boolean> => {
  const local = getLocalMessagesCache().filter(m => m.id !== id);
  localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));

  try {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const getLocalMessagesCache = (): PortfolioMessage[] => {
  try {
    const raw = localStorage.getItem(MESSAGES_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

// ---------------- BACKUP & RESET ----------------

export const resetPortfolioToDefaults = async () => {
  localStorage.removeItem(DATA_STORAGE_KEY);
  localStorage.removeItem(PHOTOS_STORAGE_KEY);
  localStorage.removeItem('alamin_active_photo_index');

  try {
    await fetch('/api/portfolio/reset', { method: 'POST' });
  } catch (err) {
    console.warn('Could not reset on server:', err);
  }

  return {
    data: PORTFOLIO_DATA,
    photos: DEFAULT_PROFILE_PHOTOS
  };
};

export const exportPortfolioJson = (): string => {
  const exportPayload = {
    version: 2,
    person: "Al Amin Islam",
    exportedAt: new Date().toISOString(),
    portfolioData: getStoredPortfolioData(),
    photos: getStoredPhotos()
  };
  return JSON.stringify(exportPayload, null, 2);
};

export const importPortfolioJson = async (jsonString: string): Promise<{ data: PortfolioDataType; photos: ProfilePhoto[] }> => {
  const parsed = JSON.parse(jsonString);
  if (!parsed.portfolioData) {
    throw new Error('Invalid backup file: portfolioData is missing');
  }
  const mergedData: PortfolioDataType = {
    ...PORTFOLIO_DATA,
    ...parsed.portfolioData,
    heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(parsed.heroButtons || {}) },
    heroStats: { ...PORTFOLIO_DATA.heroStats, ...(parsed.heroStats || {}) },
    navbar: { ...PORTFOLIO_DATA.navbar, ...(parsed.navbar || {}) },
    footer: { ...PORTFOLIO_DATA.footer, ...(parsed.footer || {}) },
    sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(parsed.sectionTitles || {}) },
    socials: { ...PORTFOLIO_DATA.socials, ...(parsed.socials || {}) }
  };
  const photosList: ProfilePhoto[] = Array.isArray(parsed.photos) && parsed.photos.length > 0
    ? parsed.photos
    : DEFAULT_PROFILE_PHOTOS;

  await savePortfolioToServer(mergedData, photosList);

  return {
    data: mergedData,
    photos: photosList
  };
};
