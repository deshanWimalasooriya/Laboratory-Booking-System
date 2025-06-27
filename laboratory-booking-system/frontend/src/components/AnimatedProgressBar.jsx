import React, { useEffect, useState } from "react";
import "../styles/AnimatedProgressBar.css"; // Import your CSS styles

const Circle = ({ label, count, total, color, delay }) => {
  const [progress, setProgress] = useState(0);
  const radius = 48;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = total ? (count / total) * 100 : 0;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percent), delay);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="circle-progress-container">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="circle-progress"
      >
        <circle
          stroke="#222c3d"
          fill="#fff"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference + " " + circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="22"
          fill="#222c3d"
          fontWeight="bold"
        >
          {count}
        </text>
      </svg>
      <div className="circle-label">{label}</div>
    </div>
  );
};

const AnimatedCircleProgressBar = ({ pending, approved, rejected }) => {
  const total = pending + approved + rejected;
  return (
    <div className="circle-progress-dashboard">
      <Circle
        label="Pending"
        count={pending}
        total={total}
        color="#2563eb"
        delay={100}
      />
      <Circle
        label="Approved"
        count={approved}
        total={total}
        color="#0ea965"
        delay={400}
      />
      <Circle
        label="Rejected"
        count={rejected}
        total={total}
        color="#e11d48"
        delay={700}
      />
    </div>
  );
};

export default AnimatedCircleProgressBar;
