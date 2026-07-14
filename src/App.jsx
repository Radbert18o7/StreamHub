import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Favorites } from './pages/Favorites';
import { ChannelDetail } from './pages/ChannelDetail';
import { useChannelStore } from './store/useChannelStore';
import { loadPlaylists } from './services/playlistFetcher';

function App() {
  const setChannels = useChannelStore(state => state.setChannels);
  const setLoading = useChannelStore(state => state.setLoading);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const channels = await loadPlaylists();
        setChannels(channels);
      } catch (err) {
        console.error("Failed to load playlists", err);
        setLoading(false);
      }
    };
    init();
  }, [setChannels, setLoading]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<Browse />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="channel/:id" element={<ChannelDetail />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
