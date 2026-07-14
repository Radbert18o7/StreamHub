import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

export function Toast({ message, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 50, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-50 flex items-center p-4 mb-4 text-gray-500 bg-zinc-900 rounded-lg shadow-xl shadow-black/50 border border-zinc-700 max-w-md w-full"
          role="alert"
        >
          <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-500 bg-blue-100/10 rounded-lg">
            <Info size={18} />
          </div>
          <div className="ml-3 text-sm font-normal text-white">{message}</div>
          <button 
            type="button" 
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-white rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-zinc-800 inline-flex h-8 w-8 items-center justify-center" 
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
