import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Search, CheckCircle2, Archive, MessageSquare, CornerUpLeft, Send, Sparkles, X, ChevronRight } from 'lucide-react';
import { Email } from '../types';

interface GmailInboxProps {
  emails: Email[];
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onSendReply: (emailId: string, replyBody: string) => Promise<boolean>;
  isLoading: boolean;
}

export default function GmailInbox({ emails, onMarkRead, onArchive, onSendReply, isLoading }: GmailInboxProps) {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftReply, setDraftReply] = useState('');
  const [userReplyInstructions, setUserReplyInstructions] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Simple string hashing for avatar background colors
  const getSenderColor = (name: string) => {
    const colors = [
      'bg-indigo-900/40 text-indigo-300 border-indigo-500/30',
      'bg-emerald-900/40 text-emerald-300 border-emerald-500/30',
      'bg-amber-900/40 text-amber-300 border-amber-500/30',
      'bg-violet-900/40 text-violet-300 border-violet-500/30',
      'bg-rose-900/40 text-rose-300 border-rose-500/30',
      'bg-cyan-900/40 text-cyan-300 border-cyan-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getRelativeTime = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(diff / 3600000);
      if (hours < 24) return `${hours}h ago`;
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'just now';
    }
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateAiReply = async () => {
    if (!selectedEmail) return;
    setIsGeneratingReply(true);
    try {
      const response = await fetch('/api/gemini/email-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailSubject: selectedEmail.subject,
          emailBody: selectedEmail.body || selectedEmail.snippet,
          userInstructions: userReplyInstructions || 'Acknowledge positively and say I am on it.',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setDraftReply(data.draft);
        setIsDrafting(true);
      }
    } catch (err) {
      console.error('Failed to generate AI draft:', err);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendResponse = async () => {
    if (!selectedEmail || !draftReply.trim()) return;
    setIsSending(true);
    try {
      const success = await onSendReply(selectedEmail.id, draftReply);
      if (success) {
        setDraftReply('');
        setUserReplyInstructions('');
        setIsDrafting(false);
        setSelectedEmail(null);
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex min-w-0 relative">
      {/* Email Inbox List Column */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#27272A]">
        {/* Header with Search */}
        <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-400" />
            <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">Inbox</h2>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-[#52525B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inbox..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111113] border border-[#27272A] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 4].map((idx) => (
                <div key={idx} className="bg-[#111113] border border-[#27272A] rounded-lg p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <p className="text-[#FAFAFA] text-sm font-medium mb-1">You're clear. Nothing needs attention.</p>
              <p className="text-[#52525B] text-xs">Enjoy the quiet.</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  onMarkRead(email.id);
                }}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                  selectedEmail?.id === email.id
                    ? 'bg-[#1A1A1F] border-[#3F3F46]'
                    : 'bg-[#111113] border-[#27272A] hover:bg-[#1A1A1F]/50 hover:border-[#3F3F46]/50'
                }`}
              >
                {/* Meta details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 ${getSenderColor(
                        email.senderName
                      )}`}
                    >
                      {email.senderName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-medium text-[#FAFAFA] truncate ${
                          email.isUnread ? 'font-semibold text-indigo-100' : ''
                        }`}
                      >
                        {email.senderName}
                      </h4>
                      <p className="text-[10px] font-mono text-[#52525B] truncate">{email.senderEmail}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#52525B] shrink-0">
                    {getRelativeTime(email.receivedAt)}
                  </span>
                </div>

                {/* Subject and AI text */}
                <div className="space-y-1">
                  <h3
                    className={`text-xs text-[#FAFAFA] truncate ${
                      email.isUnread ? 'font-semibold text-indigo-500/90' : 'text-[#A1A1AA]'
                    }`}
                  >
                    {email.subject}
                  </h3>
                  {email.aiSummary && (
                    <p className="text-[11px] font-sans text-[#A78BFA] italic leading-relaxed truncate">
                      💡 {email.aiSummary}
                    </p>
                  )}
                </div>

                {/* Tags and actions inline */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {email.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          tag === 'Urgent'
                            ? 'bg-red-500/10 text-[#EF4444]'
                            : tag === 'Hiring'
                            ? 'bg-amber-500/10 text-[#F59E0B]'
                            : tag === 'Assignment'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-[#1A1A1F] text-[#52525B]'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchive(email.id);
                      }}
                      className="p-1 rounded bg-[#1A1A1F] hover:bg-[#27272A] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] transition-all cursor-pointer"
                      title="Archive Email"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-[#52525B]" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Details Column / Slide-out */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="absolute lg:relative top-0 right-0 h-full w-full lg:w-96 bg-[#111113] border-l border-[#27272A] flex flex-col z-20"
          >
            {/* Details Header */}
            <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-medium tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Assistant
              </span>
              <button
                onClick={() => {
                  setSelectedEmail(null);
                  setIsDrafting(false);
                }}
                className="p-1 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#FAFAFA] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content of selected email */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              <div className="space-y-2">
                <h3 className="text-sm font-sans font-semibold text-[#FAFAFA] leading-snug">
                  {selectedEmail.subject}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-indigo-300">{selectedEmail.senderName}</span>
                  <span className="text-[10px] font-mono text-[#52525B]">
                    {new Date(selectedEmail.receivedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Full Email Body */}
              <div className="bg-[#1A1A1F] border border-[#27272A] rounded-xl p-4 text-xs text-[#A1A1AA] leading-relaxed max-h-56 overflow-y-auto">
                {selectedEmail.body || selectedEmail.snippet}
              </div>

              {/* AI Quick Reply Draft Engine */}
              <div className="space-y-3 pt-4 border-t border-[#27272A]">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-[#FAFAFA]">Smart AI Reply Draft</span>
                  <span className="text-[9px] font-mono ml-auto text-indigo-400 font-bold bg-indigo-500/10 px-1 py-0.5 rounded">AI</span>
                </div>

                <div className="space-y-2">
                  <textarea
                    placeholder="E.g., Say thank you, confirm attendance, ask for extension..."
                    value={userReplyInstructions}
                    onChange={(e) => setUserReplyInstructions(e.target.value)}
                    className="w-full h-16 bg-[#1A1A1F] border border-[#27272A] rounded-lg p-2.5 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all resize-none"
                  />
                  <button
                    onClick={handleGenerateAiReply}
                    disabled={isGeneratingReply}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-[#FAFAFA] text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingReply ? (
                      <span className="font-mono">Drafting...</span>
                    ) : (
                      <>
                        <CornerUpLeft className="w-3.5 h-3.5" />
                        <span>Generate AI Reply</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Edit & Send Block */}
                <AnimatePresence>
                  {isDrafting && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-3 pt-3 border-t border-dashed border-[#27272A]"
                    >
                      <span className="text-[11px] font-mono text-indigo-300">Review Draft:</span>
                      <textarea
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                        className="w-full h-28 bg-[#1A1A1F] border border-[#27272A] rounded-lg p-2.5 text-xs text-[#FAFAFA] focus:border-indigo-500/50 focus:outline-none transition-all resize-none"
                      />
                      <button
                        onClick={handleSendResponse}
                        disabled={isSending || !draftReply.trim()}
                        className="w-full bg-[#FAFAFA] hover:bg-[#E4E4E7] text-[#09090B] active:scale-[0.98] text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSending ? (
                          <span className="font-mono">Sending via Gmail API...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reply via Gmail API</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
