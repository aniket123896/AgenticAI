import Complaint from '../models/Complaint.js';

export const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `CMP-${currentYear}-`;

  // Find the highest sequence number for the current year
  const latestComplaint = await Complaint.findOne({
    complaintId: new RegExp(`^${prefix}`)
  })
    .sort({ complaintId: -1 })
    .lean();

  let nextSequence = 1;
  if (latestComplaint && latestComplaint.complaintId) {
    const parts = latestComplaint.complaintId.split('-');
    if (parts.length === 3) {
      const parsed = parseInt(parts[2], 10);
      if (!isNaN(parsed)) {
        nextSequence = parsed + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
};
