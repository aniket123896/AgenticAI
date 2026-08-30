import React, { useState } from 'react';
import { Paperclip, FileText, Image as ImageIcon, ExternalLink, Download, Eye } from 'lucide-react';
import Modal from '../common/Modal';

const AttachmentViewer = ({ attachments = [] }) => {
  const [activeImage, setActiveImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-indigo-600" />
        Attached Evidence ({attachments.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {attachments.map((file, idx) => {
          const isImage = file.mimetype?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.filename);
          const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.filename);
          const fullUrl = getFileUrl(file.url);

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isImage
                      ? 'bg-purple-100 text-purple-600'
                      : isPdf
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate" title={file.originalName || file.filename}>
                    {file.originalName || file.filename}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {isImage ? (
                  <button
                    type="button"
                    onClick={() => setActiveImage(file)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Preview Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                ) : (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
          title={activeImage.originalName || 'Image Preview'}
          maxWidth="max-w-3xl"
        >
          <div className="flex flex-col items-center justify-center p-2">
            <img
              src={getFileUrl(activeImage.url)}
              alt={activeImage.originalName || 'Attachment'}
              className="max-h-[70vh] w-auto rounded-xl object-contain shadow-md"
            />
            <div className="mt-4 flex items-center justify-end w-full">
              <a
                href={getFileUrl(activeImage.url)}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
              >
                <Download className="w-4 h-4" />
                Download Original Image
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AttachmentViewer;
