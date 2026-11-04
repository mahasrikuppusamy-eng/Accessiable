import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Send, Sparkles, Navigation, Bot } from 'lucide-react';
import { VoiceWaveform } from './VoiceWaveform';
import { useLocation } from '../context/LocationContext';
import { AICommandResponse } from '../types';

interface VoiceAssistantProps {
  onExecuteAction: (action: string, payload: any) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onExecuteAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Vanakkam! I am your Coimbatore Accessibility Assistant. Speak or type commands like "Find hospitals near me", "Nearest accessible mall", or "What is my location?".',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const { userLocation } = useLocation();
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Indian English accent recognition

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendCommand(transcript);
        }
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Text to Speech
  const speakText = (text: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use the text chat input.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const handleSendCommand = async (transcript: string) => {
    if (!transcript.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: transcript,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          userLocation,
        }),
      });

      const data: AICommandResponse & { success: boolean } = await res.json();

      if (data.success) {
        const botMsg: Message = {
          sender: 'assistant',
          text: data.speech,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
        speakText(data.speech);

        // Execute frontend action (navigate, filter, search, add, etc.)
        if (data.action) {
          onExecuteAction(data.action, data.payload);
        }
      }
    } catch (err) {
      console.error('Failed to process AI command:', err);
      const errorMsg: Message = {
        sender: 'assistant',
        text: 'Sorry, I had trouble processing that command. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleSendCommand(inputText);
  };

  const sampleCommands = [
    'Find hospitals near me',
    'Which is the nearest accessible mall?',
    'Take me to PSG Hospital',
    'Wheelchair restaurants within 2 km',
    'What is my current location?',
    'Add a new place',
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-2xl hover:shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center ring-4 ring-white/20 cursor-pointer group"
        aria-label="Open AI Voice Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </span>
        <Mic className="w-6 h-6 text-white group-hover:animate-bounce" />
      </button>

      {/* Glassmorphic Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[400px] h-[520px] max-h-[80vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200/50 dark:border-indigo-800/60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm flex items-center gap-1.5">
                  AccessAble AI Voice
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </h3>
                <p className="text-[10px] text-cyan-200">Coimbatore Location-Aware AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                title={speechEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-200 transition-colors cursor-pointer"
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60 shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{m.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-indigo-600 dark:text-cyan-400 font-medium text-xs py-1">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Searching Coimbatore directory...</span>
              </div>
            )}
          </div>

          {/* Quick Voice Suggestions */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {sampleCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => handleSendCommand(cmd)}
                className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Waveform when listening */}
          {isListening && (
            <div className="py-2 bg-indigo-900 text-white flex items-center justify-center gap-3">
              <span className="text-xs font-semibold text-cyan-300">Listening to your voice...</span>
              <VoiceWaveform isListening={isListening} />
            </div>
          )}

          {/* Input & Mic Controls */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 hover:bg-indigo-100 dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Stop listening' : 'Start microphone'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              placeholder="Ask anything or tap mic..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
