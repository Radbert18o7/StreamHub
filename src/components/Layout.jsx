import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar />
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="py-8 mt-auto border-t border-white/5 text-center text-sm text-gray-500 bg-[#1a1a24]/50">
        <p>100% Free & Open Source, No Ads, No Tracking.</p>
        <p className="mt-2">
          Data provided by <a href="https://github.com/iptv-org/iptv" target="_blank" rel="noopener noreferrer" className="text-[#0ea5e9] hover:text-white transition-colors">iptv-org</a>
        </p>
      </footer>
    </div>
  );
}
