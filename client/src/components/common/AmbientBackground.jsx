import React from 'react';

const AmbientBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-blob-1 dark:bg-indigo-600/10" />
      <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-purple-500/15 rounded-full blur-3xl animate-blob-2 dark:bg-purple-600/10" />
      <div className="absolute -bottom-32 left-1/3 w-[28rem] h-[28rem] bg-sky-400/15 rounded-full blur-3xl animate-blob-3 dark:bg-sky-500/10" />
      
      {/* Subtle Ambient Grid Layer */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-15" />
    </div>
  );
};

export default AmbientBackground;
