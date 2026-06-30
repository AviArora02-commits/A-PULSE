import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layers,
  Cpu,
  Key,
  Database,
  ArrowRight,
  CheckCircle,
  Clock,
  Play,
  Terminal,
  RefreshCw,
  Copy,
  Plus,
  GitPullRequest,
  GraduationCap,
  Mail,
  AlertCircle
} from 'lucide-react';
import { SwarmConfig, SwarmStep } from '../types';

interface SwarmPanelProps {
  context: {
    emails: any[];
    tasks: any[];
    events: any[];
    assignments: any[];
    github: any[];
  };
  isLoading: boolean;
}

export default function SwarmPanel({ context, isLoading: isDashboardLoading }: SwarmPanelProps) {
  // Read/Write custom API keys to local storage
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem('pulse_anthropic_key') || '');
  const [kimiKey, setKimiKey] = useState(() => localStorage.getItem('pulse_kimi_key') || '');
  const [showKeysConfig, setShowKeysConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync keys dynamically in case the user edited them on the Credentials settings panel!
  useEffect(() => {
    setAnthropicKey(localStorage.getItem('pulse_anthropic_key') || '');
    setKimiKey(localStorage.getItem('pulse_kimi_key') || '');
  }, [showKeysConfig]);

  // Custom user prompt
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionSteps, setExecutionSteps] = useState<SwarmStep[]>([]);
  const [swarmResult, setSwarmResult] = useState<{
    subtasks?: { subtask1: string; subtask2: string };
    claudeOutput?: string;
    kimiOutput?: string;
    finalOutput?: string;
    isRealClaude?: boolean;
    isRealKimi?: boolean;
  } | null>(null);

  // Presets
  const presets = [
    {
      title: 'Unified Master Academic Strategy',
      description: 'Decomposes all Classroom assignments, maps them between Calendar events, and builds an exhaustive semester syllabus guide.',
      prompt: 'Review all my Classroom assignments and Calendar events. Synthesize them into an optimized, hourly semester exam-prep plan. Detail the exact assignments to tackle and draft a confirmation email to my study group.',
      icon: GraduationCap,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
    },
    {
      title: 'Code Bug Review & Github Tracker',
      description: 'Reviews open Pull Requests, scans for logical edge cases or styling issues, and drafts formal recruitment summaries.',
      prompt: 'Analyze my open GitHub PRs and Commits. Scan for logic vulnerabilities, structure a formal Code Quality Review report, and draft a LinkedIn update/portfolio outline sharing this work.',
      icon: GitPullRequest,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
    },
    {
      title: 'Recruitment & Communication Planner',
      description: 'Filters urgent recruiting emails, drafts professional sequence replies, and coordinates mock preparations.',
      prompt: 'Check my Gmail inbox for any hiring, recruiting, or urgent messages. Design a personalized interview follow-up email sequence and a list of 5 specialized behavioral questions to prepare.',
      icon: Mail,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    }
  ];

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pulse_anthropic_key', anthropicKey.trim());
    localStorage.setItem('pulse_kimi_key', kimiKey.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowKeysConfig(false);
    }, 1200);
  };

  const executeSwarm = async (promptText: string) => {
    if (!promptText.trim() || isExecuting) return;
    
    setIsExecuting(true);
    setSwarmResult(null);
    setCurrentStepIndex(0);

    // Initial steps setup
    const initialSteps: SwarmStep[] = [
      {
        agent: 'Gemini (Planner)',
        message: 'Decomposing task, extracting dashboard metadata, and routing specialized payloads...',
        timestamp: new Date().toLocaleTimeString(),
        status: 'active'
      },
      {
        agent: 'Claude (Logic Specialist)',
        message: 'Waiting for task delegation...',
        timestamp: '--:--',
        status: 'pending'
      },
      {
        agent: 'Kimi (Context Analyst)',
        message: 'Waiting for task delegation...',
        timestamp: '--:--',
        status: 'pending'
      },
      {
        agent: 'Gemini (Compiler)',
        message: 'Awaiting specialized worker outputs...',
        timestamp: '--:--',
        status: 'pending'
      }
    ];
    setExecutionSteps(initialSteps);

    try {
      // Step 1: Simulated delay for Planner thinking
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Trigger API Call
      const res = await fetch('/api/swarm/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          anthropicKey: localStorage.getItem('pulse_anthropic_key') || '',
          kimiKey: localStorage.getItem('pulse_kimi_key') || '',
          context
        })
      });

      if (!res.ok) throw new Error('Swarm execution failed');
      const data = await res.json();

      // Planner finished, update to step 2 (Claude Active)
      setExecutionSteps(prev => {
        const next = [...prev];
        next[0].status = 'completed';
        next[0].message = `Planner succeeded. Divided work into:\n- Logic: "${data.subtasks?.subtask1 || 'Algorithmic structure'}"\n- Context: "${data.subtasks?.subtask2 || 'Exhaustive summaries'}"`;
        next[1].status = 'active';
        next[1].message = `Analyzing subtask using ${data.isRealClaude ? 'LIVE Claude 3.5 Sonnet' : 'Claude 3.5 sandbox emulation'}...`;
        next[1].timestamp = new Date().toLocaleTimeString();
        return next;
      });
      setCurrentStepIndex(1);
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Claude finished, update to step 3 (Kimi Active)
      setExecutionSteps(prev => {
        const next = [...prev];
        next[1].status = 'completed';
        next[1].message = `Claude complete. Logical framework established (${data.claudeOutput?.substring(0, 100)}...)`;
        next[2].status = 'active';
        next[2].message = `Synthesizing context using ${data.isRealKimi ? 'LIVE Kimi Chat' : 'Kimi sandbox emulation'}...`;
        next[2].timestamp = new Date().toLocaleTimeString();
        return next;
      });
      setCurrentStepIndex(2);
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Kimi finished, update to step 4 (Compiler Active)
      setExecutionSteps(prev => {
        const next = [...prev];
        next[2].status = 'completed';
        next[2].message = `Kimi complete. Context structured (${data.kimiOutput?.substring(0, 100)}...)`;
        next[3].status = 'active';
        next[3].message = 'Synthesizing contributions into structured ultimate report...';
        next[3].timestamp = new Date().toLocaleTimeString();
        return next;
      });
      setCurrentStepIndex(3);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Compile completed
      setExecutionSteps(prev => {
        const next = [...prev];
        next[3].status = 'completed';
        next[3].message = 'Synthesis finished. Master report compiles fully.';
        return next;
      });
      setSwarmResult(data);
      setCurrentStepIndex(4);
    } catch (err: any) {
      console.error(err);
      setExecutionSteps(prev => {
        const next = [...prev];
        if (currentStepIndex >= 0 && next[currentStepIndex]) {
          next[currentStepIndex].status = 'pending';
          next[currentStepIndex].message = `Failed: ${err.message || 'Connection lost'}`;
        }
        return next;
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopy = () => {
    if (!swarmResult?.finalOutput) return;
    navigator.clipboard.writeText(swarmResult.finalOutput);
    alert('Master report copied to clipboard!');
  };

  // Helper to parse double asterisks for inline bolding
  const renderFormattedText = (text?: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      // Clean headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-semibold text-[#FAFAFA] mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-semibold text-indigo-300 mt-5 mb-2.5 border-b border-[#27272A] pb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-bold text-indigo-400 mt-6 mb-3">{line.replace('# ', '')}</h2>;
      }
      // Simple list parsing
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-[#D4D4D8] mb-1 leading-relaxed">
            {renderBoldText(line.substring(2))}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs text-[#D4D4D8] leading-relaxed mb-3 font-sans">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (str: string) => {
    const parts = str.split('**');
    return parts.map((part, index) => 
      index % 2 === 1 ? <strong key={index} className="text-[#FAFAFA] font-semibold">{part}</strong> : part
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="h-14 border-b border-[#27272A] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#A78BFA]" />
          <h2 className="text-base font-sans font-semibold text-[#FAFAFA]">Agentic Swarm Collaborator</h2>
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-bold ml-1.5 animate-pulse">
            MULTI-PLATFORM ROUTER
          </span>
        </div>

        <button
          onClick={() => setShowKeysConfig(!showKeysConfig)}
          className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
            anthropicKey || kimiKey
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-[#1A1A1F] border-[#27272A] text-indigo-400 hover:text-indigo-300'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>{anthropicKey || kimiKey ? 'Keys Configured' : 'Configure Swarm Keys'}</span>
        </button>
      </div>

      {/* Keys Config Panel Drawer */}
      <AnimatePresence>
        {showKeysConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-[#27272A] bg-[#111113]/80 overflow-hidden"
          >
            <form onSubmit={handleSaveKeys} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Swarm Platforms Credentials
                </span>
                <span className="text-[10px] font-mono text-[#52525B]">Credentials stored securely in LocalStorage</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed max-w-2xl">
                Add keys to leverage real collaborative swarm power! If left blank, Pulse automatically triggers high-fidelity sandbox emulation utilizing fine-tuned Gemini model instances mimicking each specialized sub-agent persona perfectly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A1A1AA] block uppercase tracking-wider">Anthropic (Claude 3.5 Sonnet) API Key</label>
                  <input
                    type="password"
                    placeholder="sk-ant-..."
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2 px-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-[#A1A1AA] block uppercase tracking-wider">Moonshot (Kimi Chat) API Key</label>
                  <input
                    type="password"
                    placeholder="km-..."
                    value={kimiKey}
                    onChange={(e) => setKimiKey(e.target.value)}
                    className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg py-2 px-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeysConfig(false)}
                  className="px-4 py-2 text-xs font-sans text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs text-white px-5 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Keys Saved!</span>
                    </>
                  ) : (
                    <span>Save Configuration</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
        {/* Dynamic AI Heartbeat Monitor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-medium text-[#52525B] uppercase tracking-wider">Active Swarm Network Grid</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="live-dot w-2 h-2 rounded-full bg-[#22C55E]" />
              Sync Online
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#FAFAFA] block">Gemini 3.5 Flash</span>
                <span className="text-[10px] font-mono text-indigo-400">Swarm Leader / Coordinator</span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span className="text-[8px] font-mono text-[#52525B]">PRIMARY</span>
              </div>
            </div>

            <div className={`bg-[#111113] border border-[#27272A] rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden transition-all ${anthropicKey ? 'border-emerald-500/20' : ''}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${anthropicKey ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#FAFAFA] block">Claude 3.5 Sonnet</span>
                <span className="text-[10px] font-mono text-[#A1A1AA]">
                  {anthropicKey ? 'Live API Key Connected' : 'Sandbox Emulation Mode'}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${anthropicKey ? 'bg-[#22C55E]' : 'bg-amber-500'}`} />
                <span className="text-[8px] font-mono text-[#52525B]">{anthropicKey ? 'LIVE' : 'EMULATED'}</span>
              </div>
            </div>

            <div className={`bg-[#111113] border border-[#27272A] rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden transition-all ${kimiKey ? 'border-emerald-500/20' : ''}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${kimiKey ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#FAFAFA] block">Kimi Chat (Moonshot)</span>
                <span className="text-[10px] font-mono text-[#A1A1AA]">
                  {kimiKey ? 'Live API Key Connected' : 'Sandbox Emulation Mode'}
                </span>
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${kimiKey ? 'bg-[#22C55E]' : 'bg-amber-500'}`} />
                <span className="text-[8px] font-mono text-[#52525B]">{kimiKey ? 'LIVE' : 'EMULATED'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input & Presets */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#FAFAFA] flex items-center gap-1.5">
            <Play className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
            Launch Heavy Cognitive Task
          </h3>

          {/* Quick presets cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presets.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCustomPrompt(p.prompt);
                    executeSwarm(p.prompt);
                  }}
                  disabled={isExecuting}
                  className={`text-left p-5 rounded-xl border border-[#27272A] hover:border-[#3F3F46] bg-[#111113] hover:bg-[#1A1A1F]/35 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer relative group disabled:opacity-50`}
                >
                  <div className="space-y-2">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${p.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-semibold text-[#FAFAFA] leading-snug">{p.title}</h4>
                    <p className="text-[11px] text-[#A1A1AA] leading-relaxed font-sans">{p.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Assemble Swarm
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom text-area prompt */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 space-y-4">
            <span className="text-xs font-semibold text-[#FAFAFA] block">Or write a custom collaborative prompt:</span>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Cross-reference my GitHub issues with Gmail notifications and design a priority code deployment syllabus guide..."
              rows={3}
              className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-lg p-3 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-[#52525B]">Swarm passes full dashboard context payload securely</span>
              <button
                onClick={() => executeSwarm(customPrompt)}
                disabled={isExecuting || !customPrompt.trim()}
                className="bg-[#FAFAFA] hover:bg-[#E4E4E7] text-[#09090B] px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Swarm Operating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Assemble & Run Swarm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Swarm Collaboration Process Monitor */}
        {executionSteps.length > 0 && (
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-[#FAFAFA]">Live Collaboration Pipeline Log</h3>
              </div>
              <span className="text-[10px] font-mono text-[#52525B]">Active Pipelines: 4 Agent Nodes</span>
            </div>

            <div className="space-y-4 relative pl-4 border-l border-[#27272A]">
              {executionSteps.map((step, idx) => {
                const isActive = step.status === 'active';
                const isCompleted = step.status === 'completed';

                return (
                  <div key={idx} className="relative space-y-1.5 pb-2">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border transition-all ${
                      isActive ? 'bg-indigo-500 border-indigo-400 scale-125 focus-ring' :
                      isCompleted ? 'bg-emerald-500 border-emerald-400' : 'bg-zinc-800 border-zinc-700'
                    }`} />

                    <div className="flex items-center gap-2 justify-between">
                      <span className={`text-xs font-semibold ${isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-[#52525B]'}`}>
                        {step.agent}
                      </span>
                      <span className="text-[10px] font-mono text-[#52525B]">{step.timestamp}</span>
                    </div>
                    
                    <p className={`text-xs whitespace-pre-line leading-relaxed ${isActive ? 'text-[#FAFAFA] font-medium' : isCompleted ? 'text-[#A1A1AA]' : 'text-[#52525B]'}`}>
                      {step.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Swarm Result Block */}
        <AnimatePresence>
          {swarmResult?.finalOutput && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#27272A] pb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-[#FAFAFA]">Compiled Masterpiece Report</h3>
                </div>

                <button
                  onClick={handleCopy}
                  className="text-[10px] font-mono text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 bg-[#1A1A1F] border border-[#27272A] px-3 py-1.5 rounded-lg cursor-pointer hover:border-[#3F3F46] transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </button>
              </div>

              {/* Master Output Render */}
              <div className="prose prose-invert prose-xs max-w-none space-y-2">
                {renderFormattedText(swarmResult.finalOutput)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
