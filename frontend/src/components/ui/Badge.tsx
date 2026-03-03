import React from 'react';

type BadgeStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';

interface BadgeProps {
  status: BadgeStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const styles = {
    saved: 'bg-gray-100 text-gray-700 border-gray-300',
    applied: 'bg-blue-100 text-blue-700 border-blue-300',
    interviewing: 'bg-purple-100 text-purple-700 border-purple-300',
    offer: 'bg-green-100 text-green-700 border-green-300',
    rejected: 'bg-red-100 text-red-700 border-red-300',
    withdrawn: 'bg-orange-100 text-orange-700 border-orange-300',
  };

  const labels = {
    saved: 'Saved',
    applied: 'Applied',
    interviewing: 'Interviewing',
    offer: 'Offer',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${styles[status]}
        ${className}
      `}
    >
      {labels[status]}
    </span>
  );
};