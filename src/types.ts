export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body?: string;
  isUnread: boolean;
  receivedAt: string; // ISO string or relative format
  aiSummary?: string;
  tags: ('Urgent' | 'Hiring' | 'Assignment' | 'FYI')[];
}

export interface Task {
  id: string;
  title: string;
  source: 'gmail' | 'classroom' | 'github' | 'manual';
  deadline?: string;
  aiEstimate?: string;
  priority: 'urgent' | 'high' | 'medium';
  status: 'todo' | 'in-progress' | 'done';
  originalSourceId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink?: string;
  description?: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate?: string;
  description?: string;
  status: 'pending' | 'submitted' | 'overdue';
  alternateLink?: string;
}

export interface GithubPR {
  id: string;
  repoName: string;
  title: string;
  status: 'open' | 'changes-requested' | 'approved';
  daysOpen: number;
  link: string;
  description?: string;
}

export interface GithubCommit {
  repoName: string;
  message: string;
  date: string;
  author: string;
}

export interface FocusItem {
  id: string;
  type: 'due' | 'hiring' | 'meeting' | 'email-urgent' | 'github-pr' | 'overdue';
  urgency: 'red' | 'amber' | 'indigo';
  source: 'gmail' | 'calendar' | 'classroom' | 'github';
  title: string;
  timeContext: string;
  aiSummary: string;
  actionText: string;
  actionLink?: string;
  sourceId: string; // reference to original item ID
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SwarmConfig {
  anthropicKey: string;
  kimiKey: string;
}

export interface SwarmStep {
  agent: 'Gemini (Planner)' | 'Claude (Logic Specialist)' | 'Kimi (Context Analyst)' | 'Gemini (Compiler)';
  message: string;
  timestamp: string;
  status: 'pending' | 'active' | 'completed';
}
