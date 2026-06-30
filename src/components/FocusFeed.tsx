import { motion, AnimatePresence } from 'motion/react';
import { Mail, Calendar, GraduationCap, Github, ArrowUpRight, Sparkles } from 'lucide-react';
import { FocusItem } from '../types';

interface FocusFeedProps {
  items: FocusItem[];
  onActionClick: (item: FocusItem) => void;
  isLoading: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } }
};

export default function FocusFeed({ items, onActionClick, isLoading }: FocusFeedProps) {
  // Determine the single most urgent item (first item in the prioritized list is most urgent)
  const mostUrgentId = items.length > 0 ? items[0].id : null;

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'gmail':
        return <Mail className="w-4 h-4 text-indigo-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-[#22C55E]" />;
      case 'classroom':
        return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'github':
        return <Github className="w-4 h-4 text-zinc-300" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getUrgencyBorder = (urgency: string) => {
    switch (urgency) {
      case 'red':
        return 'border-l-2 border-l-[#EF4444]';
      case 'amber':
        return 'border-l-2 border-l-[#F59E0B]';
      case 'indigo':
        return 'border-l-2 border-l-[#6366F1]';
      default:
        return 'border-l-2 border-l-[#27272A]';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Feed Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-sans font-semibold tracking-tight text-[#FAFAFA]">Focus Feed</h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-600/10 text-indigo-400 font-medium">
            AI PRIORITIZED
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#52525B]">
          <span>Realtime sync</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
        </div>
      </div>

      {/* Feed Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {isLoading ? (
          // Skeleton placeholders
          <div className="space-y-4">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-[#111113] border border-[#27272A] rounded-xl p-5 space-y-3 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="w-24 h-4 bg-[#1A1A1F] rounded" />
                  <div className="w-16 h-4 bg-[#1A1A1F] rounded" />
                </div>
                <div className="w-3/4 h-5 bg-[#1A1A1F] rounded" />
                <div className="w-full h-4 bg-[#1A1A1F] rounded" />
                <div className="flex justify-end pt-2">
                  <div className="w-20 h-8 bg-[#1A1A1F] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-xl bg-[#111113] border border-[#27272A] flex items-center justify-center text-[#52525B] mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-[#FAFAFA] text-sm font-medium mb-1">You're clear. Nothing needs attention.</p>
            <p className="text-[#52525B] text-xs">Enjoy the quiet or inspect individual feeds.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const isMostUrgent = item.id === mostUrgentId;
              return (
                <motion.div
                  key={item.id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-5 relative transition-all duration-300 ${getUrgencyBorder(
                    item.urgency
                  )} ${isMostUrgent ? 'focus-ring bg-[#14141a]' : ''}`}
                >
                  {/* Card Header Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#1A1A1F] border border-[#27272A] flex items-center justify-center">
                        {getSourceIcon(item.source)}
                      </div>
                      <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-[#A1A1AA]">
                        {item.source}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                          item.urgency === 'red'
                            ? 'bg-red-500/10 text-[#EF4444]'
                            : item.urgency === 'amber'
                            ? 'bg-amber-500/10 text-[#F59E0B]'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {item.timeContext}
                      </span>
                      {isMostUrgent && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                          URGENT RING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2 mb-4">
                    <h3 className="text-sm font-sans font-medium text-[#FAFAFA] tracking-tight leading-snug truncate">
                      {item.title}
                    </h3>
                    <p className="text-xs font-sans text-[#A78BFA] leading-relaxed italic">
                      {item.aiSummary}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => onActionClick(item)}
                      className={`text-xs font-sans font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 active:scale-[0.98] transition-all duration-200 cursor-pointer ${
                        isMostUrgent
                          ? 'bg-indigo-600 text-[#FAFAFA] hover:bg-indigo-500'
                          : 'bg-[#1A1A1F] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A]'
                      }`}
                    >
                      <span>{item.actionText}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
