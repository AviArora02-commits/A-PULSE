import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for system prompt construction
function getSystemPrompt(emails: any[], tasks: any[], events: any[], assignments: any[], github: any[]) {
  return `
You are Pulse, an AI assistant embedded in a student productivity dashboard.
You have access to the user's real data:

EMAILS: ${JSON.stringify(emails)}
TASKS: ${JSON.stringify(tasks)}
CALENDAR: ${JSON.stringify(events)}
ASSIGNMENTS: ${JSON.stringify(assignments)}
GITHUB: ${JSON.stringify(github)}

Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
Current time is ${new Date().toLocaleTimeString()}.

Be extremely concise. Never use bullet points for short answers.
Think like a brilliant, direct friend who knows everything about the user's schedule.
Prioritize ruthlessly. Surface what matters, ignore what doesn't.
When you detect a hiring/internship email, always flag it prominently.
Estimate task durations based on assignment descriptions when possible.
`;
}

// 1. Proactive insights (Mode 1)
app.post('/api/gemini/proactive', async (req, res) => {
  try {
    const { emails = [], tasks = [], events = [], assignments = [], github = [] } = req.body;
    const systemPrompt = getSystemPrompt(emails, tasks, events, assignments, github);

    const prompt = `Based on my current dashboard data, give me a concise, direct status report (2-3 short, powerful sentences max). 
Identify what is my absolute single most urgent item and tell me why. Keep it friendly but sharp, like a senior mentor or a brilliant friend. 
Do not use bullet points or lists. Start with "Good morning" or "Good afternoon" or "Hey" depending on the time of day.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Proactive insight error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate proactive insights.' });
  }
});

// 2. Chat Mode (Mode 2) - Streaming response
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;
    const { emails = [], tasks = [], events = [], assignments = [], github = [] } = context;

    const systemPrompt = getSystemPrompt(emails, tasks, events, assignments, github);

    // Format history for Gemini SDK
    const contents = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    res.end();
  } catch (error: any) {
    console.error('Chat stream error:', error);
    res.status(500).write(`Error: ${error.message || 'Failed to process chat request'}`);
    res.end();
  }
});

// 3. Draft AI Reply
app.post('/api/gemini/email-reply', async (req, res) => {
  try {
    const { emailSubject, emailBody, userInstructions = 'Keep it professional and concise' } = req.body;

    const prompt = `
Draft a reply to the following email.
Original Subject: ${emailSubject}
Original Body: ${emailBody}

User Reply Instructions: ${userInstructions}

Provide ONLY the draft reply text. Do not include any meta-text, markdown tags, or headers like "Subject:". Keep it natural and tailored to a student's voice.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ draft: response.text });
  } catch (error: any) {
    console.error('Email draft error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate email reply draft.' });
  }
});

// 4. PR "Code Brief"
app.post('/api/gemini/code-brief', async (req, res) => {
  try {
    const { prTitle, prDescription } = req.body;

    const prompt = `
As a helpful code assistant, read this Pull Request title and description and write a 1-sentence Code Brief:
PR Title: ${prTitle}
PR Description: ${prDescription || 'No description provided.'}

Your output should explain: "This PR adds/modifies [X] in [Y]. It needs your review because [Z]." 
Keep it extremely concise, clear, and focused on why it matters. Do not use markdown bolding.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ brief: response.text });
  } catch (error: any) {
    console.error('PR code-brief error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate PR code brief.' });
  }
});

// 5. Assignment Brief
app.post('/api/gemini/assignment-brief', async (req, res) => {
  try {
    const { title, courseName, description } = req.body;

    const prompt = `
Analyze this Google Classroom assignment description and output a 1-sentence assignment brief.
Assignment: ${title}
Course: ${courseName}
Description: ${description || 'No description provided.'}

Format exactly like this: "This requires [X]. Estimated time: [Y]. Key focus: [Z]."
Keep it short and to the point.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ brief: response.text });
  } catch (error: any) {
    console.error('Assignment brief error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate assignment brief.' });
  }
});

// Swarm Coordinator: Multi-Agent collaborative intelligence
app.post('/api/swarm/execute', async (req, res) => {
  try {
    const { prompt, anthropicKey, kimiKey, context } = req.body;
    const { emails = [], tasks = [], events = [], assignments = [], github = [] } = context || {};

    // Step 1: Decomposition (Planner Gemini)
    const plannerPrompt = `
You are the Swarm Planner (Gemini 3.5). We have a heavy-duty student productivity task request: "${prompt}".
We have access to the student's dashboard data (Emails, Tasks, Calendar, Coursework, GitHub PRs).
Decompose this request into exactly two parallel sub-tasks for our collaborative swarm:
1. Sub-task 1 (for Claude 3.5 Sonnet): Deep logic, technical coding analysis, code draft review, structured markdown schedules, or algorithmic planning.
2. Sub-task 2 (for Kimi Chat): Context-heavy summarization, human-centered outline synthesis, syllabus/deadline cross-referencing, email response drafting, or plain text advice.

Output ONLY a JSON object with keys "subtask1" and "subtask2". Ensure no extra text or markdown wrappers so we can parse it directly.
`;

    const plannerRes = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: plannerPrompt,
    });

    let plannerText = plannerRes.text || '';
    if (plannerText.includes('```json')) {
      plannerText = plannerText.split('```json')[1].split('```')[0];
    } else if (plannerText.includes('```')) {
      plannerText = plannerText.split('```')[1].split('```')[0];
    }
    plannerText = plannerText.trim();

    let subtasks = { subtask1: '', subtask2: '' };
    try {
      subtasks = JSON.parse(plannerText);
    } catch {
      subtasks = {
        subtask1: `Perform technical and logical design for: ${prompt}`,
        subtask2: `Outline and draft communications/summaries for: ${prompt}`
      };
    }

    // Step 2: Run Logic Specialist (Claude)
    let claudeOutput = '';
    const effectiveAnthropicKey = anthropicKey || process.env.ANTHROPIC_API_KEY;
    const isRealClaude = !!effectiveAnthropicKey;
    const claudePrompt = `
You are Claude 3.5 Sonnet, the Logic & Technical Specialist.
Complete this subtask: "${subtasks.subtask1}".
Context data:
Emails: ${JSON.stringify(emails)}
Tasks: ${JSON.stringify(tasks)}
Events: ${JSON.stringify(events)}
Assignments: ${JSON.stringify(assignments)}
GitHub: ${JSON.stringify(github)}

Provide a detailed, high-quality solution focusing on code, exact logical steps, or strict technical schedules.
`;

    if (isRealClaude) {
      try {
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': effectiveAnthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1524,
            messages: [{ role: 'user', content: claudePrompt }]
          })
        });
        if (anthropicRes.ok) {
          const data = await anthropicRes.json();
          claudeOutput = data.content?.[0]?.text || 'No output received from Claude API.';
        } else {
          const errText = await anthropicRes.text();
          claudeOutput = `[Claude API Error: ${errText}]. Falling back to collaborative sandbox emulation...`;
        }
      } catch (err: any) {
        claudeOutput = `[Claude Connection Error: ${err.message}]. Falling back to collaborative sandbox emulation...`;
      }
    }

    if (!claudeOutput || claudeOutput.includes('Falling back')) {
      const mockClaudeRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: claudePrompt,
        config: {
          systemInstruction: 'You are Claude 3.5 Sonnet, a brilliant programming assistant. Emulate Sonnets direct, extremely competent, and technical tone perfectly. Use professional formatting.',
        }
      });
      claudeOutput = (claudeOutput ? claudeOutput + '\n\n' : '') + (mockClaudeRes.text || '');
    }

    // Step 3: Run Context Analyst (Kimi)
    let kimiOutput = '';
    const effectiveKimiKey = kimiKey || process.env.KIMI_API_KEY;
    const isRealKimi = !!effectiveKimiKey;
    const kimiPrompt = `
You are Kimi, the Long-Context, Summarization & Formatting Specialist.
Complete this subtask: "${subtasks.subtask2}".
Context data:
Emails: ${JSON.stringify(emails)}
Tasks: ${JSON.stringify(tasks)}
Events: ${JSON.stringify(events)}
Assignments: ${JSON.stringify(assignments)}
GitHub: ${JSON.stringify(github)}

Provide a user-focused outline, actionable summary tables, calendar reminders, or draft emails.
`;

    if (isRealKimi) {
      try {
        const kimiRes = await fetch('https://api.moonshot.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${effectiveKimiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'moonshot-v1-8k',
            messages: [{ role: 'user', content: kimiPrompt }]
          })
        });
        if (kimiRes.ok) {
          const data = await kimiRes.json();
          kimiOutput = data.choices?.[0]?.message?.content || 'No output received from Kimi API.';
        } else {
          const errText = await kimiRes.text();
          kimiOutput = `[Kimi API Error: ${errText}]. Falling back to collaborative sandbox emulation...`;
        }
      } catch (err: any) {
        kimiOutput = `[Kimi Connection Error: ${err.message}]. Falling back to collaborative sandbox emulation...`;
      }
    }

    if (!kimiOutput || kimiOutput.includes('Falling back')) {
      const mockKimiRes = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: kimiPrompt,
        config: {
          systemInstruction: 'You are Kimi Chat, a detail-oriented analyst specializing in clear structures, exhaustive outlines, and context synthesis. Emulate Kimi\'s helpful, exhaustive, and well-structured approach.',
        }
      });
      kimiOutput = (kimiOutput ? kimiOutput + '\n\n' : '') + (mockKimiRes.text || '');
    }

    // Step 4: Final Compilation (Gemini Coordinator)
    const compilePrompt = `
You are the Swarm Compiler (Gemini 3.5).
Our target user request was: "${prompt}".
We have received excellent work from our parallel swarm agents:

--- WORKER 1: CLAUDE 3.5 (LOGIC & CODE) ---
${claudeOutput}

--- WORKER 2: KIMI CHAT (CONTEXT & TEXT FORMATTING) ---
${kimiOutput}

---
Now, compile their contributions into an integrated, ultimate master response for the student.
Make sure you:
1. Synthesize the complex logic/schedules and human-centered checklists into a polished, seamless output.
2. Cross-reference actual student files/emails/deadlines where relevant.
3. Structure it beautifully with clear headings, styled blocks, checklists, or tables.
Do not output "Here is the compiled response." Just begin directly with a stunning title and structured results.
`;

    const compileRes = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: compilePrompt,
    });

    res.json({
      subtasks,
      claudeOutput,
      kimiOutput,
      finalOutput: compileRes.text,
      isRealClaude,
      isRealKimi,
    });
  } catch (error: any) {
    console.error('Swarm execute error:', error);
    res.status(500).json({ error: error.message || 'Swarm execution failed.' });
  }
});

// 6. Bulk parsing and tags generation for Emails
app.post('/api/gemini/parse-emails', async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.json({ parsed: [] });
    }

    const emailListStr = emails.map((e, idx) => `
ID: ${idx}
Sender: ${e.senderName} <${e.senderEmail}>
Subject: ${e.subject}
Snippet: ${e.snippet}
`).join('\n---\n');

    const prompt = `
You are analyzing emails for a student's personal dashboard "pulse".
For each email in the list below, you must:
1. Write a 1-sentence "AI one-liner" summarizing what the sender actually wants from the student.
2. Classify it into one or more categories: "Urgent", "Hiring", "Assignment", "FYI".
   - "Hiring" is for internship offers, career opportunities, recruiters, hackathons, or hiring updates.
   - "Urgent" is for immediate actions, deadline warnings, or critical requests.
   - "Assignment" is for class submissions, project milestones, or grading info.
   - "FYI" is general info, newsletters, or announcements.

Email List:
${emailListStr}

Respond ONLY with a JSON array matching this TypeScript structure:
\`\`\`json
[
  {
    "id": "index of email (string format)",
    "aiSummary": "1-sentence summary of what they want",
    "tags": ["Urgent" | "Hiring" | "Assignment" | "FYI"]
  }
]
\`\`\`
Ensure the response is valid parseable JSON without any markdown formatting wrappers.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    let rawText = response.text || '';
    // Clean JSON wrappers if present
    if (rawText.includes('```json')) {
      rawText = rawText.split('```json')[1].split('```')[0];
    } else if (rawText.includes('```')) {
      rawText = rawText.split('```')[1].split('```')[0];
    }
    rawText = rawText.trim();

    const parsed = JSON.parse(rawText);
    res.json({ parsed });
  } catch (error: any) {
    console.error('Parse emails error:', error);
    // Fallback gracefully
    res.json({ parsed: [] });
  }
});

// Initialize Vite in Development
async function start() {
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
    console.log(`Pulse server running on http://localhost:${PORT}`);
  });
}

start();
