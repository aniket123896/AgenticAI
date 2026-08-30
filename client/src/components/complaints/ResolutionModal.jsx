import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2 } from 'lucide-react';

const ResolutionModal = ({ isOpen, onClose, onResolve, complaintId, isLoading = false }) => {
  const [resolutionText, setResolutionText] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolutionText.trim() || resolutionText.trim().length < 10) {
      setValidationError('Please provide detailed resolution notes (at least 10 characters).');
      return;
    }
    setValidationError('');
    onResolve(resolutionText.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resolve Complaint" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>
            Resolving this complaint will notify the student and allow them to verify the fix, close the complaint, and leave feedback.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Resolution Details & Actions Taken <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            value={resolutionText}
            onChange={(e) => {
              setResolutionText(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="Describe what work was completed, parts replaced, or actions taken to resolve the student's issue..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
          {validationError && (
            <p className="text-[11px] text-rose-600 font-medium mt-1">{validationError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !resolutionText.trim()}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Resolving...' : 'Confirm Resolution'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResolutionModal;
