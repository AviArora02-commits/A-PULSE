import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, BookOpen, Clock, AlertTriangle, Sparkles, ExternalLink, RefreshCw, CheckSquare } from 'lucide-react';
import { Assignment } from '../types';

interface ClassroomPanelProps {
  assignments: Assignment[];
  courses: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ClassroomPanel({ assignments, courses, isLoading, onRefresh }: ClassroomPanelProps) {
  const [activeCourseFilter, setActiveCourseFilter] = useState<string>('all');
  const [activeBriefId, setActiveBriefId] = useState<{ [id: string]: string }>({});
  const [isBriefLoading, setIsBriefLoading] = useState<{ [id: string]: boolean }>({});

  const filteredAssignments = activeCourseFilter === 'all'
    ? assignments
    : assignments.filter((a) => a.courseName === activeCourseFilter);

  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'No due date';
    try {
      const diff = new Date(isoString).getTime() - Date.now();
      if (diff < 0) return 'Overdue';
      const hours = Math.floor(diff / 3600000);
      if (hours < 24) return `Due in ${hours}h`;
      const days = Math.round(hours / 24);
      return `Due in ${days}d`;
    } catch {
      return 'No due date';
    }
  };

  const getStatusBadgeClass = (status: string, dueDate?: string) => {
    if (status === 'submitted') {
      return 'bg-emerald-500/10 text-[#22C55E] border-emerald-500/20';
    }
    if (dueDate && new Date(dueDate).getTime() < Date.now()) {
      return 'bg-red-500/10 text-[#EF4444] border-red-500/20';
    }
    return 'bg-amber-500/10 text-[#F59E0B] border-amber-500/20';
  };

  const handleFetchBrief = async (assignment: Assignment) => {
    setIsBriefLoading((prev) => ({ ...prev, [assignment.id]: true }));
    try {
      const response = await fetch('/api/gemini/assignment-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignment.title,
          courseName: assignment.courseName,
          description: assignment.description || 'No description provided.',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setActiveBriefId((prev) => ({ ...prev, [assignment.id]: data.brief }));
      }
    } catch (err) {
      console.error('Failed to get assignment brief:', err);
    } finally {
      setIsBriefLoading((prev) => ({ ...prev, [assignment.id]: false }));
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">Google Classroom</h2>
        </div>

        <button
          onClick={onRefresh}
          className="p-1.5 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#FAFAFA] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-mono border border-transparent hover:border-[#27272A]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Classroom</span>
        </button>
      </div>

      {/* Course filter list */}
      <div className="p-4 border-b border-[#27272A] bg-[#111113]/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => setActiveCourseFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
            activeCourseFilter === 'all'
              ? 'bg-[#FAFAFA] text-[#09090B] font-medium'
              : 'bg-[#1A1A1F] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA]'
          }`}
        >
          All Courses ({assignments.length})
        </button>
        {courses.map((course) => {
          const count = assignments.filter((a) => a.courseName === course).length;
          return (
            <button
              key={course}
              onClick={() => setActiveCourseFilter(course)}
              className={`px-3 py-1 rounded-full text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
                activeCourseFilter === course
                  ? 'bg-[#FAFAFA] text-[#09090B] font-medium'
                  : 'bg-[#1A1A1F] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA]'
              }`}
            >
              {course} ({count})
            </button>
          );
        })}
      </div>

      {/* Course Assignments Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((idx) => (
              <div key={idx} className="h-28 bg-[#111113] border border-[#27272A] rounded-xl" />
            ))}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <BookOpen className="w-8 h-8 text-[#52525B] mb-3" />
            <p className="text-[#FAFAFA] text-sm font-medium mb-1">No pending work in Classroom.</p>
            <p className="text-[#52525B] text-xs">All caught up across all classes!</p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const relativeDue = getRelativeTime(assignment.dueDate);
            const isOverdue = relativeDue === 'Overdue';

            return (
              <div
                key={assignment.id}
                className="bg-[#111113] border border-[#27272A] hover:border-[#3F3F46] rounded-xl p-5 space-y-4 transition-all duration-200 group"
              >
                {/* Course Metadata and status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                      {assignment.courseName}
                    </span>
                    <h3 className="text-xs font-semibold text-[#FAFAFA] leading-snug">{assignment.title}</h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono border px-2 py-0.5 rounded capitalize shrink-0 ${getStatusBadgeClass(
                      assignment.status,
                      assignment.dueDate
                    )}`}
                  >
                    {isOverdue && assignment.status !== 'submitted' ? 'Overdue' : assignment.status}
                  </span>
                </div>

                {/* Due Date Context */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#52525B]">
                  {assignment.dueDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{relativeDue}</span>
                    </span>
                  )}
                  {isOverdue && assignment.status !== 'submitted' && (
                    <span className="text-[#EF4444] font-bold flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      MISSING SUBMISSION
                    </span>
                  )}
                </div>

                {/* Description if any */}
                {assignment.description && (
                  <p className="text-[11px] text-[#A1A1AA] leading-relaxed line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {/* Gemini Feature: Assignment Brief */}
                <div className="pt-3 border-t border-dashed border-[#27272A] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Assignment Brief
                    </span>

                    {!activeBriefId[assignment.id] && (
                      <button
                        onClick={() => handleFetchBrief(assignment)}
                        disabled={isBriefLoading[assignment.id]}
                        className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-all"
                      >
                        {isBriefLoading[assignment.id] ? 'Analyzing...' : 'Generate Brief'}
                      </button>
                    )}
                  </div>

                  {activeBriefId[assignment.id] && (
                    <motion.p
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-sans text-indigo-200 bg-indigo-600/5 border border-indigo-500/10 rounded-lg p-2.5 leading-relaxed italic"
                    >
                      {activeBriefId[assignment.id]}
                    </motion.p>
                  )}
                </div>

                {/* Direct External Link */}
                {assignment.alternateLink && (
                  <div className="flex justify-end">
                    <a
                      href={assignment.alternateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1 bg-[#1A1A1F] px-2.5 py-1 rounded-md border border-[#27272A] hover:border-[#3F3F46] transition-all"
                    >
                      <span>Open Classroom</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
