import { useTheme } from '@mui/material';
import React from 'react';

const Logo: React.FC = () => {
  const theme = useTheme();
  const color = theme.palette.primary.main;

  return (
    <svg
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 'auto', height: '100%' }}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Left bracket */}
      <path
        d="M12 22 L6 22 Q2 22 2 26 L2 74 Q2 78 6 78 L12 78"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Document pages — stacked */}
      <rect x="16" y="28" width="28" height="36" rx="3" fill="none" stroke="url(#logoGrad)" strokeWidth="2" opacity="0.35" />
      <rect x="20" y="24" width="28" height="36" rx="3" fill="url(#logoGrad)" opacity="0.15" stroke="url(#logoGrad)" strokeWidth="2" />

      {/* Text lines on front page */}
      <line x1="25" y1="33" x2="43" y2="33" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="39" x2="40" y2="39" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="25" y1="45" x2="42" y2="45" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="25" y1="51" x2="37" y2="51" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Right bracket */}
      <path
        d="M52 22 L58 22 Q62 22 62 26 L62 74 Q62 78 58 78 L52 78"
        fill="none"
        stroke="url(#logoGrad)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Logotype */}
      <text
        x="74"
        y="62"
        fontFamily="'Inter', 'Helvetica', sans-serif"
        fontSize="26"
        fontWeight="600"
        fill={color}
        letterSpacing="0.5"
      >
        browsemark
      </text>
    </svg>
  );
};

export default Logo;
