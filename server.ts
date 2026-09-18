import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { PORTFOLIO_DATA, DEFAULT_PROFILE_PHOTOS } from './src/data/portfolioData';

const app = express();
const PORT = 3000;

// Increase payload limit for base64 photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static assets (favicons, images) from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// File paths for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const PORTFOLIO_STORE_FILE = path.join(DATA_DIR, 'portfolio-store.json');
const MESSAGES_STORE_FILE = path.join(DATA_DIR, 'messages-store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize portfolio store if not present
function getPortfolioStore() {
  try {
    if (fs.existsSync(PORTFOLIO_STORE_FILE)) {
      const raw = fs.readFileSync(PORTFOLIO_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.portfolioData && Array.isArray(parsed.photos)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading portfolio store file, re-initializing:', err);
  }

  const initialStore = {
    portfolioData: PORTFOLIO_DATA,
    photos: DEFAULT_PROFILE_PHOTOS,
    adminPassword: 'admin123',
    updatedAt: new Date().toISOString()
  };
  savePortfolioStore(initialStore);
  return initialStore;
}

function savePortfolioStore(data: any) {
  try {
    fs.writeFileSync(PORTFOLIO_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write to portfolio store file:', err);
    return false;
  }
}

// Initialize messages store if not present
function getMessagesStore(): any[] {
  try {
    if (fs.existsSync(MESSAGES_STORE_FILE)) {
      const raw = fs.readFileSync(MESSAGES_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading messages store file:', err);
  }
  return [];
}

function saveMessagesStore(messages: any[]) {
  try {
    fs.writeFileSync(MESSAGES_STORE_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write to messages store file:', err);
    return false;
  }
}

// ---------------- API ROUTES ----------------

// 1. Get current portfolio data & photos (Global for all visitors/browsers)
app.get('/api/portfolio', (req, res) => {
  const store = getPortfolioStore();
  res.json({
    success: true,
    portfolioData: store.portfolioData,
    photos: store.photos,
    adminPassword: store.adminPassword,
    updatedAt: store.updatedAt
  });
});

// 2. Save portfolio data & photos (Admin dashboard updates this permanently)
app.put('/api/portfolio', (req, res) => {
  try {
    const { portfolioData, photos, adminPassword } = req.body;
    if (!portfolioData) {
      return res.status(400).json({ success: false, error: 'portfolioData is required' });
    }

    const currentStore = getPortfolioStore();
    const updatedStore = {
      portfolioData: portfolioData,
      photos: Array.isArray(photos) && photos.length > 0 ? photos : currentStore.photos,
      adminPassword: adminPassword || currentStore.adminPassword || 'admin123',
      updatedAt: new Date().toISOString()
    };

    const saved = savePortfolioStore(updatedStore);
    if (saved) {
      return res.json({
        success: true,
        message: 'Portfolio data updated successfully across all devices and browsers!',
        updatedAt: updatedStore.updatedAt
      });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to write to storage' });
    }
  } catch (err: any) {
    console.error('PUT /api/portfolio error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// 3. Reset portfolio data to defaults
app.post('/api/portfolio/reset', (req, res) => {
  const defaultStore = {
    portfolioData: PORTFOLIO_DATA,
    photos: DEFAULT_PROFILE_PHOTOS,
    adminPassword: 'admin123',
    updatedAt: new Date().toISOString()
  };
  savePortfolioStore(defaultStore);
  res.json({ success: true, message: 'Portfolio reset to default successfully', store: defaultStore });
});

// 4. Get all visitor messages (Admin dashboard inquiries tab)
app.get('/api/messages', (req, res) => {
  const messages = getMessagesStore();
  // Return sorted newest first
  messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, messages });
});

// 5. User submits a message (Contact modal & Consultation form)
app.post('/api/messages', (req, res) => {
  try {
    const { name, email, phone, topic, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields.'
      });
    }

    const messages = getMessagesStore();
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      topic: topic ? String(topic).trim() : 'General Inquiry',
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      read: false
    };

    messages.unshift(newMessage);
    saveMessagesStore(messages);

    console.log(`[Message Received] From: ${newMessage.name} (${newMessage.email}) Phone: ${newMessage.phone}`);

    res.status(201).json({
      success: true,
      message: 'Your message has been received successfully!',
      data: newMessage
    });
  } catch (err: any) {
    console.error('POST /api/messages error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// 6. Update message read status
app.patch('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const { read } = req.body;
  const messages = getMessagesStore();
  const target = messages.find((m) => m.id === id);

  if (!target) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  if (typeof read === 'boolean') {
    target.read = read;
  }
  saveMessagesStore(messages);
  res.json({ success: true, message: target });
});

// 7. Delete a message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const messages = getMessagesStore();
  const filtered = messages.filter((m) => m.id !== id);

  if (filtered.length === messages.length) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  saveMessagesStore(filtered);
  res.json({ success: true, message: 'Message deleted successfully' });
});

// 8. Verify Admin Password
app.post('/api/admin/verify-password', (req, res) => {
  const { password } = req.body;
  const store = getPortfolioStore();
  const currentPassword = store.adminPassword || 'admin123';
  if (password === currentPassword) {
    return res.json({ success: true, authenticated: true });
  }
  return res.status(401).json({ success: false, authenticated: false, error: 'Incorrect password' });
});

// 9. Change Admin Password
app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const store = getPortfolioStore();
  const actualPassword = store.adminPassword || 'admin123';

  if (currentPassword !== actualPassword) {
    return res.status(401).json({ success: false, error: 'Current password is incorrect' });
  }

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long' });
  }

  store.adminPassword = newPassword;
  store.updatedAt = new Date().toISOString();
  savePortfolioStore(store);

  res.json({ success: true, message: 'Password changed successfully' });
});

// ---------------- VITE MIDDLEWARE & STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
