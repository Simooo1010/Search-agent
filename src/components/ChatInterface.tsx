import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Loader2, Send, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { useAgent } from '../hooks/useAgent';

export function ChatInterface() {
  const { sessions, activeSession, messages, isProcessing, sendMessage, createNewSession, switchSession } = useAgent();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="font-sans text-aether-ink bg-aether-bg w-full h-full md:grid md:grid-cols-[80px_320px_1fr] md:grid-rows-[auto_1fr_auto] flex flex-col overflow-hidden">
      
      {/* Left Rail */}
      <div className="hidden md:flex md:col-start-1 md:col-span-1 md:row-start-1 md:row-span-3 border-r border-aether-border flex-col items-center py-10 justify-between">
        <div className="font-serif font-black text-2xl text-aether-accent">Æ</div>
        <div className="writing-vertical-rl rotate-180 uppercase tracking-[4px] text-[10px] font-bold opacity-40">SURFACE / EXPLORATION</div>
        <div className="font-serif font-black text-[10px] text-aether-accent">●</div>
      </div>

      <header className="col-span-1 md:col-start-2 md:col-span-2 md:row-start-1 px-6 py-6 md:px-[60px] md:py-[40px] flex justify-between items-end border-b md:border-none border-aether-border z-10 flex-shrink-0">
        <div>
          <div className="font-mono text-[11px] uppercase border border-aether-ink px-3 py-1 rounded-[20px] inline-block mb-4">
            Agent Active / {new Date().toLocaleTimeString()}
          </div>
          <h1 className="font-serif text-4xl md:text-[48px] font-normal italic leading-[0.9]">Aether Agent</h1>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-[11px] opacity-40 uppercase tracking-[1px]">Task Priority</div>
          <div className="font-bold text-sm">HIGH (SEARCH)</div>
        </div>
      </header>

      {/* Mobile Sidebar / Tabs */}
      <div className="md:hidden flex overflow-x-auto gap-4 px-6 py-4 border-b border-aether-border items-center custom-scrollbar flex-shrink-0">
        <button 
          onClick={createNewSession}
          disabled={isProcessing}
          className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[1px] font-bold border border-aether-ink px-4 py-2 rounded-[20px] hover:bg-aether-ink hover:text-aether-bg disabled:opacity-30 transition-colors whitespace-nowrap"
        >
          + New Protocol
        </button>
        {sessions.map(s => (
          <button 
            key={s.id} 
            onClick={() => switchSession(s.id)}
            className={clsx(
              "flex-shrink-0 font-mono text-[10px] uppercase px-4 py-2 rounded-[20px] max-w-[150px] truncate transition-colors", 
              s.id === activeSession.id ? "bg-aether-ink text-aether-bg font-bold" : "border border-aether-border text-aether-ink/60 hover:text-aether-ink"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Desktop Sidebar (History & New Chat) */}
      <div className="hidden md:flex md:col-start-2 md:col-span-1 md:row-start-2 px-6 pb-6 md:pl-[60px] md:pr-[40px] border-r border-aether-border flex-col overflow-y-auto custom-scrollbar">
        <div className="mb-10">
          <button 
            onClick={createNewSession}
            disabled={isProcessing}
            className="w-full text-center font-mono text-[10px] uppercase tracking-[1px] font-bold border border-aether-ink text-aether-ink hover:bg-aether-ink hover:text-aether-bg disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-aether-ink transition-colors py-3 rounded-[20px]"
          >
            + Init New Protocol
          </button>
        </div>

        <div className="thought-chain mt-2 pl-[20px]">
          {sessions.map(s => (
            <div key={s.id} className="thought-item mb-[24px] relative cursor-pointer group" onClick={() => switchSession(s.id)}>
              {s.id === activeSession.id ? (
                <div className="absolute left-[-20px] top-[4px] md:top-[8px] w-[6px] h-[6px] bg-aether-accent rounded-full shadow-[0_0_8px_rgba(255,59,0,0.5)]"></div>
              ) : (
                <div className="absolute left-[-20px] top-[4px] md:top-[8px] w-[6px] h-[6px] bg-aether-ink opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
              )}
              <span className="text-[11px] uppercase tracking-[1px] font-bold block mb-1 text-aether-ink">
                {s.id === activeSession.id ? 'Active Session' : 'Archived Log'}
              </span>
              <p className={clsx("text-[14px] leading-[1.5] transition-opacity line-clamp-2", s.id === activeSession.id ? "opacity-100 font-medium text-aether-ink" : "opacity-50 text-aether-ink group-hover:opacity-100")}>
                {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main View */}
      <div className="md:col-start-3 md:col-span-1 md:row-start-2 flex-1 overflow-y-auto px-6 md:px-[60px] pb-[40px] custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center space-y-6">
              <div className="font-serif font-black text-6xl text-aether-accent opacity-20">Æ</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-serif italic text-aether-ink">Awaiting Query...</h2>
                <p className="text-sm text-aether-ink opacity-60 font-mono">
                  [SYSTEM: READY FOR WEB SEARCH & EXPLORATION]
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 md:gap-6"
              >
                {msg.role === 'user' ? (
                  // User Message -> Thought Chain Style
                  <div className="relative pl-6 mb-2">
                    <div className="absolute left-[-6px] top-1.5 w-1.5 h-1.5 bg-aether-accent rounded-full"></div>
                    <span className="text-[11px] uppercase tracking-[1px] font-bold block mb-1">Objective</span>
                    <div className="text-[14px] leading-[1.5] font-medium text-aether-ink opacity-90 break-words">
                      {msg.error ? (
                        <span className="text-red-500">{msg.error}</span>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ) : (
                  // Agent Message -> Browser Window Style (Main View)
                  <div className="bg-white border md:ml-6 border-aether-border rounded-[4px] shadow-[40px_40px_80px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden w-full">
                    <div className="h-[40px] bg-[#F1F1F1] border-b border-aether-border flex items-center px-[15px] gap-[10px]">
                      <div className="w-2 h-2 rounded-full bg-[#DDD]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#DDD]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#DDD]"></div>
                      <div className="bg-white h-[24px] flex-grow rounded-[3px] flex items-center px-[10px] font-mono text-[10px] text-[#999] truncate">
                        {msg.isStreaming ? 'https://aether.agent/exploring...' : 'https://aether.agent/results'}
                      </div>
                    </div>
                    <div className="p-6 md:p-[40px] flex-grow">
                      {msg.error ? (
                        <div className="flex items-start gap-2 text-aether-accent">
                          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">{msg.error}</span>
                        </div>
                      ) : (
                        <div className="max-w-none break-words">
                          {msg.isStreaming && !msg.text ? (
                            <div className="flex items-center gap-2 text-[#999] h-6 font-mono text-xs">
                              <Search className="w-4 h-4 animate-pulse" />
                              <span>[PARSING DATA STREAMS...]</span>
                            </div>
                          ) : (
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-aether-accent hover:underline opacity-80 hover:opacity-100" />,
                                h1: ({node, ...props}) => <h1 {...props} className="font-serif text-3xl mb-[15px] text-aether-ink font-normal" />,
                                h2: ({node, ...props}) => <h2 {...props} className="font-serif text-2xl mb-[15px] text-aether-ink font-normal mt-6" />,
                                h3: ({node, ...props}) => <h3 {...props} className="font-serif text-xl mb-[10px] text-aether-ink font-normal mt-4" />,
                                p: ({node, ...props}) => <p {...props} className="text-[13px] leading-[1.6] text-[#666] mb-4" />,
                                ul: ({node, ...props}) => <ul {...props} className="list-disc pl-5 text-[13px] text-[#666] mb-4" />,
                                ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-5 text-[13px] text-[#666] mb-4" />,
                                li: ({node, ...props}) => <li {...props} className="mb-2" />,
                                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-2 border-aether-accent pl-4 italic text-[#666] my-4" />,
                                code: ({node, inline, ...props}: any) => inline 
                                  ? <code {...props} className="bg-[#f5f5f5] text-aether-ink px-1 py-0.5 rounded text-xs font-mono" />
                                  : <code {...props} className="block bg-[#f5f5f5] text-aether-ink p-4 rounded text-xs font-mono my-4 overflow-x-auto" />
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          )}
                          {msg.isStreaming && msg.text && (
                            <span className="inline-block w-2 h-4 ml-1 bg-aether-accent animate-pulse align-middle"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Command Strip */}
      <div className="md:col-start-2 md:col-span-2 md:row-start-3 border-t border-aether-border p-6 md:px-[60px] md:py-[20px] flex items-center gap-[20px] flex-shrink-0 bg-aether-bg">
        <form onSubmit={handleSubmit} className="flex-grow w-full relative">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter objective..."
              disabled={isProcessing}
              className="w-full bg-transparent border-none border-b-2 border-aether-ink pb-2 font-serif text-xl md:text-[20px] outline-none disabled:opacity-50 text-aether-ink placeholder-aether-ink/30 transition-all focus:border-aether-accent focus:placeholder-transparent"
            />
            {isProcessing ? (
              <Loader2 className="absolute right-0 w-5 h-5 animate-spin text-aether-ink mb-2" />
            ) : (
              <button 
                type="submit" 
                disabled={!input.trim() || isProcessing}
                className="absolute right-0 text-aether-ink hover:text-aether-accent disabled:opacity-30 disabled:hover:text-aether-ink mb-2 transition-colors cursor-pointer"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="text-[11px] opacity-40 uppercase tracking-[1px] mt-2 hidden sm:block">
            {isProcessing ? '[EXECUTING SEARCH PROTOCOL...]' : 'Press Enter to execute'}
          </div>
        </form>
      </div>
    </div>
  );
}
