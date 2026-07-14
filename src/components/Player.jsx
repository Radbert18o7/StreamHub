import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { twMerge } from 'tailwind-merge';

export function Player({ channel, onStreamFailed, isSearching, className }) {
  const [error, setError] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);

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
    setError(null);
  }, [channel?.streamUrl]);

  // Auto-hide controls after 3s of inactivity
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  }, [isPlaying]);

  // When paused, always show controls
  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      clearTimeout(hideTimer.current);
    } else {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(hideTimer.current);
  }, [isPlaying]);

  // Tap/click to toggle controls on mobile
  const handleVideoTap = (e) => {
    e.stopPropagation();
    if (controlsVisible) {
      togglePlay();
    } else {
      showControls();
    }
  };

  // Fullscreen — works on both desktop and mobile (including iOS via webkitRequestFullscreen)
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // iOS Safari uses video element fullscreen
        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        } else if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Track fullscreen state changes
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  if (!channel) {
    return (
      <div className={twMerge("bg-black aspect-video flex items-center justify-center relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5", className)}>
        <div className="text-gray-500 flex flex-col items-center">
          <Play size={48} className="opacity-20 mb-4" />
          <p className="text-sm">Select a channel to start watching</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={twMerge(
        "group bg-black aspect-video flex items-center justify-center relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5",
        className
      )}
      onMouseMove={showControls}
      onMouseEnter={showControls}
      onTouchStart={showControls}
    >
      {/* Error / Searching overlay */}
      {(error || isSearching) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-20 p-4 text-center backdrop-blur-sm">
          {isSearching ? (
            <Loader2 size={40} className="text-[#0ea5e9] animate-spin mb-4" />
          ) : (
            <AlertTriangle size={40} className="text-red-500 mb-4" />
          )}
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">
            {isSearching ? 'Finding Alternatives...' : 'Stream Unavailable'}
          </h3>
          <p className="text-gray-400 max-w-md text-sm mb-4 px-2">
            {isSearching
              ? `Searching for a working stream of ${channel.name}...`
              : `The stream for ${channel.name} could not be loaded and no alternatives were found.`}
          </p>
          {!isSearching && (
            <button
              onClick={() => onStreamFailed(channel)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors px-5 py-2.5 rounded-xl text-white text-sm font-medium"
            >
              <RefreshCw size={16} />
              <span>Force Retry Search</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Buffering spinner */}
      {!error && isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/30 pointer-events-none">
          <Loader2 size={44} className="text-white animate-spin" />
        </div>
      )}

      {/* Video element — tap to toggle controls on mobile */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onClick={handleVideoTap}
      />

      {/* Controls overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Gradient background for controls */}
        <div className="bg-gradient-to-t from-black/95 via-black/50 to-transparent pt-10 pb-3 px-3 sm:pb-4 sm:px-5">

          {/* Channel name + LIVE badge */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 bg-red-600/25 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold tracking-wider">LIVE</span>
            </div>
            <span className="text-white text-sm font-medium truncate">
              {channel.name}
            </span>
          </div>

          {/* Main controls row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Play + Volume */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-[#0ea5e9] active:text-[#0ea5e9] transition-colors focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/20"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying
                  ? <Pause size={22} fill="currentColor" />
                  : <Play size={22} fill="currentColor" />
                }
              </button>

              {/* Mute button */}
              <button
                onClick={toggleMute}
                className="text-white hover:text-[#0ea5e9] active:text-[#0ea5e9] transition-colors focus:outline-none w-9 h-9 flex items-center justify-center"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0
                  ? <VolumeX size={22} />
                  : <Volume2 size={22} />
                }
              </button>

              {/* Volume slider — hidden on very small screens to save space */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolume(parseFloat(e.target.value))}
                className="hidden sm:block w-20 md:w-28 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#0ea5e9]"
                aria-label="Volume"
              />
            </div>

            {/* Right: Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#0ea5e9] active:text-[#0ea5e9] transition-colors focus:outline-none w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/20"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
