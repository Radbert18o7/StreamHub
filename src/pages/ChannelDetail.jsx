import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChannelStore } from '../store/useChannelStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { Player } from '../components/Player';
import { findAlternativeStream } from '../services/alternativeFinder';
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

  useEffect(() => {
    if (channels.length > 0 && id) {
      const channel = channels.find(c => c.id === decodeURIComponent(id));
      if (channel) {
        setCurrentChannel(channel);
        addToHistory(channel);
      }
    }
  }, [id, channels, addToHistory]);

  const handleStreamFailed = (failedChannel) => {
    const alternative = findAlternativeStream(failedChannel, channels);
    if (alternative) {
      setCurrentChannel(alternative);
      setToastMessage(`Original stream unavailable. Switched to alternative source for ${alternative.originalName}`);
      setShowToast(true);
    } else {
      setToastMessage(`No alternative streams found for ${failedChannel.name}`);
      setShowToast(true);
    }
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
            <h1 className="text-3xl font-bold text-white mb-3">{currentChannel.name}</h1>
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
