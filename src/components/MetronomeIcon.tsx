import React from 'react';

// A mechanical metronome (open pyramid body, the pendulum swinging out to the right), drawn like the lucide icons: 24×24, stroke = currentColor.
// lucide-react has no metronome icon.
export const MetronomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* body with an opening on the right, where the pendulum swings out (user's sketch, test 0.6.1) */}
    <path d="M14.3 6.3 13.5 3H8.6L5 21h13.5l-1.4-5.8" />
    {/* pendulum with its weight */}
    <path d="M10 18.5 17 7.3" />
    <path d="m16.6 5.4 1.5-.9 1.3 1.1-.5 1.6-1.7.3z" fill="currentColor" />
  </svg>
);
