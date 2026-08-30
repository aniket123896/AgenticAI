import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading data...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mb-4 shadow-inner">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-600 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
      {text && <p className="text-xs font-medium text-slate-500">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
