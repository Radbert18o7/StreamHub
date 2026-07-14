import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useHealthStore } from '../store/useHealthStore';
import { Player } from '../components/Player';
import { findAlternativeStream } from '../services/alternativeFinder';
import { scrapeWebForStream } from '../services/webStreamScraper';
import { findBestWorkingUrl, findFirstWorkingUrl, setCachedHealth } from '../services/streamHealthChecker';
import { Toast } from '../components/Toast';
import { Heart, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function ChannelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const channels = useChannelStore(state => state.channels);
  const addToHistory = useSettingsStore(state => state.addToHistory);
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite);
  const setHealth = useHealthStore(state => state.setHealth);

  const [currentChannel, setCurrentChannel] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isValidating, setIsValidating] = useState(false); // Pre-play validation
  const [validationMsg, setValidationMsg] = useState('');

  // Failover state
  const [retryCount, setRetryCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchInProgress = useRef(false);
  const [triedUrls, setTriedUrls] = useState([]);

  useEffect(() => {
    if (channels.length > 0 && id) {
      const channel = channels.find(c => c.id === decodeURIComponent(id));
      if (channel) {
        loadChannelWithValidation(channel);
        addToHistory(channel);
      }
    }
  }, [id, channels]); // eslint-disable-line

  /**
   * Core intelligence: before loading the player, probe ALL known URLs
   * for this channel in parallel and immediately use the first working one.
   */
  const loadChannelWithValidation = async (channel) => {
    setIsValidating(true);
    setValidationMsg('Checking stream availability...');
    setRetryCount(0);
    searchInProgress.current = false;

    try {
      const allUrls = [channel.streamUrl, ...(channel.backupUrls || [])].filter(Boolean);
      
      setValidationMsg(`Probing ${allUrls.length} source${allUrls.length !== 1 ? 's' : ''} in parallel...`);

      const workingUrl = await findBestWorkingUrl(channel);

      if (workingUrl) {
        // Mark health in store for card indicators
        setHealth(channel.streamUrl, workingUrl === channel.streamUrl);
        setCachedHealth(workingUrl, true);

        const readyChannel = workingUrl !== channel.streamUrl
          ? { ...channel, streamUrl: workingUrl, backupUrls: allUrls.filter(u => u !== workingUrl) }
          : channel;

        setTriedUrls([workingUrl]);
        setCurrentChannel(readyChannel);

        if (workingUrl !== channel.streamUrl) {
          setToastMessage('Primary stream offline — switched to working backup automatically.');
          setShowToast(true);
        }
      } else {
        // All known URLs are dead — go straight to web search
        setValidationMsg('All local sources offline. Searching the web...');
        setHealth(channel.streamUrl, false);
        setCurrentChannel(channel); // Mount player (will show error UI)
        setTriedUrls(allUrls);
        handleStreamFailed(channel, true);
        return;
      }
    } catch (e) {
      console.error('[ChannelDetail] Validation error:', e);
      setCurrentChannel(channel);
      setTriedUrls([channel.streamUrl]);
    }

    setIsValidating(false);
    setValidationMsg('');
  };

  const handleStreamFailed = async (failedChannel, fromValidation = false) => {
    if (searchInProgress.current) return;

    searchInProgress.current = true;
    if (!fromValidation) {
      setIsSearching(true);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Mark this URL as dead
    setCachedHealth(failedChannel.streamUrl, false);
    setHealth(failedChannel.streamUrl, false);

    if (retryCount < 5) {
      const alternative = findAlternativeStream(failedChannel, channels, triedUrls);
      if (alternative) {
        // Validate the alternative before switching to it
        const altWorks = await findFirstWorkingUrl([alternative.streamUrl]);
        if (altWorks) {
          setRetryCount(prev => prev + 1);
          setTriedUrls(prev => [...prev, alternative.streamUrl]);
          setCurrentChannel(alternative);
          setToastMessage('Switched to a working alternative source.');
          setShowToast(true);
          setIsSearching(false);
          setIsValidating(false);
          searchInProgress.current = false;
          return;
        } else {
          setCachedHealth(alternative.streamUrl, false);
          setHealth(alternative.streamUrl, false);
        }
      }
    }

    // All local sources exhausted — hit the web scraper
    setIsSearching(true);
    setIsValidating(false);
    setToastMessage('All local sources offline. Searching the web...');
    setShowToast(true);

    try {
      const webLinks = await scrapeWebForStream(failedChannel.originalName || failedChannel.name);
      const untriedWebLinks = webLinks.filter(url => !triedUrls.includes(url));

      if (untriedWebLinks.length > 0) {
        // Validate web links in parallel too
        const workingWebUrl = await findFirstWorkingUrl(untriedWebLinks);
        if (workingWebUrl) {
          setToastMessage('Found a working stream on the web!');
          setShowToast(true);
          setTriedUrls(prev => [...prev, workingWebUrl]);
          setCurrentChannel({
            ...failedChannel,
            streamUrl: workingWebUrl,
            id: failedChannel.id + '_web_' + Date.now(),
          });
          setRetryCount(0);
        } else {
          setToastMessage('Found web sources but all are offline too.');
          setShowToast(true);
        }
      } else {
        setToastMessage('No alternative streams found anywhere.');
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

  // Pre-validation loading screen
  if (isValidating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 gap-5"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-t-[#0ea5e9] animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-1">Finding Best Stream</h2>
          <p className="text-gray-400 text-sm">{validationMsg}</p>
        </div>
      </motion.div>
    );
  }

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
              {/* Backup sources count badge */}
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
