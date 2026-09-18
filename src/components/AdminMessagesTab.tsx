import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  RefreshCw,
  Search,
  CheckCircle,
  Trash2,
  ExternalLink,
  Clock,
  Send,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { PortfolioMessage } from '../types/message';
import {
  fetchMessagesFromServer,
  updateMessageReadStatus,
  deleteMessageFromServer
} from '../utils/portfolioStorage';

interface AdminMessagesTabProps {
  portfolioOwnerName?: string;
  onUnreadCountChange?: (count: number) => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({
  portfolioOwnerName = 'Al Amin Islam',
  onUnreadCountChange
}) => {
  const [messages, setMessages] = useState<PortfolioMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [actionMessage, setActionMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const list = await fetchMessagesFromServer();
      setMessages(list);
      const unread = list.filter((m) => !m.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleRead = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const updated = messages.map((m) => (m.id === id ? { ...m, read: newStatus } : m));
    setMessages(updated);
    const unread = updated.filter((m) => !m.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);

    await updateMessageReadStatus(id, newStatus);
    setActionMessage(newStatus ? 'Marked as read' : 'Marked as unread');
    setTimeout(() => setActionMessage(''), 2000);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const updated = messages.filter((m) => m.id !== id);
      setMessages(updated);
      const unread = updated.filter((m) => !m.read).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);

      await deleteMessageFromServer(id);
      setActionMessage('Message deleted successfully');
      setTimeout(() => setActionMessage(''), 2000);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  // Filter & search
  const filteredMessages = messages.filter((m) => {
    if (statusFilter === 'unread' && m.read) return false;
    if (statusFilter === 'read' && !m.read) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name?.toLowerCase().includes(q);
      const matchEmail = m.email?.toLowerCase().includes(q);
      const matchPhone = m.phone?.toLowerCase().includes(q);
      const matchTopic = m.topic?.toLowerCase().includes(q);
      const matchMsg = m.message?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchTopic || matchMsg;
    }

    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6" id="admin-messages-tab">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Visitor Inquiries & Messages</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time messages sent by clients and recruiters from your portfolio website.
          </p>
        </div>

        <button
          onClick={loadMessages}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Action toast feedback */}
      {actionMessage && (
        <div className="p-2.5 rounded-xl bg-sky-950/60 border border-sky-800 text-sky-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender name, email, phone, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'unread'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setStatusFilter('read')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'read'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Message Cards List */}
      {filteredMessages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300 mb-1">
            {searchQuery || statusFilter !== 'all' ? 'No matching messages found' : 'Inbox is Clean'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search keywords or filter settings.'
              : 'When visitors send an inquiry or message through your portfolio, it will appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const rawPhone = msg.phone ? msg.phone.replace(/[^0-9]/g, '') : '';
            const replyMailto = `mailto:${msg.email}?subject=${encodeURIComponent(
              `Re: ${msg.topic || 'Inquiry'} - ${portfolioOwnerName}`
            )}&body=${encodeURIComponent(
              `Hi ${msg.name},\n\nThank you for getting in touch regarding "${msg.topic || 'Inquiry'}".\n\n\nBest regards,\n${portfolioOwnerName}`
            )}`;

            return (
              <div
                key={msg.id}
                className={`p-5 rounded-2xl border transition-all ${
                  !msg.read
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-md shadow-amber-950/20'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        !msg.read ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                      }`}
                      title={!msg.read ? 'Unread Message' : 'Read Message'}
                    />
                    <h3 className="text-sm font-bold text-white">{msg.name}</h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium">
                      {msg.topic || 'General Inquiry'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(msg.createdAt)}</span>
                  </div>
                </div>

                {/* Sender Contact Info Pills */}
                <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                  {/* Email Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="font-mono text-[11px]">{msg.email}</span>
                    <button
                      onClick={() => copyToClipboard(msg.email, `email-${msg.id}`)}
                      className="ml-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedId === `email-${msg.id}` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Phone Pill */}
                  {msg.phone && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px]">{msg.phone}</span>
                      <button
                        onClick={() => copyToClipboard(msg.phone!, `phone-${msg.id}`)}
                        className="ml-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        title="Copy Phone"
                      >
                        {copiedId === `phone-${msg.id}` ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs text-slate-200 leading-relaxed mb-4 whitespace-pre-wrap">
                  {msg.message}
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  {/* Left: Contact actions */}
                  <div className="flex items-center gap-2">
                    {/* Reply via Email */}
                    <a
                      href={replyMailto}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>

                    {/* WhatsApp */}
                    {rawPhone && (
                      <a
                        href={`https://wa.me/${rawPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>

                  {/* Right: Status & Delete */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(msg.id, msg.read)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        msg.read
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {msg.read ? 'Mark as Unread' : 'Mark as Read'}
                    </button>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
