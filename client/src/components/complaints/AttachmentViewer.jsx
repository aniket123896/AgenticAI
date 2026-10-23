import React, { useState } from 'react';
import { Paperclip, FileText, Image as ImageIcon, ExternalLink, Download, Eye, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';

const AttachmentViewer = ({ attachments = [] }) => {
  const [activeImage, setActiveImage] = useState(null);
  const [imgLoadError, setImgLoadError] = useState(false);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileUrl = (rawUrl, filename = '') => {
    let url = rawUrl || (filename ? `/uploads/${filename}` : '');
    if (!url) return '';

    // Normalize Windows backslashes
    url = url.replace(/\\/g, '/');

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
      const backendBase = apiUrl.replace(/\/api\/?$/, '');
      const pathWithSlash = url.startsWith('/') ? url : `/${url}`;
      return `${backendBase}${pathWithSlash}`;
    }

    return url.startsWith('/') ? url : `/${url}`;
  };

  const handleOpenPreview = (file) => {
    setImgLoadError(false);
    setActiveImage(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 transition-colors">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        Attached Evidence ({attachments.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((file, idx) => {
          const isImage = file.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename || file.originalName || '');
          const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.filename || file.originalName || '');
          const fullUrl = getFileUrl(file.url, file.filename);

          return (
            <div
              key={file._id || idx}
              onClick={() => {
                if (isImage) {
                  handleOpenPreview(file);
                } else {
                  window.open(fullUrl, '_blank', 'noreferrer');
                }
              }}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-md transition cursor-pointer group dark:bg-slate-800/60 dark:border-slate-700/80 dark:hover:bg-slate-800 dark:hover:border-indigo-500/60"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Visual Thumbnail or Icon */}
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative border ${
                    isImage
                      ? 'bg-purple-50 text-purple-600 border-purple-200/60 dark:bg-purple-950/40 dark:border-purple-800/60'
                      : isPdf
                      ? 'bg-rose-50 text-rose-600 border-rose-200/60 dark:bg-rose-950/40 dark:border-rose-800/60'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  {isImage ? (
                    <img
                      src={fullUrl}
                      alt={file.originalName || 'Evidence'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallbackIcon = e.target.parentElement.querySelector('.fallback-icon');
                        if (fallbackIcon) fallbackIcon.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div className={`fallback-icon ${isImage ? 'hidden' : 'block'}`}>
                    {isImage ? (
                      <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p
                    className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition"
                    title={file.originalName || file.filename}
                  >
                    {file.originalName || file.filename}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {isImage ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPreview(file);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 transition"
                    title="Preview Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 transition"
                    title="Open PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Preview Lightbox Modal */}
      {activeImage && (
        <Modal
          isOpen={!!activeImage}
          onClose={() => setActiveImage(null)}
          title={activeImage.originalName || 'Image Evidence Preview'}
          maxWidth="max-w-4xl"
        >
          <div className="flex flex-col items-center justify-center p-2">
            <div className="relative w-full flex items-center justify-center bg-slate-950/5 dark:bg-slate-950/60 rounded-2xl p-4 min-h-[300px] border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              {!imgLoadError ? (
                <img
                  src={getFileUrl(activeImage.url, activeImage.filename)}
                  alt={activeImage.originalName || 'Attachment Preview'}
                  className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
                  onError={() => setImgLoadError(true)}
                />
              ) : (
                <div className="text-center py-10 px-4">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Unable to display image preview</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                    The image file may have been moved or cannot be previewed directly in browser.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 w-full">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {activeImage.originalName || activeImage.filename}
                </span>{' '}
                {activeImage.size ? `(${formatFileSize(activeImage.size)})` : ''}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getFileUrl(activeImage.url, activeImage.filename)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in New Tab
                </a>
                <a
                  href={getFileUrl(activeImage.url, activeImage.filename)}
                  target="_blank"
                  rel="noreferrer"
                  download={activeImage.originalName || activeImage.filename}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttachmentViewer;
