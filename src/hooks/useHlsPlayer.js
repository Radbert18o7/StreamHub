import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export function useHlsPlayer(streamUrl, autoPlay = true, onError = () => {}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  // Buffering timeout to trigger error if stream hangs for more than 10 seconds
  useEffect(() => {
    let timeout;
    if (isBuffering && !isPlaying) {
      timeout = setTimeout(() => {
        onError({ type: 'TIMEOUT', details: 'Stream took too long to load' });
      }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [isBuffering, isPlaying, streamUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    const attachEvents = () => {
      video.addEventListener('playing', () => {
        setIsPlaying(true);
        setIsBuffering(false);
      });
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('waiting', () => setIsBuffering(true));
      video.addEventListener('error', (e) => {
        onError(e);
      });
    };

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    setIsBuffering(true);

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      cleanup();
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(e => console.warn("Auto-play prevented", e));
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              cleanup();
              onError(data);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("Fatal media error encountered, try to recover");
              hls.recoverMediaError();
              break;
            default:
              cleanup();
              onError(data);
              break;
          }
        } else {
          // Trigger error fallback on manifest load failure
          if(data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            onError(data);
          }
        }
      });

      attachEvents();
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || streamUrl.endsWith('.mp4') || streamUrl.endsWith('.ts')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        if (autoPlay) {
          video.play().catch(e => console.warn("Auto-play prevented", e));
        }
      });
      attachEvents();
    } else {
      onError({ type: 'UNSUPPORTED', details: 'Stream format not supported' });
    }

    return cleanup;
  }, [streamUrl, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleVolume = (newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) handleVolume(0.5);
    }
  };

  return {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    isBuffering,
    togglePlay,
    handleVolume,
    toggleMute,
  };
}
