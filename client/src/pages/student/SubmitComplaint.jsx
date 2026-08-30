import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { useToast } from '../../hooks/useToast';
import { CATEGORIES } from '../../utils/constants';
import {
  FilePlus2,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const SubmitComplaint = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Classroom',
    location: '',
    priority: 'Medium',
    description: ''
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validExtensions = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    const validFiles = [];
    for (const file of selectedFiles) {
      if (!validExtensions.includes(file.type)) {
        error(`"${file.name}" is not a supported file type. Only JPG, PNG, and PDF files are allowed.`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        error(`"${file.name}" exceeds the 5 MB maximum size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (files.length + validFiles.length > 5) {
      error('You can upload a maximum of 5 attachments.');
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim() || formData.title.trim().length < 5 || formData.title.trim().length > 100) {
      errs.title = 'Title must be between 5 and 100 characters.';
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      errs.description = 'Please provide a detailed description (minimum 20 characters).';
    }
    if (!formData.location.trim()) {
      errs.location = 'Please specify the exact location / room / block.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('location', formData.location.trim());
      data.append('priority', formData.priority);
      data.append('description', formData.description.trim());

      files.forEach((file) => {
        data.append('attachments', file);
      });

      const res = await complaintService.createComplaint(data);
      const createdComplaint = res.data;

      success(`Complaint submitted successfully! Ticket ID: ${createdComplaint.complaintId}`);
      navigate(`/student/complaints/${createdComplaint._id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit complaint. Please check the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in dark:text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/student/dashboard"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">Submit New Complaint</h1>
            <p className="text-xs text-slate-500 dark:text-slate-300">Report an infrastructure, maintenance, or academic issue</p>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Complaint Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
              Complaint Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Wi-Fi router not working in Computer Lab 2"
              className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-indigo-600 transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                errors.title ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
                Specific Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Mechanical Block - Room 304"
                className={`w-full px-4 py-2.5 text-xs rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-indigo-600 transition dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                  errors.location ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
                }`}
              />
              {errors.location && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
              Impact / Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'Low', desc: 'Minor issue / cosmetic' },
                { value: 'Medium', desc: 'Normal issue affecting use' },
                { value: 'High', desc: 'Urgent issue / major disruption' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col items-center text-center ${
                    formData.priority === opt.value
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-100'
                      : 'border-slate-200 bg-slate-50/30 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={formData.priority === opt.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold">{opt.value}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide complete details regarding the problem, when it started, and any symptoms observed..."
              className={`w-full p-3.5 text-xs rounded-xl border bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-indigo-600 transition resize-none dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                errors.description ? 'border-rose-400 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 dark:text-slate-400">
              <span>Minimum 20 characters</span>
              <span>{formData.description.length} characters</span>
            </div>
            {errors.description && (
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">{errors.description}</p>
            )}
          </div>

          {/* File Uploads Section */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 dark:text-slate-200">
              Evidence Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition bg-slate-50/40 dark:border-slate-600 dark:bg-slate-800/40">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  Click to upload photos or PDF documents
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 dark:text-slate-400">
                  JPG, PNG, or PDF up to 5 MB each (Max 5 files)
                </p>
              </label>
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/student/dashboard"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting Complaint...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
