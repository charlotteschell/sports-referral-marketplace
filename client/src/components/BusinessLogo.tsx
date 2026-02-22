import { useState } from "react";
import { Bike, Mountain, Snowflake, Compass, Star, Building2 } from "lucide-react";

const sportIcons: Record<string, (size: string) => React.ReactNode> = {
  cycling: (s) => <Bike className={s} />,
  running: (s) => <Mountain className={s} />,
  "trail-running": (s) => <Mountain className={s} />,
  snowsports: (s) => <Snowflake className={s} />,
  "sport-vacations": (s) => <Compass className={s} />,
};

interface BusinessLogoProps {
  logoUrl?: string | null;
  businessName: string;
  sportSlug?: string;
  /** Tailwind size classes for the container, e.g. "w-12 h-12" */
  size?: string;
  /** Tailwind size classes for the icon inside, e.g. "w-6 h-6" */
  iconSize?: string;
  /** Extra classes for the container */
  className?: string;
  /** Whether to use rounded-xl instead of rounded-lg */
  roundedXl?: boolean;
}

/**
 * Renders a business logo with consistent fallback:
 * - If logoUrl exists and loads → show the image with a subtle bg for white logos
 * - If logoUrl fails to load or is missing → show sport icon or first letter placeholder
 */
export default function BusinessLogo({
  logoUrl,
  businessName,
  sportSlug,
  size = "w-12 h-12",
  iconSize = "w-6 h-6",
  className = "",
  roundedXl = false,
}: BusinessLogoProps) {
  const [imgError, setImgError] = useState(false);

  const rounded = roundedXl ? "rounded-xl" : "rounded-lg";
  const showImage = logoUrl && !imgError;

  if (showImage) {
    return (
      <div className={`${size} ${rounded} overflow-hidden bg-white/10 flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={logoUrl}
          alt={businessName}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: sport icon or first letter
  const getIcon = sportIcons[sportSlug || ""];
  return (
    <div className={`${size} ${rounded} bg-[oklch(0.55_0.15_45)]/10 flex items-center justify-center text-[oklch(0.55_0.15_45)] shrink-0 ${className}`}>
      {getIcon ? (
        getIcon(iconSize)
      ) : businessName ? (
        <span className={`font-bold text-[oklch(0.55_0.15_45)]`} style={{ fontSize: parseInt(iconSize.replace(/\D/g, "")) * 3 || 18 }}>
          {businessName.charAt(0).toUpperCase()}
        </span>
      ) : (
        <Building2 className={iconSize} />
      )}
    </div>
  );
}
