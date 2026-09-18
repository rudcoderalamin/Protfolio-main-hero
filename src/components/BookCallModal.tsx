import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, Video, User, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PortfolioDataType } from '../utils/portfolioStorage';

interface BookCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolioData?: PortfolioDataType;
}

export const BookCallModal: React.FC<BookCallModalProps> = ({ isOpen, onClose, portfolioData }) => {
  const [selectedDuration, setSelectedDuration] = useState('30');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('03:00 PM');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Fullstack Project Consultation');
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const developerName = portfolioData?.name || 'Imran';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsBooked(true);
  };

  const timeSlots = [
    '10:00 AM', '11:30 AM', '02:00 PM', '03:00 PM', '05:00 PM', '08:30 PM'
  ];

  const dateOptions = [
    { label: 'Today', day: 'Today' },
    { label: 'Tomorrow', day: 'Tomorrow' },
    { label: 'Friday', day: 'Sep 19' },
    { label: 'Saturday', day: 'Sep 20' },
    { label: 'Monday', day: 'Sep 22' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        id="book-call-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Book a Call with {developerName}</h2>
              <p className="text-xs text-slate-500">Pick a convenient time for a video discussion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            id="book-call-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isBooked ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Meeting Confirmed!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
                Thanks <span className="font-semibold text-slate-800">{name}</span>! A Google Meet calendar invitation has been reserved for <span className="font-semibold text-slate-800">{selectedDate} at {selectedTime} (30 mins)</span>.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 mb-6 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-slate-700">
                  <Video className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold">Platform:</span> Google Meet (Link will be sent to {email})
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-sky-600" />
                  <span className="font-semibold">Topic:</span> {topic}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBooked(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition-colors"
                id="modal-done-booking-btn"
              >
                Back to Portfolio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Meeting Topic */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Call Purpose / Topic
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white text-slate-800"
                  id="book-topic-select"
                >
                  <option value="Fullstack Project Consultation">Fullstack Web App Consultation (React / Next.js)</option>
                  <option value="Freelance / Contract Opportunity">Freelance or Contract Opportunity</option>
                  <option value="Code Review & Architecture">Technical Discussion & Architecture</option>
                  <option value="General Introduction">15-min Coffee Chat / Introduction</option>
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Day
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {dateOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.label}
                      onClick={() => setSelectedDate(opt.label)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        selectedDate === opt.label
                          ? 'border-sky-600 bg-sky-50/80 text-sky-700 font-semibold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      <div className="text-xs font-medium">{opt.label}</div>
                      <div className="text-[10px] text-slate-400">{opt.day}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Time Slot (GMT+6)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                        selectedTime === slot
                          ? 'border-sky-600 bg-sky-600 text-white shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
                      id="book-name-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
                      id="book-email-input"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brief note (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. Building an MVP or hiring fullstack engineer"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-800"
                    id="book-notes-input"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold shadow-sm transition-all"
                  id="book-confirm-submit-btn"
                >
                  Confirm Video Call
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
