import React from 'react';
import { PRIORITY_CONFIG } from '../../utils/constants';
import { AlertCircle, ShieldAlert, Flag } from 'lucide-react';

const PriorityBadge = ({ priority, size = 'md', showIcon = true, className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3.5 py-1.5 font-medium'
  };

  const renderIcon = () => {
    if (!showIcon) return null;
    if (priority === 'Critical') {
      return <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />;
    }
    if (priority === 'High') {
      return <AlertCircle className="w-3.5 h-3.5 text-orange-600" />;
    }
    return <Flag className="w-3 h-3 opacity-70" />;
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${config.badge} ${sizeClasses[size]} ${className}`}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
