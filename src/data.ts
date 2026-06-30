import { Email, Task, CalendarEvent, Assignment, GithubPR, GithubCommit, FocusItem } from './types';

// Let's establish highly realistic and stunning student demo data
export const SAMPLE_EMAILS: Email[] = [
  {
    id: 'email-1',
    senderName: 'Flipkart Careers',
    senderEmail: 'careers@flipkart.com',
    subject: 'Action Required: SDE Intern Shortlisting & Coding Assessment',
    snippet: 'Congratulations! You have been shortlisted for the Flipkart Software Development Engineer (SDE) Intern position. Please complete the HackerRank coding assessment within 48 hours. The assessment will cover data structures, algorithms, and logical reasoning.',
    body: 'Congratulations! You have been shortlisted for the Flipkart Software Development Engineer (SDE) Intern position. Please complete the HackerRank coding assessment within 48 hours. The assessment will cover data structures, algorithms, and logical reasoning. If you have any clashes with college exams, let us know.',
    isUnread: true,
    receivedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(), // 20 mins ago
    aiSummary: 'Complete the Hackerrank coding assessment for Flipkart SDE Intern within 48 hours.',
    tags: ['Hiring', 'Urgent']
  },
  {
    id: 'email-2',
    senderName: 'Dr. Amit Sharma',
    senderEmail: 'amit.sharma@thapar.edu',
    subject: 'Urgent: ML Course Project Milestone 3 Submission Grace Period',
    snippet: 'All students must submit their complete Machine Learning projects by tonight. No further extensions will be granted under any circumstances. Marks will be uploaded to Classroom by tomorrow.',
    body: 'All students must submit their complete Machine Learning projects by tonight. No further extensions will be granted under any circumstances. Marks will be uploaded to Classroom by tomorrow. Ensure you attach the Jupyter notebook and the video demonstration link.',
    isUnread: true,
    receivedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    aiSummary: 'Submit the Machine Learning Course Project Milestone 3 Jupyter notebook by tonight.',
    tags: ['Urgent', 'Assignment']
  },
  {
    id: 'email-3',
    senderName: 'GitHub Notifications',
    senderEmail: 'noreply@github.com',
    subject: '[Review Request] #42 feat: implement dynamic websocket routing',
    snippet: 'sam-dev requested your review on pull request #42 in student-collab/peer-chat. 5 files changed, 142 additions, 12 deletions. Build passing on GitHub Actions.',
    body: 'sam-dev requested your review on pull request #42 in student-collab/peer-chat. 5 files changed, 142 additions, 12 deletions. Build passing on GitHub Actions.',
    isUnread: false,
    receivedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
    aiSummary: 'Review Sam\'s pull request #42 on WebSocket routing in the peer-chat repository.',
    tags: ['Assignment', 'FYI']
  },
  {
    id: 'email-4',
    senderName: 'Google Calendar',
    senderEmail: 'calendar-notification@google.com',
    subject: 'Invitation: CS302 DSA Lecture & Lab @ Mon Jun 30, 2026 10:00 AM',
    snippet: 'You have been invited to the upcoming DSA Lecture. The meet link is attached: meet.google.com/abc-defg-hij. Professor Amit will demonstrate graph traversal optimization techniques.',
    body: 'You have been invited to the upcoming DSA Lecture. The meet link is attached: meet.google.com/abc-defg-hij. Professor Amit will demonstrate graph traversal optimization techniques.',
    isUnread: false,
    receivedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
    aiSummary: 'Attend the DSA Lecture on graph traversals starting in 45 minutes.',
    tags: ['FYI']
  }
];

export const SAMPLE_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'CS302 DSA Lecture & Lab',
    start: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // starting in 45 minutes
    end: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    meetLink: 'https://meet.google.com/abc-defg-hij',
    description: 'Lecture by Prof. Amit on Graph optimization techniques and dynamic programming.'
  },
  {
    id: 'event-2',
    title: 'Peer Review Group Project Sync',
    start: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // starting in 4 hours
    end: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    description: 'Sync to merge PRs and review the final Classroom coursework submission.'
  }
];

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'ML Course Project - Milestone 3',
    courseName: 'CS204 Machine Learning',
    dueDate: new Date(Date.now() + 3 * 3600 * 1000).toISOString(), // due in 3 hours
    description: 'Submit your complete project code, documentation, and 2-minute video presentation. Ensure Jupyter notebook is executable.',
    status: 'pending',
    alternateLink: 'https://classroom.google.com/c/MTIzNDU2Nzg5/a/OTg3NjU0MzI1'
  },
  {
    id: 'assign-2',
    title: 'Automata Theory Lab Assignment 4',
    courseName: 'CS208 Theory of Computation',
    dueDate: new Date(Date.now() + 28 * 3600 * 1000).toISOString(), // due tomorrow
    description: 'Implement a non-deterministic finite automata (NFA) state transition simulator in Python or C++.',
    status: 'pending',
    alternateLink: 'https://classroom.google.com/c/MTIzNDU2Nzg5/a/OTg3NjU0MzI2'
  }
];

export const SAMPLE_GITHUB_PRS: GithubPR[] = [
  {
    id: 'pr-1',
    repoName: 'student-collab/peer-chat',
    title: 'feat: implement dynamic websocket routing',
    status: 'open',
    daysOpen: 4, // stale check trigger (>3 days)
    link: 'https://github.com/student-collab/peer-chat/pull/42',
    description: 'Adds scalable path mapping for socket messages, preventing thread collisions on high throughput streams.'
  },
  {
    id: 'pr-2',
    repoName: 'personal/portfolio-v2',
    title: 'style: update typography to Space Grotesk',
    status: 'approved',
    daysOpen: 1,
    link: 'https://github.com/personal/portfolio-v2/pull/12',
    description: 'Refresh visual aesthetics with crisp display weights and tighter trackings.'
  }
];

export const SAMPLE_GITHUB_COMMITS: GithubCommit[] = [
  {
    repoName: 'student-collab/peer-chat',
    message: 'refactor: simplify redis cluster pubsub setup',
    date: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    author: 'aarora6_be23'
  },
  {
    repoName: 'student-collab/peer-chat',
    message: 'fix: reconnect websocket listener on socket drop',
    date: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    author: 'aarora6_be23'
  }
];

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Complete ML Course Project Milestone 3 (Jupyter Notebook)',
    source: 'classroom',
    deadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    aiEstimate: '~2 hours',
    priority: 'urgent',
    status: 'todo',
    originalSourceId: 'assign-1'
  },
  {
    id: 'task-2',
    title: 'Complete Flipkart SDE Intern HackerRank coding assessment',
    source: 'gmail',
    deadline: new Date(Date.now() + 40 * 3600 * 1000).toISOString(),
    aiEstimate: '~1.5 hours',
    priority: 'urgent',
    status: 'todo',
    originalSourceId: 'email-1'
  },
  {
    id: 'task-3',
    title: 'Review Sam\'s peer-chat PR #42 (WebSocket routing)',
    source: 'github',
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    aiEstimate: '~30 mins',
    priority: 'high',
    status: 'todo',
    originalSourceId: 'pr-1'
  },
  {
    id: 'task-4',
    title: 'Read Automata Theory NFA Transition manual',
    source: 'manual',
    aiEstimate: '~1 hour',
    priority: 'medium',
    status: 'todo'
  }
];

export const SAMPLE_FOCUS_ITEMS: FocusItem[] = [
  {
    id: 'focus-1',
    type: 'overdue',
    urgency: 'red',
    source: 'classroom',
    title: 'ML Course Project — submit notebook and demonstrate demo video',
    timeContext: 'DUE IN 3H',
    aiSummary: 'Critical assignment due tonight. Will take approx 2 hours to finalize Jupyter notebook execution.',
    actionText: 'Submit Project',
    actionLink: 'https://classroom.google.com/c/MTIzNDU2Nzg5/a/OTg3NjU0MzI1',
    sourceId: 'assign-1'
  },
  {
    id: 'focus-2',
    type: 'hiring',
    urgency: 'amber',
    source: 'gmail',
    title: 'Flipkart SDE Intern Assessment Invite — HackerRank link',
    timeContext: 'RECEIVED 20M AGO',
    aiSummary: 'Shortlisted! Complete the core HackerRank assessment on DSA and reasoning within 48 hours.',
    actionText: 'Open HackerRank',
    sourceId: 'email-1'
  },
  {
    id: 'focus-3',
    type: 'meeting',
    urgency: 'indigo',
    source: 'calendar',
    title: 'CS302 DSA Lecture · Optimize graph traversal & Dynamic Programming',
    timeContext: 'IN 45 MIN',
    aiSummary: 'Live lecture starting soon with Prof. Amit Sharma. Google Meet link active.',
    actionText: 'Join Lecture',
    actionLink: 'https://meet.google.com/abc-defg-hij',
    sourceId: 'event-1'
  },
  {
    id: 'focus-4',
    type: 'github-pr',
    urgency: 'indigo',
    source: 'github',
    title: '[Review Request] peer-chat PR #42 — socket routing',
    timeContext: '4 DAYS STALE',
    aiSummary: 'Sam dev requested your review on routing pathways. Open for 4 days, needs attention.',
    actionText: 'Open PR',
    actionLink: 'https://github.com/student-collab/peer-chat/pull/42',
    sourceId: 'pr-1'
  }
];
