import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Clock
} from 'lucide-react';
import { PortfolioDataType, saveMessageToServer } from '../utils/portfolioStorage';

interface ContactSectionProps {
  portfolioData: PortfolioDataType;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ portfolioData }) => {
  const isDark = portfolioData.theme?.textColorMode === 'light';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const email = portfolioData.email || 'alaminislam.dev@gmail.com';
  const phone = portfolioData.phone || '+880 1700-000000';
  const whatsappNumber = portfolioData.whatsappNumber || '8801700000000';
  const location = portfolioData.location || 'Dhaka, Bangladesh';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await saveMessageToServer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        topic: formData.subject.trim() || 'Portfolio Contact Form',
        message: formData.message.trim()
      });

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      setErrorMessage('Failed to send message. Please try again or reach via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border bg-sky-500/10 text-sky-500 border-sky-500/20">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Get In Touch</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {portfolioData.sectionTitles?.contact || "Let's Build Something Extraordinary Together"}
        </h2>
        <p className={`mt-3 text-sm sm:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          {portfolioData.sectionSubtitles?.contact || "Whether you have an upcoming project, a technical opening, or just want to connect — my inbox is always open."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Intro Banner */}
          <div className={`p-6 rounded-2xl border ${
            isDark
              ? 'bg-slate-900/80 border-slate-800'
              : 'bg-white/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available for Freelance & Full-time Roles</span>
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Fast Response Guaranteed
            </h3>
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              I typically reply within a few hours. Feel free to send a message via the form or reach directly on WhatsApp.
            </p>
          </div>

          {/* Email Card with 1-Click Copy */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark
              ? 'bg-slate-900/60 border-slate-800 hover:border-sky-500/50'
              : 'bg-white/80 border-slate-200 hover:border-sky-400'
          } transition-all`}>
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 border border-sky-500/20">
                <Mail className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="block text-[11px] font-semibold text-slate-400">Direct Email</span>
                <a
                  href={`mailto:${email}`}
                  className={`text-xs sm:text-sm font-bold truncate block hover:underline ${
                    isDark ? 'text-slate-100 hover:text-sky-400' : 'text-slate-800 hover:text-sky-600'
                  }`}
                >
                  {email}
                </a>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="p-2 rounded-lg bg-slate-800/20 dark:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Copy Email"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* WhatsApp Card with 1-Click Chat */}
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-5 rounded-2xl border flex items-center justify-between gap-3 ${
              isDark
                ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50'
                : 'bg-white/80 border-slate-200 hover:border-emerald-400'
            } transition-all cursor-pointer group`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-400">WhatsApp & Phone</span>
                <span className={`text-xs sm:text-sm font-bold block ${
                  isDark ? 'text-slate-100' : 'text-slate-800'
                }`}>
                  {phone}
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </a>

          {/* Location Card */}
          <div className={`p-5 rounded-2xl border flex items-center gap-3.5 ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-400">Location</span>
              <span className={`text-xs sm:text-sm font-bold block ${
                isDark ? 'text-slate-100' : 'text-slate-800'
              }`}>
                {location}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form (7 Cols) */}
        <div className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 shadow-2xl shadow-black/40'
            : 'bg-white/90 border-slate-200/90 shadow-xl shadow-slate-200/40'
        }`}>
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Send a Direct Message
          </h3>
          <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Fill out the form below to reach me instantly.
          </p>

          {submitted && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <strong className="block">Message Sent Successfully!</strong>
                <span>Thank you for reaching out. I will get back to you shortly.</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-colors focus:outline-none focus:border-sky-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-colors focus:outline-none focus:border-sky-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Phone / WhatsApp (Optional)</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1700-000000"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-colors focus:outline-none focus:border-sky-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-400">Subject / Topic</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. New Web Development Project"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-colors focus:outline-none focus:border-sky-500 ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-400">Your Message *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your project, timeline, or inquiry..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border transition-colors focus:outline-none focus:border-sky-500 resize-none ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Message...' : 'Send Message Now'}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
