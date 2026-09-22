import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS, ProfilePhoto } from '../data/portfolioData';
import { PortfolioMessage } from '../types/message';
import { supabase } from '../lib/supabase';
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
  orderBy,
  deleteDoc,
  updateDoc
} from '../lib/firebase';

export type PortfolioDataType = typeof PORTFOLIO_DATA;

const DATA_STORAGE_KEY = 'alamin_portfolio_data_v2';
const PHOTOS_STORAGE_KEY = 'alamin_portfolio_photos_v2';
const ADMIN_PASS_KEY = 'alamin_admin_password_v2';
const ADMIN_AUTH_KEY = 'alamin_admin_logged_in_v2';
const MESSAGES_LOCAL_KEY = 'alamin_messages_local_cache';

// Helper to deeply merge loaded data with defaults so no fields are ever undefined
export const mergePortfolioData = (raw: any): PortfolioDataType => {
  if (!raw || typeof raw !== 'object') return PORTFOLIO_DATA;
  
  // Sanitize any legacy contact info that may contain Imran
  const sanitizedName = (raw.name && typeof raw.name === 'string' && raw.name.toLowerCase().includes('imran'))
    ? PORTFOLIO_DATA.name
    : (raw.name || PORTFOLIO_DATA.name);

  const sanitizedEmail = (raw.email && typeof raw.email === 'string' && raw.email.toLowerCase().includes('imran'))
    ? PORTFOLIO_DATA.email
    : (raw.email || PORTFOLIO_DATA.email);

  const rawSocials = raw.socials || {};
  const sanitizedSocials = {
    ...PORTFOLIO_DATA.socials,
    ...rawSocials,
    github: (rawSocials.github && rawSocials.github.toLowerCase().includes('imran'))
      ? PORTFOLIO_DATA.socials.github
      : (rawSocials.github || PORTFOLIO_DATA.socials.github)
  };

  return {
    ...PORTFOLIO_DATA,
    ...raw,
    name: sanitizedName,
    email: sanitizedEmail,
    socials: sanitizedSocials,
    heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(raw.heroButtons || {}) },
    heroStats: { ...PORTFOLIO_DATA.heroStats, ...(raw.heroStats || {}) },
    navbar: { ...PORTFOLIO_DATA.navbar, ...(raw.navbar || {}) },
    theme: { ...PORTFOLIO_DATA.theme, ...(raw.theme || {}) },
    footer: {
      ...PORTFOLIO_DATA.footer,
      ...(raw.footer || {}),
      links: Array.isArray(raw.footer?.links) ? raw.footer.links : PORTFOLIO_DATA.footer.links
    },
    sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(raw.sectionTitles || {}) },
    sectionSubtitles: { ...PORTFOLIO_DATA.sectionSubtitles, ...(raw.sectionSubtitles || {}) },
    contactModal: { ...PORTFOLIO_DATA.contactModal, ...(raw.contactModal || {}) },
    bookCallModal: { ...PORTFOLIO_DATA.bookCallModal, ...(raw.bookCallModal || {}) },
    resumeModal: { ...PORTFOLIO_DATA.resumeModal, ...(raw.resumeModal || {}) },
    whatsappWidget: { ...PORTFOLIO_DATA.whatsappWidget, ...(raw.whatsappWidget || {}) }
  };
};

export const cleanPhotos = (photos: any): ProfilePhoto[] => {
  if (!Array.isArray(photos) || photos.length === 0) return DEFAULT_PROFILE_PHOTOS;
  const filtered = photos
    .filter((p: ProfilePhoto) => p && p.url && !p.url.includes('/gallery/'))
    .map((p: ProfilePhoto) => {
      if (p.url.includes('imran-hasan.jpg')) {
        return { ...p, url: '/Profile-Photo.png', caption: p.caption?.replace(/imran/gi, 'Al Amin') || 'Al Amin Islam' };
      }
      return p;
    });
  return filtered.length > 0 ? filtered : DEFAULT_PROFILE_PHOTOS;
};

// Database status helpers
export const isQuotaExceeded = (): boolean => false;
export const setFirestoreQuotaExceeded = (): void => {};

// Synchronous local storage getters for instant zero-flicker UI render
export const getStoredPortfolioData = (): PortfolioDataType => {
  try {
    const raw = localStorage.getItem(DATA_STORAGE_KEY);
    if (raw) {
      return mergePortfolioData(JSON.parse(raw));
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
      return cleanPhotos(parsed);
    }
  } catch (err) {
    console.warn('Failed to load photos from storage, using defaults:', err);
  }
  return DEFAULT_PROFILE_PHOTOS;
};

export const saveStoredPhotos = (photos: ProfilePhoto[]): void => {
  try {
    const validPhotos = cleanPhotos(photos);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(validPhotos));
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

// ---------------- DATABASE SYNC ENGINE (FIRESTORE & SUPABASE) ----------------

/**
 * Subscribes to real-time changes from Firestore, Supabase & local window events.
 * Instantly broadcasts any change to all devices across the world without reloading!
 */
export const subscribeToGlobalPortfolio = (
  onUpdate: (data: PortfolioDataType, photos: ProfilePhoto[], adminPassword?: string) => void
): (() => void) => {
  // 1. Initial fetch from Firestore / Supabase / server
  fetchPortfolioFromServer().then((res) => {
    if (res && res.data) {
      onUpdate(res.data, res.photos, res.adminPassword);
    }
  });

  // 2. Real-time listener for Firestore Cloud Database
  let unsubscribeFirestore: (() => void) | null = null;
  try {
    const portfolioDocRef = doc(db, 'portfolio', 'global');
    unsubscribeFirestore = onSnapshot(
      portfolioDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remote = snapshot.data();
          const pData = remote?.portfolioData || remote?.data;
          if (pData) {
            const merged = mergePortfolioData(pData);
            const validPhotos = cleanPhotos(remote?.photos);
            const pass = remote?.adminPassword || remote?.admin_password;
            saveStoredPortfolioData(merged);
            saveStoredPhotos(validPhotos);
            if (pass) {
              setAdminPassword(pass);
            }
            onUpdate(merged, validPhotos, pass);
          }
        }
      },
      (err) => {
        console.warn('Firestore subscription notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Could not initialize Firestore real-time listener:', err);
  }

  // 3. Listen to Supabase Realtime channel for Postgres changes across all global clients
  let realtimeChannel: any = null;
  try {
    realtimeChannel = supabase
      .channel('portfolio_realtime_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio' },
        (payload: any) => {
          if (payload?.new && payload.new.data) {
            const row = payload.new;
            const merged = mergePortfolioData(row.data);
            const validPhotos = cleanPhotos(row.photos);
            saveStoredPortfolioData(merged);
            saveStoredPhotos(validPhotos);
            if (row.admin_password) {
              setAdminPassword(row.admin_password);
            }
            onUpdate(merged, validPhotos, row.admin_password);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('⚡ [Supabase Realtime] Connected! Listening for worldwide live updates.');
        }
      });
  } catch (err) {
    console.warn('Failed to initialize Supabase Realtime channel:', err);
  }

  // 4. Listen to internal instant update events (for current tab zero-lag response)
  const handleCustomEvent = (e: any) => {
    if (e?.detail) {
      const { portfolioData, photos, adminPassword } = e.detail;
      if (portfolioData) {
        onUpdate(portfolioData, photos || getStoredPhotos(), adminPassword);
      }
    }
  };

  // 5. Listen to local storage changes from other tabs on the same device
  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === DATA_STORAGE_KEY ||
      e.key === PHOTOS_STORAGE_KEY ||
      e.key === 'alamin_portfolio_data' ||
      e.key === 'alamin_portfolio_photos'
    ) {
      const currentData = getStoredPortfolioData();
      const currentPhotos = getStoredPhotos();
      onUpdate(currentData, currentPhotos, getAdminPassword());
    }
  };

  // 6. Periodic polling (every 30 seconds) as a bulletproof safety net
  const pollInterval = setInterval(() => {
    fetchPortfolioFromServer().then((res) => {
      if (res && res.data) {
        onUpdate(res.data, res.photos, res.adminPassword);
      }
    });
  }, 30000);

  window.addEventListener('portfolio_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    clearInterval(pollInterval);
    if (unsubscribeFirestore) {
      try {
        unsubscribeFirestore();
      } catch (e) {}
    }
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch (e) {}
    }
    window.removeEventListener('portfolio_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Loads portfolio data:
 * 1. Checks Firestore directly
 * 2. Checks Supabase directly
 * 3. Falls back to local Express server API
 * 4. Falls back to localStorage cache
 */
export const fetchPortfolioFromServer = async (): Promise<{
  data: PortfolioDataType;
  photos: ProfilePhoto[];
  adminPassword?: string;
} | null> => {
  // Step 1: Attempt to load from Firestore Cloud Database
  try {
    const snap = await getDoc(doc(db, 'portfolio', 'global'));
    if (snap.exists()) {
      const remote = snap.data();
      const pData = remote?.portfolioData || remote?.data;
      if (pData) {
        const mergedData = mergePortfolioData(pData);
        const loadedPhotos = cleanPhotos(remote?.photos);

        saveStoredPortfolioData(mergedData);
        saveStoredPhotos(loadedPhotos);
        const pass = remote?.adminPassword || remote?.admin_password;
        if (pass) {
          setAdminPassword(pass);
        }

        return {
          data: mergedData,
          photos: loadedPhotos,
          adminPassword: pass
        };
      }
    }
  } catch (err) {
    console.warn('Firestore fetch notice (falling back):', err);
  }

  // Step 2: Attempt to load from Supabase
  try {
    const { data: row, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('id', 'global')
      .maybeSingle();

    if (!error && row && row.data) {
      const mergedData = mergePortfolioData(row.data);
      const loadedPhotos = cleanPhotos(row.photos);

      saveStoredPortfolioData(mergedData);
      saveStoredPhotos(loadedPhotos);
      if (row.admin_password) {
        setAdminPassword(row.admin_password);
      }

      return {
        data: mergedData,
        photos: loadedPhotos,
        adminPassword: row.admin_password
      };
    }
  } catch (err) {
    console.warn('Could not fetch from Supabase (table might not be created yet):', err);
  }

  // Step 3: Fallback to local server API if running
  try {
    const res = await fetch(`/api/portfolio?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.portfolioData) {
        const mergedData = mergePortfolioData(json.portfolioData);
        const loadedPhotos = cleanPhotos(json.photos);

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
    }
  } catch (err) {
    // Expected on static Netlify deployment
  }

  // Step 4: Return local storage
  return {
    data: getStoredPortfolioData(),
    photos: getStoredPhotos(),
    adminPassword: getAdminPassword()
  };
};

/**
 * Saves all changes permanently:
 * 1. Immediately updates localStorage & dispatches event for instant local UI update.
 * 2. Saves directly into Firestore Cloud Database.
 * 3. Saves directly into Supabase `portfolio` table.
 * 4. Also pings server API if running.
 */
export const savePortfolioToServer = async (
  data: PortfolioDataType,
  photos: ProfilePhoto[],
  adminPassword?: string
): Promise<boolean> => {
  const currentPassword = adminPassword || getAdminPassword();
  const validPhotos = cleanPhotos(photos);

  // 1. Immediately update local storage for zero-lag UI
  saveStoredPortfolioData(data);
  saveStoredPhotos(validPhotos);
  if (currentPassword) {
    setAdminPassword(currentPassword);
  }

  const payload = {
    portfolioData: data,
    photos: validPhotos,
    adminPassword: currentPassword,
    updatedAt: new Date().toISOString()
  };

  // 2. Dispatch event so all components in this browser update instantly without reload
  try {
    window.dispatchEvent(new CustomEvent('portfolio_updated', { detail: payload }));
  } catch (e) {}

  // 3. Save directly into Firestore Cloud Database
  try {
    await setDoc(doc(db, 'portfolio', 'global'), payload);
    console.log('✅ [Firestore] Saved directly to Firebase cloud database at', payload.updatedAt);
  } catch (fireErr) {
    console.warn('⚠️ [Firestore] Cloud save notice:', fireErr);
  }

  // 4. Save directly to Supabase
  try {
    const { error } = await supabase.from('portfolio').upsert(
      {
        id: 'global',
        data: data,
        photos: validPhotos,
        admin_password: currentPassword,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

    if (!error) {
      console.log('✅ [Supabase] Saved directly to database at', payload.updatedAt);
    } else {
      console.warn('⚠️ [Supabase] Upsert warning:', error.message);
    }
  } catch (err) {
    console.error('❌ [Supabase] Connection error:', err);
  }

  // 5. Save to server API as secondary local store (if Express server is running)
  try {
    await fetch('/api/portfolio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Ignored on Netlify
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
  let saved = false;

  // 1. Save directly to Firestore Cloud Database
  try {
    const docRef = await addDoc(collection(db, 'messages'), {
      name: msg.name,
      email: msg.email,
      phone: msg.phone || '',
      topic: msg.topic || 'General Inquiry',
      message: msg.message,
      read: false,
      createdAt: timestamp
    });
    if (docRef?.id) {
      saved = true;
      const local = getLocalMessagesCache();
      local.unshift({
        id: docRef.id,
        name: msg.name,
        email: msg.email,
        phone: msg.phone,
        topic: msg.topic || 'General Inquiry',
        message: msg.message,
        createdAt: timestamp,
        read: false
      });
      localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local.slice(0, 50)));
    }
  } catch (err) {
    console.warn('Firestore message save notice:', err);
  }

  // 2. Save directly to Supabase messages table
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          name: msg.name,
          email: msg.email,
          phone: msg.phone || '',
          topic: msg.topic || 'General Inquiry',
          message: msg.message,
          read: false,
          created_at: timestamp
        }
      ])
      .select()
      .maybeSingle();

    if (!error && data && !saved) {
      saved = true;
      const local = getLocalMessagesCache();
      local.unshift({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        topic: data.topic,
        message: data.message,
        createdAt: data.created_at,
        read: !!data.read
      });
      localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local.slice(0, 50)));
    }
  } catch (err) {
    console.warn('Supabase message insert error:', err);
  }

  // 3. Also try server API if running
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    if (res.ok) {
      saved = true;
    }
  } catch (err) {}

  // 4. Fallback to local cache if offline
  if (!saved) {
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
  }

  return { success: true };
};

export const fetchMessagesFromServer = async (): Promise<PortfolioMessage[]> => {
  // 1. Try fetching directly from Firestore
  try {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const messages: PortfolioMessage[] = [];
      snap.forEach((docSnap) => {
        const m = docSnap.data();
        messages.push({
          id: docSnap.id,
          name: m.name || '',
          email: m.email || '',
          phone: m.phone || '',
          topic: m.topic || 'General Inquiry',
          message: m.message || '',
          createdAt: m.createdAt || m.created_at || new Date().toISOString(),
          read: Boolean(m.read)
        });
      });
      if (messages.length > 0) {
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(messages));
        return messages;
      }
    }
  } catch (err) {
    console.warn('Firestore fetch messages notice:', err);
  }

  // 2. Try fetching directly from Supabase
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const messages: PortfolioMessage[] = data.map((m: any) => ({
        id: String(m.id),
        name: m.name || '',
        email: m.email || '',
        phone: m.phone || '',
        topic: m.topic || 'General Inquiry',
        message: m.message || '',
        createdAt: m.created_at || new Date().toISOString(),
        read: Boolean(m.read)
      }));
      localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(messages));
      return messages;
    }
  } catch (err) {
    console.warn('Supabase fetch messages warning:', err);
  }

  // 3. Try server API
  try {
    const res = await fetch(`/api/messages?_t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const messageList = Array.isArray(json.messages)
        ? json.messages
        : Array.isArray(json.data)
        ? json.data
        : null;
      if (json.success && messageList && messageList.length > 0) {
        localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(messageList));
        return messageList;
      }
    }
  } catch (err) {}

  return getLocalMessagesCache();
};

export const markMessageAsReadOnServer = async (id: string, isRead = true): Promise<boolean> => {
  const local = getLocalMessagesCache().map((m) => (m.id === id ? { ...m, read: isRead } : m));
  localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));

  // Update in Firestore
  try {
    await updateDoc(doc(db, 'messages', id), { read: isRead });
  } catch (e) {}

  // Update in Supabase
  try {
    await supabase.from('messages').update({ read: isRead }).eq('id', id);
  } catch (e) {}

  // Update in Server API
  try {
    await fetch(`/api/messages/${id}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: isRead })
    });
  } catch (e) {}

  return true;
};

export const updateMessageReadStatus = (id: string, isRead = true) =>
  markMessageAsReadOnServer(id, isRead);

export const deleteMessageFromServer = async (id: string): Promise<boolean> => {
  const local = getLocalMessagesCache().filter((m) => m.id !== id);
  localStorage.setItem(MESSAGES_LOCAL_KEY, JSON.stringify(local));

  // Delete from Firestore
  try {
    await deleteDoc(doc(db, 'messages', id));
  } catch (e) {}

  // Delete from Supabase
  try {
    await supabase.from('messages').delete().eq('id', id);
  } catch (e) {}

  // Delete from Server API
  try {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
  } catch (e) {}

  return true;
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

  // Reset in Firestore
  try {
    await setDoc(doc(db, 'portfolio', 'global'), {
      portfolioData: PORTFOLIO_DATA,
      photos: DEFAULT_PROFILE_PHOTOS,
      adminPassword: 'admin123',
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not reset on Firestore:', err);
  }

  // Reset in Supabase
  try {
    await supabase.from('portfolio').upsert({
      id: 'global',
      data: PORTFOLIO_DATA,
      photos: DEFAULT_PROFILE_PHOTOS,
      admin_password: 'admin123',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not reset on Supabase:', err);
  }

  // Reset on Server
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
    version: 3,
    person: 'Al Amin Islam',
    exportedAt: new Date().toISOString(),
    portfolioData: getStoredPortfolioData(),
    photos: getStoredPhotos()
  };
  return JSON.stringify(exportPayload, null, 2);
};

export const importPortfolioJson = async (
  jsonString: string
): Promise<{ data: PortfolioDataType; photos: ProfilePhoto[] }> => {
  const parsed = JSON.parse(jsonString);
  if (!parsed.portfolioData) {
    throw new Error('Invalid backup file: portfolioData is missing');
  }
  const mergedData = mergePortfolioData(parsed.portfolioData);
  const photosList = cleanPhotos(parsed.photos);

  await savePortfolioToServer(mergedData, photosList);

  return {
    data: mergedData,
    photos: photosList
  };
};
