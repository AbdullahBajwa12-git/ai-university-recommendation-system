import React from 'react';

export const AirplaneIcon = ({ className = "", ...props }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Top-down passenger airplane silhouette pointing RIGHT (0 degrees) */}
      <path d="M21 10.5C22 10.5 22.5 11 22.5 12C22.5 13 22 13.5 21 13.5L14 13.5L9.5 21L7.5 21L10.5 13.5L4 13.5L2 15.5L1 15.5L2 12L1 8.5L2 8.5L4 10.5L10.5 10.5L7.5 3L9.5 3L14 10.5L21 10.5Z" />
    </svg>
  );
};
