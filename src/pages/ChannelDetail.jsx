import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Player } from '../components/Player';
import { findAlternativeStream } from '../services/alternativeFinder';
import { scrapeWebForStream } from '../services/webStreamScraper';
import { Toast } from '../components/Toast';
import { Heart, ArrowLeft, AlertCircle } from 'lucide-react';

export function ChannelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const channels = useChannelStore(state => state.channels);
  const addToHistory = useSettingsStore(state => state.addToHistory);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite);

  const [currentChannel, setCurrentChannel] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Failover state
  const [retryCount, setRetryCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchInProgress = useRef(false);
  const [triedUrls, setTriedUrls] = useState([]);

  // Load channel IMMEDIATELY — no pre-validation, no blocking.
  // Let the player try to connect directly via HLS.js.
  // Only trigger failover if the player itself reports a real error.
  useEffect(() => {
    if (channels.length > 0 && id) {
      const channel = channels.find(c => c.id === decodeURIComponent(id));
      if (channel) {
        setCurrentChannel(channel);
        addToHistory(channel);
        setRetryCount(0);
        setTriedUrls([channel.streamUrl]);
        searchInProgress.current = false;
        setIsSearching(false);
      }
    }
  }, [id, channels]); // eslint-disable-line

  const handleStreamFailed = async (failedChannel) => {
    if (searchInProgress.current) return;
    searchInProgress.current = true;
    setIsSearching(true);

    // Brief pause to prevent rapid UI flashing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try local backup URLs
    if (retryCount < 5) {
      const alternative = findAlternativeStream(failedChannel, channels, triedUrls);
      if (alternative) {
        setRetryCount(prev => prev + 1);
        setTriedUrls(prev => [...prev, alternative.streamUrl]);
        setCurrentChannel(alternative);
        setToastMessage('Trying alternative source...');
        setShowToast(true);
        setIsSearching(false);
        searchInProgress.current = false;
        return;
      }
    }

    // All local sources exhausted — try web scraper
    setToastMessage('Local sources offline. Searching the web...');
    setShowToast(true);

    try {
      const webLinks = await scrapeWebForStream(failedChannel.originalName || failedChannel.name);
      const untriedWebLinks = webLinks.filter(url => !triedUrls.includes(url));

      if (untriedWebLinks.length > 0) {
        setToastMessage('Found web source! Connecting...');
        setShowToast(true);
        setTriedUrls(prev => [...prev, untriedWebLinks[0]]);
        setCurrentChannel({
          ...failedChannel,
          streamUrl: untriedWebLinks[0],
          id: failedChannel.id + '_web_' + Date.now(),
        });
        setRetryCount(0);
      } else {
        setToastMessage('No alternative streams found.');
        setShowToast(true);
      }
    } catch (err) {
      console.error(err);
      setToastMessage('Web search failed.');
      setShowToast(true);
    }

    setIsSearching(false);
    searchInProgress.current = false;
  };

  if (!currentChannel) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ea5e9]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <Player
        channel={currentChannel}
        onStreamFailed={handleStreamFailed}
        isSearching={isSearching}
        className="mb-8"
      />

      <div className="bg-[#1a1a24] p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-lg">
        <div className="flex items-center space-x-6">
          {currentChannel.logo ? (
            <div className="w-24 h-24 bg-zinc-900 p-2 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/10 shadow-inner">
              <img src={currentChannel.logo} alt={currentChannel.name} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl font-bold text-white/50 border border-white/10 shadow-inner">
              {currentChannel.name.substring(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{currentChannel.name}</h1>
            <div className="flex flex-wrap gap-2 text-sm">
              {currentChannel.country && (
                <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300 uppercase font-medium border border-white/5">
                  {currentChannel.country}
                </span>
              )}
              {currentChannel.group && (
                <span className="bg-[#0ea5e9]/20 text-[#0ea5e9] px-3 py-1 rounded-full font-medium border border-[#0ea5e9]/20">
                  {currentChannel.group}
                </span>
              )}
              {currentChannel.language && (
                <span className="bg-white/10 px-3 py-1 rounded-full text-gray-300 font-medium border border-white/5">
                  {currentChannel.language}
                </span>
              )}
              {currentChannel.backupUrls?.length > 0 && (
                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full font-medium border border-green-500/20">
                  {currentChannel.backupUrls.length + 1} sources
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-4 w-full sm:w-auto">
          <button
            onClick={() => toggleFavorite(currentChannel)}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isFavorite(currentChannel.id)
                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            }`}
          >
            <Heart size={20} fill={isFavorite(currentChannel.id) ? "currentColor" : "none"} />
            <span>{isFavorite(currentChannel.id) ? 'Saved' : 'Save'}</span>
          </button>

          <a
            href={`https://github.com/iptv-org/iptv/issues/new?title=Broken channel: ${encodeURIComponent(currentChannel.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white transition-all border border-white/5"
          >
            <AlertCircle size={20} />
            <span>Report Issue</span>
          </a>
        </div>
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
