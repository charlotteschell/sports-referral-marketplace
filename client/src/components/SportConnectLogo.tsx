interface SportConnectLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function SportConnectLogo({ className = "w-11 h-11", style }: SportConnectLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark brown rounded background */}
      <rect width="100" height="100" rx="14" fill="#2a1f14" />

      {/* Circular referral arrows - thinner strokes, filling more space */}
      <g transform="translate(50, 48)">
        {/* Top-right arrow arc */}
        <path
          d="M 4,-32 A 33,33 0 0 1 30,-12"
          fill="none"
          stroke="#D4A843"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Top-right arrowhead */}
        <polygon
          points="28,-18 36,-10 24,-8"
          fill="#D4A843"
        />

        {/* Bottom-left arrow arc */}
        <path
          d="M -4,32 A 33,33 0 0 1 -30,12"
          fill="none"
          stroke="#D4A843"
          strokeWidth="5.5"
          strokeLinecap="round"
        />
        {/* Bottom-left arrowhead */}
        <polygon
          points="-28,18 -36,10 -24,8"
          fill="#D4A843"
        />

        {/* Mountain - larger, fills more of the circle */}
        <path
          d="M -24,18 L -6,-16 L -2,-10 L 4,-18 L 10,-10 L 14,-16 L 28,18 Z"
          fill="#D4A843"
        />
        {/* Snow line detail on mountain */}
        <path
          d="M -6,-16 L -2,-10 L 4,-18 L 10,-10 L 14,-16"
          fill="none"
          stroke="#2a1f14"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
