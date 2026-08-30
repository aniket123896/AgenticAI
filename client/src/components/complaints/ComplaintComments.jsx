import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { complaintService } from '../../services/complaintService';
import { formatDate } from '../../utils/formatters';
import { MessageSquare, Send, ShieldCheck, User } from 'lucide-react';

const ComplaintComments = ({ complaintId, comments = [], onCommentAdded }) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await complaintService.addComment(complaintId, commentText.trim());
      success('Comment added successfully');
      setCommentText('');
      if (onCommentAdded) {
        onCommentAdded(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-indigo-600" />
        Activity Updates & Comments ({comments.length})
      </h3>

      {/* Comment history feed */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl">
            No updates posted yet on this complaint.
          </p>
        ) : (
          comments.map((item) => {
            const isAuthorAdmin = item.user?.role === 'admin';
            return (
              <div
                key={item._id}
                className={`p-4 rounded-xl border transition ${
                  isAuthorAdmin
                    ? 'bg-indigo-50/40 border-indigo-100'
                    : 'bg-slate-50/70 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                        isAuthorAdmin ? 'bg-indigo-600' : 'bg-slate-500'
                      }`}
                    >
                      {item.user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {item.user?.name || 'User'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isAuthorAdmin
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isAuthorAdmin ? 'Admin Team' : 'Student'}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pl-8">
                  {item.comment}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          {isAdmin ? 'Post Administrative Update / Notes' : 'Add a Remark'}
        </label>
        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={
            isAdmin
              ? 'Write an update for the student and assignment logs...'
              : 'Write a question or note regarding this complaint...'
          }
          className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting...' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintComments;
