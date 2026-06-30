import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, ArrowLeft, MessageSquare, Terminal, Eye, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage } from '../types';

interface AiSidebarProps {
  proactiveInsight: string;
  isInsightLoading: boolean;
  onRefreshInsights: () => void;
  dashboardContext: {
    emails: any[];
    tasks: any[];
    events: any[];
    assignments: any[];
    github: any[];
  };
}

export default function AiSidebar({
  proactiveInsight,
  isInsightLoading,
  onRefreshInsights,
  dashboardContext,
}: AiSidebarProps) {
  const [activeMode, setActiveMode] = useState<'proactive' | 'chat'>('proactive');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingTextId, setSpeakingTextId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (activeMode === 'proactive') {
      setActiveMode('chat');
    }
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingTextId === id) {
        window.speechSynthesis.cancel();
        setSpeakingTextId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#`_\-]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => {
          setSpeakingTextId(null);
        };
        utterance.onerror = () => {
          setSpeakingTextId(null);
        };
        setSpeakingTextId(id);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, streamingResponse, isThinking]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isThinking) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setActiveMode('chat');
    setIsThinking(true);
    setStreamingResponse('');

    // Add user message to history
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: userMsg }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          context: dashboardContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach Gemini');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No streaming reader available');
      }

      const decoder = new TextDecoder('utf-8');
      let currentResult = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        currentResult += chunk;
        setStreamingResponse(currentResult);
      }

      // Commit the complete response to chat history
      setChatHistory((prev) => [...prev, { role: 'model', text: currentResult }]);
      setStreamingResponse('');
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'model', text: `Thinking failed: ${err.message || 'Check connection'}. Try asking again.` },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="w-80 border-l border-[#27272A] bg-[#111113] flex flex-col h-full shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="h-14 border-b border-[#27272A] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#A78BFA] animate-pulse" />
          <span className="text-sm font-sans font-semibold text-[#FAFAFA]">Pulse AI</span>
          <span className="text-[9px] font-mono font-bold bg-[#A78BFA]/10 text-[#A78BFA] px-1.5 py-0.5 rounded ml-1">
            AI
          </span>
        </div>

        {activeMode === 'chat' && (
          <button
            onClick={() => {
              setActiveMode('proactive');
              setStreamingResponse('');
            }}
            className="text-[10px] font-mono text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1 bg-[#1A1A1F] border border-[#27272A] px-2 py-1 rounded-md cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Show Proactive</span>
          </button>
        )}
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin flex flex-col min-h-0">
        {activeMode === 'proactive' ? (
          // Mode 1: Proactive insights
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-medium text-[#52525B] uppercase tracking-wider">
                Proactive Feed Insights
              </span>
              <button
                onClick={onRefreshInsights}
                disabled={isInsightLoading}
                className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 disabled:opacity-50 cursor-pointer"
              >
                {isInsightLoading ? 'Thinking...' : 'Recalculate'}
              </button>
            </div>

            {isInsightLoading ? (
              // Skeleton
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-[#1A1A1F] rounded w-1/3" />
                <div className="h-4 bg-[#1A1A1F] rounded w-full" />
                <div className="h-4 bg-[#1A1A1F] rounded w-5/6" />
                <div className="h-4 bg-[#1A1A1F] rounded w-4/5" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-line font-sans">
                    {proactiveInsight ||
                      "Syncing your data. I am monitoring your workspace to highlight urgent items."}
                  </p>
                </div>

                {/* Subtitle / Tip block */}
                <div className="bg-[#1A1A1F] border border-[#27272A] rounded-xl p-4.5 space-y-2 mt-auto">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Student Copilot
                  </span>
                  <p className="text-[11px] text-[#52525B] leading-relaxed">
                    Ask me to summarize specific Flipkart emails, estimate durations, draft professor replies, or find free calendar slots.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Mode 2: Chat Mode
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col gap-1 text-xs leading-relaxed max-w-[90%] ${
                    msg.role === 'user' ? 'ml-auto items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525B]">
                    <span>{msg.role === 'user' ? 'You' : 'Pulse Assistant'}</span>
                    {msg.role === 'model' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, `msg-${index}`)}
                        className="p-1 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#A78BFA] transition-all cursor-pointer flex items-center justify-center"
                        title={speakingTextId === `msg-${index}` ? "Stop Speaking" : "Listen Response"}
                      >
                        {speakingTextId === `msg-${index}` ? (
                          <VolumeX className="w-3 h-3 text-indigo-400" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <div
                    className={`rounded-xl px-3.5 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-[#FAFAFA]'
                        : 'bg-[#1A1A1F] border border-[#27272A] text-[#A1A1AA]'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Streaming Response Render */}
              {streamingResponse && (
                <div className="flex flex-col gap-1 text-xs leading-relaxed max-w-[90%] items-start">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525B]">
                    <span>Pulse Assistant</span>
                    <button
                      type="button"
                      onClick={() => speakText(streamingResponse, 'msg-streaming')}
                      className="p-1 rounded hover:bg-[#1A1A1F] text-[#52525B] hover:text-[#A78BFA] transition-all cursor-pointer flex items-center justify-center"
                      title={speakingTextId === 'msg-streaming' ? "Stop Speaking" : "Listen Response"}
                    >
                      {speakingTextId === 'msg-streaming' ? (
                        <VolumeX className="w-3 h-3 text-indigo-400" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl px-3.5 py-2.5 bg-[#1A1A1F] border border-[#27272A] text-[#A1A1AA]">
                    {streamingResponse}
                  </div>
                </div>
              )}

              {/* Thinking Indicator */}
              {isThinking && !streamingResponse && (
                <div className="flex items-center gap-1.5 p-2 text-[#52525B]">
                  <span className="text-[10px] font-mono animate-pulse">Pulse is thinking</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-indigo-400 animate-[thinkDot_1.4s_infinite_0s]" />
                    <div className="w-1 h-1 rounded-full bg-indigo-400 animate-[thinkDot_1.4s_infinite_0.2s]" />
                    <div className="w-1 h-1 rounded-full bg-indigo-400 animate-[thinkDot_1.4s_infinite_0.4s]" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Chat input at bottom */}
      <div className="p-4 border-t border-[#27272A] bg-[#111113]/80">
        <form onSubmit={handleSendChat} className="relative flex items-center">
          <input
            type="text"
            placeholder="Ask Pulse anything..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => {
              if (activeMode === 'proactive') {
                setActiveMode('chat');
              }
            }}
            className="w-full bg-[#1A1A1F] border border-[#27272A] rounded-xl py-2.5 pl-3.5 pr-16 text-xs text-[#FAFAFA] placeholder-[#52525B] focus:border-indigo-500/50 focus:outline-none transition-all"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1 rounded transition-all cursor-pointer ${
                isListening
                  ? 'text-red-400 bg-red-500/10 animate-pulse'
                  : 'text-[#52525B] hover:text-indigo-400'
              }`}
              title={isListening ? "Listening... Click to stop" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              type="submit"
              disabled={!chatInput.trim() || isThinking}
              className="text-[#52525B] hover:text-indigo-400 disabled:opacity-40 transition-all cursor-pointer p-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
