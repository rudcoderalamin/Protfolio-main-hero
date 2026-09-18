import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS, ProfilePhoto } from '../data/portfolioData';

export type PortfolioDataType = typeof PORTFOLIO_DATA;

const DATA_STORAGE_KEY = 'alamin_portfolio_data_v2';
const PHOTOS_STORAGE_KEY = 'alamin_portfolio_photos_v2';
const ADMIN_PASS_KEY = 'alamin_admin_password_v2';
const ADMIN_AUTH_KEY = 'alamin_admin_logged_in_v2';

export const getStoredPortfolioData = (): PortfolioDataType => {
  try {
    // Check v2 key first
    let raw = localStorage.getItem(DATA_STORAGE_KEY);
    
    // If not found, check legacy key
    if (!raw) {
      const legacyRaw = localStorage.getItem('imran_portfolio_data');
      if (legacyRaw) {
        const legacyParsed = JSON.parse(legacyRaw);
        // Migrate legacy data to Al Amin Islam
        if (legacyParsed.name === 'Imran Hasan') {
          legacyParsed.name = 'Al Amin Islam';
          legacyParsed.nickname = 'Al Amin';
          legacyParsed.brandInitials = 'AI';
        }
        return {
          ...PORTFOLIO_DATA,
          ...legacyParsed,
          heroButtons: { ...PORTFOLIO_DATA.heroButtons, ...(legacyParsed.heroButtons || {}) },
          heroStats: { ...PORTFOLIO_DATA.heroStats, ...(legacyParsed.heroStats || {}) },
          navbar: { ...PORTFOLIO_DATA.navbar, ...(legacyParsed.navbar || {}) },
          footer: { ...PORTFOLIO_DATA.footer, ...(legacyParsed.footer || {}) },
          sectionTitles: { ...PORTFOLIO_DATA.sectionTitles, ...(legacyParsed.sectionTitles || {}) },
          socials: { ...PORTFOLIO_DATA.socials, ...(legacyParsed.socials || {}) }
        };
      }
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge deeply with default structure
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
    console.error('Failed to save portfolio data to storage:', err);
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

export const resetPortfolioToDefaults = () => {
  localStorage.removeItem(DATA_STORAGE_KEY);
  localStorage.removeItem(PHOTOS_STORAGE_KEY);
  localStorage.removeItem('imran_portfolio_data');
  localStorage.removeItem('imran_portfolio_photos');
  localStorage.removeItem('imran_custom_photos');
  localStorage.removeItem('alamin_active_photo_index');
  localStorage.removeItem('imran_active_photo_index');
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

export const importPortfolioJson = (jsonString: string): { data: PortfolioDataType; photos: ProfilePhoto[] } => {
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

  saveStoredPortfolioData(mergedData);
  saveStoredPhotos(photosList);

  return {
    data: mergedData,
    photos: photosList
  };
};
