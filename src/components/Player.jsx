import React, { useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { twMerge } from 'tailwind-merge';

export function Player({ channel, onStreamFailed, className }) {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setError(err);
    if (onStreamFailed) {
      onStreamFailed(channel);
    }
  };

  const {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    isBuffering,
    togglePlay,
    handleVolume,
    toggleMute
  } = useHlsPlayer(channel?.streamUrl, true, handleError);

  useEffect(() => {
    setError(null); // Reset error when channel changes
  }, [channel?.streamUrl]);

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!document.fullscreenElement && container) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (!channel) {
    return (
      <div className={twMerge("bg-black aspect-video flex items-center justify-center relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5", className)}>
        <div className="text-gray-500 flex flex-col items-center">
          <Play size={48} className="opacity-20 mb-4" />
          <p>Select a channel to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge("group bg-black aspect-video flex items-center justify-center relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5", className)}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20 p-4 text-center backdrop-blur-sm">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Stream Unavailable</h3>
          <p className="text-gray-400 max-w-md text-sm mb-4">
            The stream for {channel.name} could not be loaded. Searching for an alternative source...
          </p>
          <button 
            onClick={() => onStreamFailed(channel)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg"
          >
            <RefreshCw size={16} />
            <span>Try Alternative Now</span>
          </button>
        </div>
      ) : null}

      {!error && isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 pointer-events-none">
          <Loader2 size={48} className="text-white animate-spin" />
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-end">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button onClick={togglePlay} className="text-white hover:text-[#0ea5e9] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] rounded">
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
            </button>
            
            <div className="flex items-center space-x-3 group/volume">
              <button onClick={toggleMute} className="text-white hover:text-[#0ea5e9] transition-colors focus:outline-none">
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-24 origin-left scale-x-0 group-hover/volume:scale-x-100 transition-all duration-300 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
              />
            </div>

            <div className="flex items-center space-x-2 bg-red-600/20 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-500 text-xs font-bold tracking-wider">LIVE</span>
            </div>
            
            <span className="text-white text-base font-medium border-l border-white/20 pl-6 line-clamp-1">
              {channel.name}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleFullscreen} className="text-white hover:text-[#0ea5e9] transition-colors focus:outline-none">
              <Maximize size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
