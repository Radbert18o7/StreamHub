# StreamHub — Free & Open IPTV Web Streaming App

StreamHub is a 100% free, open-source, ad-free IPTV streaming web application. It pulls live TV channels from public M3U/M3U8 playlists (such as the community-driven iptv-org repository) and plays them directly in your browser.

## Features
- **Zero Ads, Zero Tracking:** No ad SDKs, analytics, or third-party trackers.
- **Client-Side Only:** No backend server required. All personalization (favorites, watch history) is stored locally in your browser.
- **Alternative Stream Finder:** If a channel's stream goes down or is blocked, the app automatically searches for an alternative source with the same name or ID.
- **Fast Search:** Fuzzy search across thousands of channels using Fuse.js.
- **PWA Ready:** Installable as a Progressive Web App for desktop and mobile.
- **Offline Shell:** The app shell caches for instant load times.

## Setup & Running Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided localhost URL in your browser.

## Deployment to GitHub Pages

This app is configured to be deployed as a static site on GitHub Pages. It uses a `HashRouter` to prevent 404 errors on direct navigation.

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The output will be in the `dist` directory.
3. Deploy the `dist` directory to your `gh-pages` branch.

## Data Sources

StreamHub uses public IPTV playlists from the following community projects:
- [iptv-org/iptv](https://github.com/iptv-org/iptv) (Primary Source)
- [Free-TV/IPTV](https://github.com/Free-TV/IPTV)
- [Kimentanm/aptv](https://github.com/Kimentanm/aptv)

*Note: StreamHub respects the IPTV-Org community lists. Some channels may be geo-restricted or CORS-blocked depending on your network. The Alternative Stream Finder attempts to bypass broken streams automatically.*
