import React from "react";

const DashedCircularProgress = ({ percentage, size = 150, strokeWidth = 18 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashArray = `0.9, ${circumference / 40}`;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF3D00" />   {/* Red */}
          <stop offset="50%" stopColor="#FFA726" />  {/* Orange */}
          <stop offset="100%" stopColor="#4CAF50" /> {/* Green */}
        </linearGradient>
      </defs>

      {/* Background Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E0E0E0"
        strokeWidth={strokeWidth}
        fill="none"
      />

      {/* Dashed Progress Circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="url(#progressGradient)"  // ✅ Gradient Color
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} // ✅ Start from top
      />

      {/* Percentage Text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size / 6}
        fill="#333"
        fontWeight="bold"
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default DashedCircularProgress;
