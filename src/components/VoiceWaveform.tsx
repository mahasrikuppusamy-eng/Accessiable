import React from 'react';

interface VoiceWaveformProps {
  isListening: boolean;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({ isListening }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-8 px-2">
      {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
        <span
          key={bar}
          style={{
            animationDelay: `${bar * 0.12}s`,
            animationDuration: isListening ? '0.8s' : '0s',
            height: isListening ? `${Math.sin(bar) * 16 + 18}px` : '4px',
          }}
          className={`w-1 rounded-full bg-cyan-400 transition-all ${
            isListening ? 'animate-pulse' : 'opacity-40'
          }`}
        />
      ))}
    </div>
  );
};
