import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Github, GitPullRequest, AlertCircle, Sparkles, Key, CheckCircle, RefreshCw, X, ArrowUpRight } from 'lucide-react';
import { GithubPR, GithubCommit } from '../types';

interface GithubPanelProps {
  prs: GithubPR[];
  commits: GithubCommit[];
  onTokenSubmit: (token: string) => void;
  isTokenConnected: boolean;
  onDisconnectToken: () => void;
  isLoading: boolean;
}

export default function GithubPanel({ prs, commits, onTokenSubmit, isTokenConnected, onDisconnectToken, isLoading }: GithubPanelProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [activePrBrief, setActivePrBrief] = useState<{ [id: string]: string }>({});
  const [isBriefLoading, setIsBriefLoading] = useState<{ [id: string]: boolean }>({});

  const handleConnectToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    onTokenSubmit(tokenInput.trim());
    setTokenInput('');
    setShowTokenInput(false);
  };

  const handleFetchCodeBrief = async (pr: GithubPR) => {
    setIsBriefLoading((prev) => ({ ...prev, [pr.id]: true }));
    try {
      const response = await fetch('/api/gemini/code-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prTitle: pr.title, prDescription: pr.description }),
      });
      if (response.ok) {
        const data = await response.json();
        setActivePrBrief((prev) => ({ ...prev, [pr.id]: data.brief }));
      }
    } catch (err) {
      console.error('Failed to get code brief:', err);
    } finally {
      setIsBriefLoading((prev) => ({ ...prev, [pr.id]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-[#22C55E] border-emerald-500/20';
      case 'changes-requested':
        return 'bg-red-500/10 text-[#EF4444] border-red-500/20';
      default:
        return 'bg-amber-500/10 text-[#F59E0B] border-amber-500/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4 text-zinc-300" />
          <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">GitHub Integration</h2>
        </div>

        <div className="flex items-center gap-2">
          {isTokenConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-[#22C55E] font-medium border border-emerald-500/20">
                CONNECTED
              </span>
              <button
                onClick={onDisconnectToken}
                className="text-[10px] font-mono text-[#52525B] hover:text-[#EF4444] transition-all cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-[10px] font-mono px-2 py-1 rounded bg-[#1A1A1F] border border-[#27272A] text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Key className="w-3 h-3" />
              <span>{showTokenInput ? 'Cancel' : 'Link Token'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Token Connection UI */}
      <AnimatePresence>
        {showTokenInput && (
          <motion.div
            initial={{ opacity: 0, h: 0 }}
            animate={{ opacity: 1, h: 'auto' }}
            exit={{ opacity: 0, h: 0 }}
            className="p-6 border-b border-[#27272A] bg-[#111113]/50"
          >
            <form onSubmit={handleConnectToken} className="space-y-3">
              <span className="text-xs font-semibold text-[#FAFAFA] block">Connect Real GitHub API</span>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Provide a GitHub Personal Access Token (classic or fine-grained) with <code>repo</code> permissions
                to fetch real issues, pull requests, and commits in real-time.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste GitHub Token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 bg-[#111113] border border-[#27272A] rounded-lg py-2 px-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs text-[#FAFAFA] px-4 py-2 rounded-lg font-medium cursor-pointer transition-all"
                >
                  Connect
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {/* Open Pull Requests */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-sans font-semibold text-[#FAFAFA]">Pull Requests awaiting Review</h3>
            <span className="text-[10px] font-mono text-[#52525B]">({prs.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {prs.map((pr) => (
              <div
                key={pr.id}
                className="bg-[#111113] border border-[#27272A] rounded-xl p-4 space-y-3 relative group hover:border-[#3F3F46] transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      {pr.repoName}
                    </span>
                    <a
                      href={pr.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#FAFAFA] hover:text-indigo-400 transition-all flex items-center gap-1 leading-snug"
                    >
                      <span>{pr.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#52525B] group-hover:text-indigo-400 shrink-0" />
                    </a>
                  </div>

                  <span
                    className={`text-[9px] font-mono border px-2 py-0.5 rounded capitalize ${getStatusColor(
                      pr.status
                    )}`}
                  >
                    {pr.status}
                  </span>
                </div>

                {/* Stale Warning and Info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#52525B]">
                  <span>Opened {pr.daysOpen} days ago</span>
                  {pr.daysOpen > 3 && (
                    <span className="text-[#EF4444] font-semibold flex items-center gap-1 bg-red-500/10 px-1.5 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      STALE REVIEW
                    </span>
                  )}
                </div>

                {/* Code Brief Widget */}
                <div className="pt-2 border-t border-dashed border-[#27272A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#A78BFA]" />
                      Code Brief
                    </span>
                    {!activePrBrief[pr.id] && (
                      <button
                        onClick={() => handleFetchCodeBrief(pr)}
                        disabled={isBriefLoading[pr.id]}
                        className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded cursor-pointer transition-all"
                      >
                        {isBriefLoading[pr.id] ? 'Analyzing...' : 'Generate Brief'}
                      </button>
                    )}
                  </div>

                  {activePrBrief[pr.id] && (
                    <motion.p
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-sans text-indigo-200 bg-indigo-600/5 border border-indigo-500/10 rounded-lg p-2.5 leading-relaxed"
                    >
                      {activePrBrief[pr.id]}
                    </motion.p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Commits */}
        <div className="space-y-4">
          <h3 className="text-sm font-sans font-semibold text-[#FAFAFA] flex items-center gap-2">
            <span>Recent Repository Commits</span>
            <span className="text-[10px] font-mono text-[#52525B]">(Last 5)</span>
          </h3>

          <div className="bg-[#111113] border border-[#27272A] rounded-xl overflow-hidden divide-y divide-[#27272A]">
            {commits.map((commit, idx) => (
              <div key={idx} className="p-3.5 hover:bg-[#1A1A1F]/30 transition-all flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium text-zinc-400">{commit.repoName}</span>
                  <span className="text-[10px] font-mono text-[#52525B]">
                    {new Date(commit.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#FAFAFA] truncate font-mono">{commit.message}</p>
                <span className="text-[10px] text-[#52525B]">Authored by @{commit.author}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
