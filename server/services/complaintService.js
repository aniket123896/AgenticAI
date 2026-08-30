import ComplaintHistory from '../models/ComplaintHistory.js';

export const logComplaintHistory = async ({
  complaintId,
  action,
  performedBy,
  previousValue = '',
  newValue = '',
  notes = ''
}) => {
  try {
    await ComplaintHistory.create({
      complaint: complaintId,
      action,
      performedBy,
      previousValue,
      newValue,
      notes
    });
  } catch (error) {
    console.error('Failed to log complaint history:', error);
  }
};

export const isValidStatusTransition = (currentStatus, newStatus, role = 'admin') => {
  if (currentStatus === newStatus) return true;

  if (role === 'student') {
    // Students can ONLY transition from Resolved to Closed
    return currentStatus === 'Resolved' && newStatus === 'Closed';
  }

  // Admin allowed workflow:
  // Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Closed
  // Admin may also move backward with warning/confirmation
  const allStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
  return allStatuses.includes(newStatus);
};
