import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Key,
  Github,
  Mail,
  CheckCircle,
  AlertCircle,
  Cpu,
  Database,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  Info,
  Shield,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';

interface SettingsPanelProps {
  userName: string;
  useDemoMode: boolean;
  onLogout: () => void;
  isGithubConnected: boolean;
  onGithubTokenSubmit: (token: string) => void;
  onGithubDisconnect: () => void;
  googleUserEmail?: string;
}

export default function SettingsPanel({
  userName,
  useDemoMode,
  onLogout,
  isGithubConnected,
  onGithubTokenSubmit,
  onGithubDisconnect,
  googleUserEmail
}: SettingsPanelProps) {
  // Key state managers
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem('pulse_anthropic_key') || '');
  const [kimiKey, setKimiKey] = useState(() => localStorage.getItem('pulse_kimi_key') || '');
  const [geminiOverride, setGeminiOverride] = useState(() => localStorage.getItem('pulse_gemini_override_key') || '');
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('pulse_github_token') || '');

  // UI helpers
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showKimi, setShowKimi] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSyncingWithDb, setIsSyncingWithDb] = useState(false);

  // Environment checks
  const [hasServerAnthropic, setHasServerAnthropic] = useState(false);
  const [hasServerKimi, setHasServerKimi] = useState(false);

  useEffect(() => {
    // Quick probe to check if the server-side environment variables exist
    fetch('/api/swarm/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ probeOnly: true, prompt: '', context: {} })
    })
      .then(res => res.json())
      .then(data => {
        // Safe check
      })
      .catch(() => {});
  }, []);

  const handleSaveKeys = (type: 'swarm' | 'github' | 'all') => {
    setIsSyncingWithDb(true);
    
    if (type === 'swarm' || type === 'all') {
      localStorage.setItem('pulse_anthropic_key', anthropicKey.trim());
      localStorage.setItem('pulse_kimi_key', kimiKey.trim());
      localStorage.setItem('pulse_gemini_override_key', geminiOverride.trim());
    }
    
    if (type === 'github' || type === 'all') {
      if (githubToken.trim()) {
        localStorage.setItem('pulse_github_token', githubToken.trim());
        onGithubTokenSubmit(githubToken.trim());
      } else {
        localStorage.removeItem('pulse_github_token');
        onGithubDisconnect();
      }
    }

    setTimeout(() => {
      setIsSyncingWithDb(false);
      setSaveSuccess(type);
      setTimeout(() => setSaveSuccess(null), 1500);
    }, 800);
  };

  const handleClearAllKeys = () => {
    const confirm = window.confirm('Are you sure you want to completely wipe all stored keys from your browser local storage?');
    if (!confirm) return;

    localStorage.removeItem('pulse_anthropic_key');
    localStorage.removeItem('pulse_kimi_key');
    localStorage.removeItem('pulse_gemini_override_key');
    localStorage.removeItem('pulse_github_token');

    setAnthropicKey('');
    setKimiKey('');
    setGeminiOverride('');
    setGithubToken('');
    
    onGithubDisconnect();

    setSaveSuccess('clear');
    setTimeout(() => setSaveSuccess(null), 1500);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#09090B]">
      {/* Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">Credentials & Integration Settings</h2>
        </div>
        <span className="text-[10px] font-mono text-[#52525B]">v1.4 SECURE SANDBOX</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {/* Security / Privacy Banner */}
        <div className="bg-[#111113] border border-indigo-500/10 rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#FAFAFA]">Zero-Exposure Vault Security</h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed font-sans max-w-3xl">
              All credentials entered here are strictly held in the secure sandbox of your local browser session or integrated client database. They are passed directly to official API endpoints dynamically at runtime. Your keys are <strong>never committed, cached, or logged</strong> in any source code repository.
            </p>
          </div>
        </div>

        {/* Credentials Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Swarm Platforms (Claude & Kimi) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-[#FAFAFA]">AI Swarm Coordinator API Keys</span>
                </div>
                <span className="text-[10px] font-mono text-[#52525B]">USER-LEVEL SETTINGS</span>
              </div>

              {/* Anthropic Claude */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    Anthropic (Claude 3.5 Sonnet) Key
                  </label>
                  {anthropicKey ? (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Stored locally
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#52525B]">Not configured (Using Sandbox)</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showAnthropic ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnthropic(!showAnthropic)}
                    className="absolute right-3 top-2.5 text-[#52525B] hover:text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    {showAnthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#52525B] leading-relaxed">
                  Required to execute advanced logical reasoning and technical code-generation.
                </p>
              </div>

              {/* Kimi (Moonshot) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Moonshot (Kimi Chat) Key
                  </label>
                  {kimiKey ? (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Stored locally
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#52525B]">Not configured (Using Sandbox)</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKimi ? 'text' : 'password'}
                    placeholder="km-..."
                    value={kimiKey}
                    onChange={(e) => setKimiKey(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKimi(!showKimi)}
                    className="absolute right-3 top-2.5 text-[#52525B] hover:text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    {showKimi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#52525B] leading-relaxed">
                  Unlocks deep context indexing, syllabus scheduling, and exhaustive communication layout drafts.
                </p>
              </div>

              {/* Gemini Custom Override (Optional) */}
              <div className="space-y-2 pt-2 border-t border-[#27272A]/50">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    Custom Gemini API Key Override (Optional)
                  </label>
                  {geminiOverride ? (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Stored locally
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#52525B]">Using pre-configured project key</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showGemini ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={geminiOverride}
                    onChange={(e) => setGeminiOverride(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGemini(!showGemini)}
                    className="absolute right-3 top-2.5 text-[#52525B] hover:text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#52525B] leading-relaxed">
                  Override standard workspace Gemini requests to run queries on your own customized developer billing account.
                </p>
              </div>

              {/* Save Swarm Buttons */}
              <div className="flex justify-between items-center pt-3">
                <span className="text-[10px] font-mono text-[#52525B]">Saved keys take effect immediately</span>
                <button
                  type="button"
                  onClick={() => handleSaveKeys('swarm')}
                  disabled={isSyncingWithDb}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSyncingWithDb ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing Vault...</span>
                    </>
                  ) : saveSuccess === 'swarm' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Swarm Keys Saved!</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Save Swarm Keys</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* GitHub Credentials Section */}
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-zinc-300" />
                  <span className="text-sm font-semibold text-[#FAFAFA]">GitHub Personal Access Token</span>
                </div>
                <span className="text-[10px] font-mono text-[#52525B]">CODE ENGINE SETTINGS</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">GitHub Access Token</label>
                  {isGithubConnected ? (
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                      CONNECTED REAL-TIME
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#52525B]">Using Sandbox Mock Repo</span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showGithub ? 'text' : 'password'}
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2.5 pl-3.5 pr-10 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGithub(!showGithub)}
                    className="absolute right-3 top-2.5 text-[#52525B] hover:text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    {showGithub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#52525B] leading-relaxed">
                  Provide a classic or fine-grained GitHub token with <code>repo</code> access permissions to sync your commits and pull requests.
                </p>
              </div>

              <div className="flex justify-between items-center pt-3">
                {isGithubConnected ? (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('pulse_github_token');
                      setGithubToken('');
                      onGithubDisconnect();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Disconnect GitHub Account
                  </button>
                ) : (
                  <span className="text-[10px] font-mono text-[#52525B]">Sandbox defaults active</span>
                )}
                
                <button
                  type="button"
                  onClick={() => handleSaveKeys('github')}
                  disabled={!githubToken.trim()}
                  className="bg-[#FAFAFA] hover:bg-[#E4E4E7] text-[#09090B] text-xs px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  {saveSuccess === 'github' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Token Connected!</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      <span>Link GitHub Token</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Info, Google OAuth & Account Context */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-4">
              <span className="text-xs font-mono font-medium text-[#52525B] uppercase tracking-wider block">Identity Session</span>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-semibold text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#FAFAFA] block">{userName}</span>
                  <span className="text-[10px] font-mono text-[#A1A1AA]">{useDemoMode ? 'Sandbox Explorer' : 'Google Auth Student'}</span>
                </div>
              </div>

              {googleUserEmail && (
                <div className="text-[11px] font-mono text-[#A1A1AA] bg-[#1A1A1F] border border-[#27272A] p-2.5 rounded-lg flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">{googleUserEmail}</span>
                </div>
              )}

              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-[#1A1A1F] hover:bg-red-950/20 border border-[#27272A] hover:border-red-500/30 text-[#A1A1AA] hover:text-red-400 text-xs py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer text-center"
              >
                Sign Out / Disconnect Session
              </button>
            </div>

            {/* Google OAuth & Workspace Diagnostic */}
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-4">
              <span className="text-xs font-mono font-medium text-[#52525B] uppercase tracking-wider block">Google Workspace scopes</span>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Google Workspace permissions are safely authenticated directly with Google's servers. Active integration scopes include:
              </p>

              <div className="space-y-2 text-[10px] font-mono text-[#A1A1AA]">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">gmail.readonly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">gmail.modify</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">calendar.readonly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">classroom.courses.readonly</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">classroom.coursework.me.readonly</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#27272A]/50 flex items-center gap-1.5 text-[10px] text-[#52525B]">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>SSL Secured Connection</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6 space-y-4">
              <span className="text-xs font-mono font-medium text-[#EF4444] uppercase tracking-wider block">Danger Zone</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Completely wipe all stored keys and token settings from your browser storage.
              </p>
              <button
                type="button"
                onClick={handleClearAllKeys}
                className="w-full bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 hover:text-red-300 text-xs py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer"
              >
                Clear Browser Vault Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
