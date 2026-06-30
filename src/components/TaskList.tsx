import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Plus, Trash2, Edit2, CheckCircle, Clock, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string, priority: 'urgent' | 'high' | 'medium') => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskTitle: (id: string, newTitle: string) => void;
}

export default function TaskList({ tasks, onAddTask, onToggleTask, onDeleteTask, onUpdateTaskTitle }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium'>('medium');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onUpdateTaskTitle(id, editingTitle.trim());
    }
    setEditingTaskId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-2 border-l-[#EF4444] text-[#EF4444]';
      case 'high':
        return 'border-l-2 border-l-[#F59E0B] text-[#F59E0B]';
      case 'medium':
        return 'border-l-2 border-l-[#6366F1] text-indigo-400';
      default:
        return 'border-l-2 border-l-[#27272A] text-[#A1A1AA]';
    }
  };

  const getSourceIconStr = (source: string) => {
    switch (source) {
      case 'gmail':
        return '📧 Gmail';
      case 'classroom':
        return '🎓 Classroom';
      case 'github':
        return '🐙 GitHub';
      default:
        return '📝 Manual';
    }
  };

  const getRemainingTimeStr = (deadlineStr?: string) => {
    if (!deadlineStr) return null;
    try {
      const diffMs = new Date(deadlineStr).getTime() - currentTime.getTime();
      if (diffMs <= 0) return 'Overdue';
      const diffHrs = Math.floor(diffMs / 3600000);
      const diffMins = Math.floor((diffMs % 3600000) / 60000);
      if (diffHrs === 0) return `${diffMins}m remaining`;
      if (diffHrs < 24) return `${diffHrs}h ${diffMins}m remaining`;
      const diffDays = Math.round(diffHrs / 24);
      return `${diffDays}d remaining`;
    } catch {
      return null;
    }
  };

  // Grouping logic for Tasks: Today / Tomorrow / This Week / Later
  const groupTasks = () => {
    const groups: { [key: string]: Task[] } = {
      Today: [],
      Tomorrow: [],
      'This Week': [],
      Later: [],
    };

    tasks.forEach((task) => {
      if (task.status === 'done') {
        // We will list Done items at the bottom of groups or separately
        groups['Later'].push(task);
        return;
      }
      if (!task.deadline) {
        groups['Later'].push(task);
        return;
      }

      const deadline = new Date(task.deadline);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      // Check dates
      if (deadline.toDateString() === today.toDateString()) {
        groups['Today'].push(task);
      } else if (deadline.toDateString() === tomorrow.toDateString()) {
        groups['Tomorrow'].push(task);
      } else if (deadline.getTime() - today.getTime() < 7 * 24 * 3600 * 1000) {
        groups['This Week'].push(task);
      } else {
        groups['Later'].push(task);
      }
    });

    // Clean up empty groups and sort lists
    const result: { [key: string]: Task[] } = {};
    Object.keys(groups).forEach((key) => {
      if (groups[key].length > 0) {
        result[key] = groups[key];
      }
    });

    return result;
  };

  const taskGroups = groupTasks();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center shrink-0">
        <ClipboardList className="w-4 h-4 text-[#A78BFA] mr-2" />
        <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">Tasks</h2>
      </div>

      {/* Task Creation Section */}
      <div className="p-6 border-b border-[#27272A] bg-[#111113]/50 shrink-0">
        <form onSubmit={handleAddTaskSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Add a priority student task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-[#111113] border border-[#27272A] rounded-lg py-2 px-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
          />

          <div className="flex items-center gap-2">
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as any)}
              className="bg-[#111113] border border-[#27272A] rounded-lg py-2 px-3 text-xs text-[#FAFAFA] focus:border-indigo-500/50 focus:outline-none transition-all cursor-pointer font-sans"
            >
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>

            <button
              type="submit"
              className="bg-[#FAFAFA] hover:bg-[#E4E4E7] text-[#09090B] px-4 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer duration-150 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Grouped Tasks Lists */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-10 h-10 rounded-xl bg-[#111113] border border-[#27272A] flex items-center justify-center text-[#52525B] mb-3">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
            </div>
            <p className="text-[#FAFAFA] text-sm font-medium mb-1">Nothing due. Enjoy the quiet.</p>
            <p className="text-[#52525B] text-xs">Add manual tasks or sync Google Classroom above.</p>
          </div>
        ) : (
          Object.keys(taskGroups).map((groupName) => (
            <div key={groupName} className="space-y-3">
              <h3 className="text-xs font-mono font-medium text-[#52525B] tracking-wider uppercase">
                {groupName}
              </h3>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {taskGroups[groupName].map((task) => {
                    const remainingTime = getRemainingTimeStr(task.deadline);
                    const isOverdue = remainingTime === 'Overdue';

                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                        className={`bg-[#111113] border border-[#27272A] rounded-lg p-3.5 flex items-center justify-between gap-4 group transition-all duration-200 ${getPriorityColor(
                          task.priority
                        )} ${task.status === 'done' ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => onToggleTask(task.id)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                              task.status === 'done'
                                ? 'bg-[#22C55E] border-[#22C55E] text-[#09090B]'
                                : 'border-[#3F3F46] hover:border-indigo-500'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Editable Text or standard layout */}
                          <div className="min-w-0 flex-1">
                            {editingTaskId === task.id ? (
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={() => saveEdit(task.id)}
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                                autoFocus
                                className="bg-[#1A1A1F] border border-[#3F3F46] rounded px-2 py-0.5 text-xs text-[#FAFAFA] w-full focus:outline-none"
                              />
                            ) : (
                              <div className="flex flex-col gap-1">
                                <span
                                  onClick={() => startEditing(task)}
                                  className={`text-xs text-[#FAFAFA] truncate font-sans tracking-tight cursor-text hover:underline decoration-dashed decoration-[#3F3F46] ${
                                    task.status === 'done' ? 'line-through text-[#52525B]' : ''
                                  }`}
                                >
                                  {task.title}
                                </span>

                                {/* Badges and countdown info */}
                                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-[#52525B]">
                                  <span>{getSourceIconStr(task.source)}</span>
                                  {task.aiEstimate && (
                                    <span className="text-[#A78BFA] flex items-center gap-0.5 font-bold">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      {task.aiEstimate}
                                    </span>
                                  )}
                                  {remainingTime && (
                                    <span
                                      className={`flex items-center gap-0.5 font-semibold ${
                                        isOverdue ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                                      }`}
                                    >
                                      <Clock className="w-2.5 h-2.5" />
                                      {remainingTime}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Inline Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(task)}
                            className="p-1 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#FAFAFA] transition-all cursor-pointer"
                            title="Edit Title"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#EF4444] transition-all cursor-pointer"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
