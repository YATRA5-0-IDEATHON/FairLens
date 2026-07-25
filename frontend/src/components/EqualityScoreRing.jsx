export default function EqualityScoreRing({ score = 84, size = 180, strokeWidth = 14, label = "Overall Equality Index" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color based on score threshold
  const getScoreColor = (s) => {
    if (s >= 80) return "url(#tealGradient)";
    if (s >= 65) return "url(#amberGradient)";
    return "url(#coralGradient)";
  };

  return (
    <div className="equality-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3FA796" />
            <stop offset="100%" stopColor="#2B2E6B" />
          </linearGradient>
          <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6A100" />
            <stop offset="100%" stopColor="#3FA796" />
          </linearGradient>
          <linearGradient id="coralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E85D4E" />
            <stop offset="100%" stopColor="#E6A100" />
          </linearGradient>
        </defs>

        {/* Track Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--neutral-bg)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>

      <div className="equality-ring-inner">
        <div className="equality-score-num">{score}</div>
        <div className="equality-score-label">{label}</div>
      </div>
    </div>
  );
}
