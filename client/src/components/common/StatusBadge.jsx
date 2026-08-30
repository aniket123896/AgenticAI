import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';

const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Submitted;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.badge} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
