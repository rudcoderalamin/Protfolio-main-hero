import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS, ProfilePhoto } from '../data/portfolioData';
import { PortfolioMessage } from '../types/message';

export type PortfolioDataType = typeof PORTFOLIO_DATA;

const DATA_STORAGE_KEY = 'alamin_portfolio_data_v2';
const PHOTOS_STORAGE_KEY = 'alamin_portfolio_photos_v2';
const ADMIN_PASS_KEY = 'alamin_admin_password_v2';
const ADMIN_AUTH_KEY = 'alamin_admin_logged_in_v2';
const MESSAGES_LOCAL_KEY = 'alamin_messages_local_cache';

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
        return parsed.map((photo: ProfilePhoto) => ({
          ...photo,
          caption: photo.caption.replace(/Imran Hasan/g, 'Al Amin Islam')
        }));
      }
    }
  } catch (err) {
    console.warn('Failed to load photos from storage, using defaults:', err);
  }
  return DEFAULT_PROFILE_PHOTOS;
};

export const saveStoredPhotos = (photos: ProfilePhoto[]): void => {
  try {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
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

// ---------------- SERVER SYNC APIS (GLOBAL PERSISTENCE) ----------------

/**
 * Loads the true global portfolio data and photos from the backend server disk.
 * This ensures any updates made in the admin dashboard from any device/browser
 * are immediately received by all visitors worldwide.
 */
export const fetchPortfolioFromServer = async (): Promise<{
  data: PortfolioDataType;
  photos: ProfilePhoto[];
  adminPassword?: string;
} | null> => {
  try {
    const res = await fetch('/api/portfolio', {
      headers: { 'Accept': 'application/json' }
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
        socials: { ...PORTFOLIO_DATA.socials, ...(json.portfolioData.socials || {}) }
      };

      const loadedPhotos: ProfilePhoto[] = Array.isArray(json.photos) && json.photos.length > 0
        ? json.photos
        : DEFAULT_PROFILE_PHOTOS;

      // Update local storage cache
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
    console.warn('Could not fetch portfolio from server, using local fallback:', err);
  }
  return null;
};

/**
 * Saves all changes permanently to the backend server disk.
 */
export const savePortfolioToServer = async (
  data: PortfolioDataType,
  photos: ProfilePhoto[],
  adminPassword?: string
): Promise<boolean> => {
  // Always update local cache first
  saveStoredPortfolioData(data);
  saveStoredPhotos(photos);
  if (adminPassword) {
    setAdminPassword(adminPassword);
  }

  try {
    const res = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioData: data,
        photos: photos,
        adminPassword: adminPassword || getAdminPassword()
      })
    });
    if (res.ok) {
      return true;
    }
    const errJson = await res.json().catch(() => ({}));
    console.error('Server save error response:', errJson);
    return false;
  } catch (err) {
    console.error('Network error saving to server:', err);
    return false;
  }
};

// ---------------- MESSAGES & INQUIRIES API ----------------

export const submitContactMessage = async (msg: {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });

    const json = await res.json();
    if (res.ok && json.success) {
      // Also cache in local storage so offline access still works
      try {
        const local = getLocalMessagesCache();
        local.unshift(json.data);
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local.slice(0, 50)));
      } catch (e) {
        // ignore
      }
      return { success: true };
    }
    return { success: false, error: json.error || 'Failed to submit message' };
  } catch (err: any) {
    console.error('Error submitting message to server:', err);
    // Fallback: save locally
    try {
      const local = getLocalMessagesCache();
      const fallbackMsg: PortfolioMessage = {
        id: `msg-${Date.now()}`,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        topic: msg.topic || 'General Inquiry',
        message: msg.message,
        createdAt: new Date().toISOString(),
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
    const res = await fetch('/api/messages');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.messages)) {
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(json.messages));
        return json.messages;
      }
    }
  } catch (err) {
    console.warn('Could not fetch messages from server, using local cache:', err);
  }
  return getLocalMessagesCache();
};

export const updateMessageReadStatus = async (id: string, read: boolean): Promise<boolean> => {
  // Update local cache
  const local = getLocalMessagesCache();
  const found = local.find(m => m.id === id);
  if (found) {
    found.read = read;
    localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));
  }

  try {
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const deleteMessageFromServer = async (id: string): Promise<boolean> => {
  // Update local cache
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
  } catch (e) {
    // ignore
  }
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
    heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(parsed.portfolioData.heroButtons || {}) },
    heroStats: { ...PORTFOLIO_DATA.heroStats, ...(parsed.portfolioData.heroStats || {}) },
    navbar: { ...PORTFOLIO_DATA.navbar, ...(parsed.portfolioData.navbar || {}) },
    footer: { ...PORTFOLIO_DATA.footer, ...(parsed.portfolioData.footer || {}) },
    sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(parsed.portfolioData.sectionTitles || {}) },
    socials: { ...PORTFOLIO_DATA.socials, ...(parsed.portfolioData.socials || {}) }
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
