import { calculateStrokeDashOffset } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
  gradient?: boolean;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({
  percentage,
  size = 96,
  strokeWidth = 6,
  circleColor = "#333333",
  progressColor = "#00E5FF",
  gradient = false,
  label,
  sublabel
}: ProgressRingProps) {
  const radius = (size / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = calculateStrokeDashOffset(percentage, circumference);
  
  const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="progress-ring" width={size} height={size}>
          {gradient && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#AEEA00" />
              </linearGradient>
            </defs>
          )}
          
          {/* Background circle */}
          <circle 
            className="progress-ring__circle"
            stroke={circleColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          
          {/* Progress circle */}
          <circle 
            className="progress-ring__circle"
            stroke={gradient ? `url(#${gradientId})` : progressColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-bold text-white">{percentage}%</span>
        </div>
      </div>
      
      {label && <span className="text-sm text-gray-300 font-poppins mt-2">{label}</span>}
      {sublabel && <span className="text-xs text-gray-400 font-poppins">{sublabel}</span>}
    </div>
  );
}
