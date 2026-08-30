import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Star } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, onSubmitFeedback, isLoading = false }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitFeedback({ rating, comment: comment.trim() });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Resolution & Support" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          How satisfied are you with the resolution provided for your complaint? Your rating helps maintain college service standards.
        </p>

        {/* Star Rating Selector */}
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-800">
            {rating === 5 && '⭐️ Excellent Experience'}
            {rating === 4 && '👍 Good / Satisfied'}
            {rating === 3 && '👌 Average Resolution'}
            {rating === 2 && '👎 Below Expectations'}
            {rating === 1 && '⚠️ Poor Resolution'}
          </span>
        </div>

        {/* Feedback Comment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Feedback Comments (Optional)
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share any additional feedback about the timing or quality of the fix..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
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
            disabled={isLoading}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FeedbackModal;
