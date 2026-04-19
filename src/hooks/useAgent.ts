import { useState, useCallback, useMemo } from 'react';
import { ai, systemInstruction } from '../lib/gemini';
import { Content } from '@google/genai';

export type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  error?: string;
};

export type Session = {
  id: string;
  title: string;
  messages: Message[];
  history: Content[];
};

export function useAgent() {
  const [sessions, setSessions] = useState<Session[]>([
    { id: 'default', title: 'New Exploration', messages: [], history: [] }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('default');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeSession = useMemo(
    () => sessions.find(s => s.id === activeSessionId) || sessions[0], 
    [sessions, activeSessionId]
  );

  const createNewSession = useCallback(() => {
    const newId = Math.random().toString(36).substring(7);
    setSessions(prev => [{ id: newId, title: 'New Exploration', messages: [], history: [] }, ...prev]);
    setActiveSessionId(newId);
  }, []);

  const switchSession = useCallback((id: string) => {
    if (!isProcessing) {
      setActiveSessionId(id);
    }
  }, [isProcessing]);

  const updateActiveSession = useCallback((updater: (session: Session) => Session) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? updater(s) : s));
  }, [activeSessionId]);

  const sendMessage = useCallback(async (text: string) => {
    const userMessageId = Math.random().toString(36).substring(7);
    const modelMessageId = Math.random().toString(36).substring(7);
    
    updateActiveSession(session => {
      const newTitle = session.messages.length === 0 
        ? text.slice(0, 30) + (text.length > 30 ? '...' : '') 
        : session.title;
      return {
        ...session,
        title: newTitle,
        messages: [
          ...session.messages,
          { id: userMessageId, role: 'user', text },
          { id: modelMessageId, role: 'model', text: '', isStreaming: true }
        ]
      };
    });
    
    setIsProcessing(true);

    const newUserContent: Content = { role: 'user', parts: [{ text }] };
    const currentHistory = [...activeSession.history, newUserContent];

    try {
      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview',
        contents: currentHistory,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }]
        }
      });

      let fullModelText = '';
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullModelText += chunk.text;
          updateActiveSession(session => ({
            ...session,
            messages: session.messages.map(msg => 
              msg.id === modelMessageId ? { ...msg, text: fullModelText } : msg
            )
          }));
        }
      }

      updateActiveSession(session => ({
        ...session,
        messages: session.messages.map(msg => 
          msg.id === modelMessageId ? { ...msg, isStreaming: false } : msg
        ),
        history: [...session.history, newUserContent, { role: 'model', parts: [{ text: fullModelText }] }]
      }));

    } catch (err: any) {
      console.error('Agent error:', err);
      updateActiveSession(session => ({
        ...session,
        messages: session.messages.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, isStreaming: false, error: err.message || 'An error occurred while fetching information.' } 
            : msg
        )
      }));
    } finally {
      setIsProcessing(false);
    }
  }, [activeSession, updateActiveSession]);

  return {
    sessions,
    activeSession,
    messages: activeSession.messages,
    isProcessing,
    sendMessage,
    createNewSession,
    switchSession
  };
}
