import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS, ProfilePhoto } from '../data/portfolioData';
import { PortfolioMessage } from '../types/message';
import {
  db,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from '../lib/firebase';

export type PortfolioDataType = typeof PORTFOLIO_DATA;

const DATA_STORAGE_KEY = 'alamin_portfolio_data_v2';
const PHOTOS_STORAGE_KEY = 'alamin_portfolio_photos_v2';
const ADMIN_PASS_KEY = 'alamin_admin_password_v2';
const ADMIN_AUTH_KEY = 'alamin_admin_logged_in_v2';
const MESSAGES_LOCAL_KEY = 'alamin_messages_local_cache';

const FIRESTORE_DOC_PATH = 'portfolio/global';

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
        // Clean out legacy gallery photos so only the two uploaded photos remain
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

// ---------------- FIREBASE REAL-TIME CLOUD DATABASE SYNC ----------------

/**
 * Subscribes to real-time changes in Firestore.
 * Whenever an admin updates details from any browser/device,
 * every visitor's screen updates INSTANTLY across the globe!
 */
export const subscribeToGlobalPortfolio = (
  onUpdate: (data: PortfolioDataType, photos: ProfilePhoto[], adminPassword?: string) => void
): (() => void) => {
  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    const unsubscribe = onSnapshot(
      portfolioDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData && cloudData.portfolioData) {
            const mergedData: PortfolioDataType = {
              ...PORTFOLIO_DATA,
              ...cloudData.portfolioData,
              heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(cloudData.portfolioData.heroButtons || {}) },
              heroStats: { ...PORTFOLIO_DATA.heroStats, ...(cloudData.portfolioData.heroStats || {}) },
              navbar: { ...PORTFOLIO_DATA.navbar, ...(cloudData.portfolioData.navbar || {}) },
              footer: { ...PORTFOLIO_DATA.footer, ...(cloudData.portfolioData.footer || {}) },
              sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(cloudData.portfolioData.sectionTitles || {}) },
              socials: { ...PORTFOLIO_DATA.socials, ...(cloudData.portfolioData.socials || {}) }
            };

            const rawPhotos: ProfilePhoto[] = Array.isArray(cloudData.photos) && cloudData.photos.length > 0
              ? cloudData.photos
              : DEFAULT_PROFILE_PHOTOS;

            const cleanedPhotos = rawPhotos.filter(
              (p: ProfilePhoto) =>
                p && p.url && !p.url.includes('/gallery/') && !p.url.includes('Profile-Photo.png')
            );
            const loadedPhotos: ProfilePhoto[] = cleanedPhotos.length > 0
              ? cleanedPhotos
              : DEFAULT_PROFILE_PHOTOS;

            // Cache in local storage for fast instant start
            saveStoredPortfolioData(mergedData);
            saveStoredPhotos(loadedPhotos);
            if (cloudData.adminPassword) {
              setAdminPassword(cloudData.adminPassword);
            }

            onUpdate(mergedData, loadedPhotos, cloudData.adminPassword);
          }
        } else {
          // Document does not exist yet in Firestore, seed it from server or local
          seedGlobalPortfolioToFirestore();
        }
      },
      (error) => {
        console.warn('Firestore real-time subscription error, falling back to REST/local:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.error('Failed to attach Firestore listener:', err);
    return () => {};
  }
};

/**
 * Seed initial data to Firestore if not already present
 */
export const seedGlobalPortfolioToFirestore = async (): Promise<void> => {
  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    const docSnap = await getDoc(portfolioDocRef);
    if (!docSnap.exists()) {
      const dataToSeed = getStoredPortfolioData();
      const photosToSeed = getStoredPhotos();
      await setDoc(portfolioDocRef, {
        portfolioData: dataToSeed,
        photos: photosToSeed,
        adminPassword: getAdminPassword(),
        updatedAt: new Date().toISOString()
      });
      console.log('Seeded global portfolio to Firestore successfully');
    }
  } catch (e) {
    console.warn('Error seeding Firestore data:', e);
  }
};

/**
 * Loads the true global portfolio data and photos from Firestore / Server.
 */
export const fetchPortfolioFromServer = async (): Promise<{
  data: PortfolioDataType;
  photos: ProfilePhoto[];
  adminPassword?: string;
} | null> => {
  // 1. First try Firestore Cloud Database directly
  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    const docSnap = await getDoc(portfolioDocRef);
    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      if (cloudData && cloudData.portfolioData) {
        const mergedData: PortfolioDataType = {
          ...PORTFOLIO_DATA,
          ...cloudData.portfolioData,
          heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(cloudData.portfolioData.heroButtons || {}) },
          heroStats: { ...PORTFOLIO_DATA.heroStats, ...(cloudData.portfolioData.heroStats || {}) },
          navbar: { ...PORTFOLIO_DATA.navbar, ...(cloudData.portfolioData.navbar || {}) },
          footer: { ...PORTFOLIO_DATA.footer, ...(cloudData.portfolioData.footer || {}) },
          sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(cloudData.portfolioData.sectionTitles || {}) },
          socials: { ...PORTFOLIO_DATA.socials, ...(cloudData.portfolioData.socials || {}) }
        };

        const rawPhotos: ProfilePhoto[] = Array.isArray(cloudData.photos) && cloudData.photos.length > 0
          ? cloudData.photos
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
        if (cloudData.adminPassword) {
          setAdminPassword(cloudData.adminPassword);
        }

        return {
          data: mergedData,
          photos: loadedPhotos,
          adminPassword: cloudData.adminPassword
        };
      }
    }
  } catch (err) {
    console.warn('Firestore direct fetch error, trying backend server route:', err);
  }

  // 2. Fallback to server REST API
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
    console.warn('Could not fetch portfolio from server, using local fallback:', err);
  }
  return null;
};

/**
 * Saves all changes permanently to both Firebase Firestore and the backend server.
 * This guarantees changes appear on all other browsers and devices immediately.
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

  const rawPayload = {
    portfolioData: data,
    photos: photos,
    adminPassword: adminPassword || getAdminPassword(),
    updatedAt: new Date().toISOString()
  };

  // CRITICAL: Strip any undefined fields so Firestore setDoc NEVER throws Unsupported field value: undefined
  const payload = JSON.parse(JSON.stringify(rawPayload));

  let firestoreSuccess = false;
  // 1. Write directly to Firestore Cloud Database
  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    await setDoc(portfolioDocRef, payload);
    firestoreSuccess = true;
    console.log('✅ [FIRESTORE] Saved to Cloud Firestore:', payload.updatedAt);
  } catch (err) {
    console.error('❌ [FIRESTORE] Firestore save error:', err);
  }

  // 2. Also write to backend express server disk as backup
  let serverSuccess = false;
  try {
    const res = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      serverSuccess = true;
      console.log('✅ [SERVER] Saved to Express server API');
    }
  } catch (err) {
    console.error('❌ [SERVER] Server save error:', err);
  }

  try {
    window.dispatchEvent(new CustomEvent('portfolio_updated', { detail: payload }));
  } catch (e) {
    // ignore
  }

  return firestoreSuccess || serverSuccess;
};

// ---------------- MESSAGES & INQUIRIES API ----------------

export const submitContactMessage = async (msg: {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> => {
  const timestamp = new Date().toISOString();

  // 1. Save directly to Firestore Cloud Database
  try {
    const messagesCol = collection(db, 'messages');
    await addDoc(messagesCol, {
      ...msg,
      timestamp,
      createdAt: timestamp,
      read: false
    });
  } catch (err) {
    console.warn('Firestore message save error:', err);
  }

  // 2. Also submit to backend server
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
      } catch (e) {
        // ignore
      }
      return { success: true };
    }
    return { success: false, error: json.error || 'Failed to submit message' };
  } catch (err: any) {
    console.error('Error submitting message to server:', err);
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
  // 1. Try Firestore first
  try {
    const messagesCol = collection(db, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const messages: PortfolioMessage[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        messages.push({
          id: docSnap.id,
          name: d.name || 'Anonymous',
          email: d.email || '',
          phone: d.phone,
          topic: d.topic || 'Inquiry',
          message: d.message || '',
          createdAt: d.createdAt || d.timestamp || new Date().toISOString(),
          read: d.read || false
        });
      });
      localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(messages));
      return messages;
    }
  } catch (err) {
    console.warn('Firestore messages fetch error, trying backend server:', err);
  }

  // 2. Fallback to Express REST server
  try {
    const res = await fetch(`/api/messages?_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(json.data));
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch messages from server, using local fallback:', err);
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

  const defaultPayload = {
    portfolioData: PORTFOLIO_DATA,
    photos: DEFAULT_PROFILE_PHOTOS,
    adminPassword: 'admin123',
    updatedAt: new Date().toISOString()
  };

  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    await setDoc(portfolioDocRef, defaultPayload);
  } catch (err) {
    console.warn('Could not reset on Firestore:', err);
  }

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
